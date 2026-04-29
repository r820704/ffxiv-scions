import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RemindersHeaderButton from './RemindersHeaderButton';
import { RemindersProvider } from '@/hooks/useReminders';
import { REMINDER_STORAGE_KEY, type Reminder } from '@/types/reminder';

afterEach(cleanup);

function reminder(partial: Partial<Reminder> = {}): Reminder {
  return {
    id: partial.id ?? 'r1',
    zone: partial.zone ?? 'Eureka Anemos',
    weather: partial.weather ?? 'Gales',
    targetMs: partial.targetMs ?? Date.now() + 5 * 60_000,
    recurring: partial.recurring ?? false,
    source: partial.source ?? 'm9-zone-hit',
    createdAt: 0,
  };
}

function renderWith(initial: Reminder[] = []) {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(initial));
  return render(
    <RemindersProvider>
      <RemindersHeaderButton />
    </RemindersProvider>,
  );
}

describe('RemindersHeaderButton', () => {
  it('renders icon with no badge when no reminders', () => {
    localStorage.clear();
    renderWith([]);
    const btn = screen.getByRole('button', { name: /已設提醒/ });
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).not.toMatch(/\d/);
  });

  it('renders badge count when reminders exist', () => {
    renderWith([reminder({ id: 'a' }), reminder({ id: 'b' })]);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens popover on click and lists each reminder', () => {
    renderWith([reminder({ id: 'a', weather: 'Gales' })]);
    fireEvent.click(screen.getByRole('button', { name: /已設提醒/ }));
    expect(screen.getByText(/強風/)).toBeInTheDocument();
  });

  it('clicking ✕ removes a reminder', () => {
    renderWith([reminder({ id: 'a' })]);
    fireEvent.click(screen.getByRole('button', { name: /已設提醒/ }));
    fireEvent.click(screen.getByRole('button', { name: /移除/ }));
    expect(screen.queryByText(/強風/)).not.toBeInTheDocument();
  });

  it('clicking 🔁 toggles recurring', () => {
    renderWith([reminder({ id: 'a', recurring: false })]);
    fireEvent.click(screen.getByRole('button', { name: /已設提醒/ }));
    const recBtn = screen.getByRole('button', { name: /重複/ });
    fireEvent.click(recBtn);
    expect(recBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows unsupported hint when Notification API absent', () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    delete (globalThis as { Notification?: unknown }).Notification;
    renderWith([]);
    fireEvent.click(screen.getByRole('button', { name: /已設提醒/ }));
    expect(screen.getByText(/不支援|主畫面/)).toBeInTheDocument();
    (globalThis as { Notification?: unknown }).Notification = original;
  });
});
