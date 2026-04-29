import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemindersProvider, useReminders } from './useReminders';
import {
  REMINDER_SOFT_CAP,
  REMINDER_STORAGE_KEY,
  type Reminder,
} from '@/types/reminder';

function wrapper({ children }: { children: ReactNode }) {
  return <RemindersProvider>{children}</RemindersProvider>;
}

function makeReminder(partial: Partial<Reminder> = {}): Reminder {
  return {
    id: partial.id ?? crypto.randomUUID(),
    zone: partial.zone ?? 'Eureka Anemos',
    weather: partial.weather ?? 'Gales',
    targetMs: partial.targetMs ?? Date.now() + 5 * 60_000,
    recurring: partial.recurring ?? false,
    source: partial.source ?? 'm9-zone-hit',
    nmName: partial.nmName,
    createdAt: partial.createdAt ?? Date.now(),
  };
}

describe('useReminders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty list', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    expect(result.current.reminders).toEqual([]);
  });

  it('add() appends and persists to localStorage', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    const r = makeReminder();
    act(() => {
      result.current.add(r);
    });
    expect(result.current.reminders).toEqual([r]);
    const persisted = JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) ?? '[]');
    expect(persisted).toEqual([r]);
  });

  it('remove() drops by id and persists', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    const r = makeReminder();
    act(() => {
      result.current.add(r);
    });
    act(() => {
      result.current.remove(r.id);
    });
    expect(result.current.reminders).toEqual([]);
    expect(localStorage.getItem(REMINDER_STORAGE_KEY)).toBe('[]');
  });

  it('toggleRecurring flips recurring flag', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    const r = makeReminder({ recurring: false });
    act(() => {
      result.current.add(r);
    });
    act(() => {
      result.current.toggleRecurring(r.id);
    });
    expect(result.current.reminders[0]?.recurring).toBe(true);
  });

  it('soft cap rejects add when at REMINDER_SOFT_CAP', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    act(() => {
      for (let i = 0; i < REMINDER_SOFT_CAP; i++) {
        result.current.add(makeReminder({ id: `r${i}` }));
      }
    });
    expect(result.current.reminders).toHaveLength(REMINDER_SOFT_CAP);

    let outcome: ReturnType<typeof result.current.add> | undefined;
    act(() => {
      outcome = result.current.add(makeReminder({ id: 'overflow' }));
    });
    expect(outcome).toEqual({ ok: false, reason: 'cap' });
    expect(result.current.reminders).toHaveLength(REMINDER_SOFT_CAP);
  });

  it('add returns {ok:false, reason:"unsupported"} when Notification API absent', () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    delete (globalThis as { Notification?: unknown }).Notification;
    const { result } = renderHook(() => useReminders(), { wrapper });
    let outcome: ReturnType<typeof result.current.add> | undefined;
    act(() => {
      outcome = result.current.add(makeReminder());
    });
    expect(outcome).toEqual({ ok: false, reason: 'unsupported' });
    (globalThis as { Notification?: unknown }).Notification = original;
  });

  it('mount: hydrates from localStorage', () => {
    const r = makeReminder({ targetMs: Date.now() + 5 * 60_000 });
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([r]));
    const { result } = renderHook(() => useReminders(), { wrapper });
    expect(result.current.reminders).toEqual([r]);
  });

  it('mount: prunes expired one-shot reminders', () => {
    const expired = makeReminder({ id: 'exp', targetMs: Date.now() - 10_000, recurring: false });
    // Must be more than REMINDER_LEAD_MS (90 s) in the future so the new prune boundary keeps it.
    const future = makeReminder({ id: 'fut', targetMs: Date.now() + 5 * 60_000, recurring: false });
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([expired, future]));
    const { result } = renderHook(() => useReminders(), { wrapper });
    expect(result.current.reminders.map((r) => r.id)).toEqual(['fut']);
  });

  it('isFull true when reminders length === cap', () => {
    const list = Array.from({ length: REMINDER_SOFT_CAP }, (_, i) =>
      makeReminder({ id: `r${i}` }),
    );
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(list));
    const { result } = renderHook(() => useReminders(), { wrapper });
    expect(result.current.isFull).toBe(true);
  });

  it('cross-tab "added" message appends to reminders', async () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    expect(result.current.reminders).toHaveLength(0);

    const incoming = makeReminder({ id: 'from-other-tab' });
    const ch = new BroadcastChannel('eureka-weather-reminders-bc');

    await act(async () => {
      ch.postMessage({ type: 'added', reminder: incoming });
      // Allow the channel listener to receive
      await vi.advanceTimersByTimeAsync(10);
    });

    expect(result.current.reminders.map((r) => r.id)).toContain('from-other-tab');
    ch.close();
  });

  it('cross-tab "removed" message drops a reminder by id', async () => {
    const r = makeReminder({ id: 'to-remove' });
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([r]));
    const { result } = renderHook(() => useReminders(), { wrapper });
    expect(result.current.reminders).toHaveLength(1);

    const ch = new BroadcastChannel('eureka-weather-reminders-bc');
    await act(async () => {
      ch.postMessage({ type: 'removed', id: 'to-remove' });
      await vi.advanceTimersByTimeAsync(10);
    });

    expect(result.current.reminders).toHaveLength(0);
    ch.close();
  });

  it('add rejects when target is within REMINDER_MIN_TARGET_OFFSET_MS', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    // 1 minute out — below the 2-minute floor
    const tooSoon = makeReminder({ id: 'too-soon', targetMs: Date.now() + 60_000 });
    let outcome: ReturnType<typeof result.current.add> | undefined;
    act(() => {
      outcome = result.current.add(tooSoon);
    });
    expect(outcome).toEqual({ ok: false, reason: 'too-soon' });
    expect(result.current.reminders).toHaveLength(0);
  });

  it('add accepts when target is exactly at REMINDER_MIN_TARGET_OFFSET_MS boundary or beyond', () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    // 3 minutes out — comfortably beyond the 2-minute floor
    const ok = makeReminder({ id: 'ok', targetMs: Date.now() + 3 * 60_000 });
    let outcome: ReturnType<typeof result.current.add> | undefined;
    act(() => {
      outcome = result.current.add(ok);
    });
    expect(outcome).toEqual({ ok: true });
    expect(result.current.reminders.map((r) => r.id)).toEqual(['ok']);
  });
});
