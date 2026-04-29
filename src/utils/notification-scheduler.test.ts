import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import {
  scheduleReminder,
  unscheduleReminder,
  clearAllSchedules,
  closeChannel,
  type ScheduleHandlers,
} from './notification-scheduler';
import type { Reminder } from '@/types/reminder';
import { REMINDER_LEAD_MS } from '@/types/reminder';

function makeReminder(partial: Partial<Reminder> = {}): Reminder {
  return {
    id: partial.id ?? 'r1',
    zone: partial.zone ?? 'Eureka Anemos',
    weather: partial.weather ?? 'Gales',
    targetMs: partial.targetMs ?? Date.now() + 5 * 60_000,
    recurring: partial.recurring ?? false,
    source: partial.source ?? 'm9-zone-hit',
    nmName: partial.nmName,
    createdAt: 0,
  };
}

describe('scheduleReminder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearAllSchedules();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules at targetMs - REMINDER_LEAD_MS', async () => {
    const now = Date.now();
    const r = makeReminder({ targetMs: now + 5 * 60_000 });
    const fire = vi.fn();
    const handlers: ScheduleHandlers = {
      onFire: fire,
      onRecurringRearm: vi.fn(),
    };
    scheduleReminder(r, handlers);

    await vi.advanceTimersByTimeAsync(5 * 60_000 - REMINDER_LEAD_MS - 100);
    expect(fire).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);
    // After lead time hits, claim window (50ms) needs to elapse before fire
    await vi.advanceTimersByTimeAsync(60);
    expect(fire).toHaveBeenCalledTimes(1);
    expect(fire).toHaveBeenCalledWith(r);
  });

  it('does not schedule if firing time has already passed', () => {
    const r = makeReminder({ targetMs: Date.now() - 10_000 });
    const fire = vi.fn();
    scheduleReminder(r, { onFire: fire, onRecurringRearm: vi.fn() });
    vi.advanceTimersByTime(60_000);
    expect(fire).not.toHaveBeenCalled();
  });

  it('unscheduleReminder cancels a pending timer', () => {
    const r = makeReminder({ targetMs: Date.now() + 5 * 60_000 });
    const fire = vi.fn();
    scheduleReminder(r, { onFire: fire, onRecurringRearm: vi.fn() });
    unscheduleReminder(r.id);
    vi.advanceTimersByTime(10 * 60_000);
    expect(fire).not.toHaveBeenCalled();
  });

  it('recurring reminder: after fire, calls onRecurringRearm with reminder', async () => {
    const r = makeReminder({ recurring: true, targetMs: Date.now() + 5 * 60_000 });
    const rearm = vi.fn();
    scheduleReminder(r, { onFire: vi.fn(), onRecurringRearm: rearm });
    await vi.advanceTimersByTimeAsync(5 * 60_000 - REMINDER_LEAD_MS);
    await vi.advanceTimersByTimeAsync(60);
    expect(rearm).toHaveBeenCalledWith(r);
  });

  it('one-shot reminder: does NOT call onRecurringRearm', async () => {
    const r = makeReminder({ recurring: false, targetMs: Date.now() + 5 * 60_000 });
    const rearm = vi.fn();
    scheduleReminder(r, { onFire: vi.fn(), onRecurringRearm: rearm });
    await vi.advanceTimersByTimeAsync(5 * 60_000 - REMINDER_LEAD_MS);
    await vi.advanceTimersByTimeAsync(60);
    expect(rearm).not.toHaveBeenCalled();
  });
});

describe('multi-tab claim protocol (BroadcastChannel)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearAllSchedules();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires when no other tab claims within window', async () => {
    const r = makeReminder({ targetMs: Date.now() + 5 * 60_000 });
    const fire = vi.fn();
    scheduleReminder(r, { onFire: fire, onRecurringRearm: vi.fn() });

    await vi.advanceTimersByTimeAsync(5 * 60_000 - REMINDER_LEAD_MS);
    await vi.advanceTimersByTimeAsync(60);
    expect(fire).toHaveBeenCalled();
  });

  it('does NOT fire if another tab claims with smaller ts during claim window', async () => {
    const r = makeReminder({ targetMs: Date.now() + 5 * 60_000 });
    const fire = vi.fn();
    scheduleReminder(r, { onFire: fire, onRecurringRearm: vi.fn() });

    await vi.advanceTimersByTimeAsync(5 * 60_000 - REMINDER_LEAD_MS);
    // Inject a smaller-ts claim during the claim window
    const ch = new BroadcastChannel('eureka-weather-reminders-bc');
    ch.postMessage({ type: 'fire-claim', id: r.id, ts: Date.now() - 1000 });

    await vi.advanceTimersByTimeAsync(60);
    expect(fire).not.toHaveBeenCalled();
    ch.close();
  });

  it('DOES fire if competing tab claims with larger ts (we win)', async () => {
    const r = makeReminder({ targetMs: Date.now() + 5 * 60_000 });
    const fire = vi.fn();
    scheduleReminder(r, { onFire: fire, onRecurringRearm: vi.fn() });

    await vi.advanceTimersByTimeAsync(5 * 60_000 - REMINDER_LEAD_MS);
    // Inject a larger-ts claim — we should still win
    const ch = new BroadcastChannel('eureka-weather-reminders-bc');
    ch.postMessage({ type: 'fire-claim', id: r.id, ts: Date.now() + 5000 });

    await vi.advanceTimersByTimeAsync(60);
    expect(fire).toHaveBeenCalled();
    ch.close();
  });

  afterAll(() => {
    closeChannel();
  });
});
