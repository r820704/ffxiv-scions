import type { Reminder } from '@/types/reminder';
import { REMINDER_BROADCAST_NAME, REMINDER_LEAD_MS } from '@/types/reminder';

export interface ScheduleHandlers {
  /** Called once when the timer fires AND we won the multi-tab claim. */
  onFire: (reminder: Reminder) => void;
  /** Called after a recurring reminder fires so the caller can re-arm. */
  onRecurringRearm: (reminder: Reminder) => void;
}

interface ScheduledEntry {
  timeoutId: ReturnType<typeof setTimeout>;
  reminder: Reminder;
  handlers: ScheduleHandlers;
}

const CLAIM_WINDOW_MS = 50;

const scheduled = new Map<string, ScheduledEntry>();
let channel: BroadcastChannel | null = null;
const lostClaims = new Set<string>();

function getChannel(): BroadcastChannel | null {
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(REMINDER_BROADCAST_NAME);
    channel.addEventListener('message', (ev: MessageEvent) => {
      const data = ev.data as { type?: string; id?: string; ts?: number } | null;
      if (!data || typeof data.id !== 'string') return;
      if (data.type === 'fire-claim' && typeof data.ts === 'number') {
        lostClaims.add(data.id);
      } else if (data.type === 'fired') {
        lostClaims.add(data.id);
      }
    });
  } catch {
    channel = null;
  }
  return channel;
}

export function scheduleReminder(reminder: Reminder, handlers: ScheduleHandlers): void {
  unscheduleReminder(reminder.id);

  const fireAt = reminder.targetMs - REMINDER_LEAD_MS;
  const delay = fireAt - Date.now();
  if (delay <= 0) return;

  const timeoutId = setTimeout(() => {
    void claimAndFire(reminder, handlers);
  }, delay);

  scheduled.set(reminder.id, { timeoutId, reminder, handlers });
}

async function claimAndFire(
  reminder: Reminder,
  handlers: ScheduleHandlers,
): Promise<void> {
  scheduled.delete(reminder.id);
  lostClaims.delete(reminder.id);

  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: 'fire-claim', id: reminder.id, ts: Date.now() });
  }

  await new Promise<void>((resolve) => setTimeout(resolve, CLAIM_WINDOW_MS));

  if (lostClaims.has(reminder.id)) {
    lostClaims.delete(reminder.id);
    return;
  }

  if (ch) {
    ch.postMessage({ type: 'fired', id: reminder.id });
  }

  handlers.onFire(reminder);
  if (reminder.recurring) {
    handlers.onRecurringRearm(reminder);
  }
}

export function unscheduleReminder(id: string): void {
  const entry = scheduled.get(id);
  if (!entry) return;
  clearTimeout(entry.timeoutId);
  scheduled.delete(id);
}

export function clearAllSchedules(): void {
  for (const entry of scheduled.values()) {
    clearTimeout(entry.timeoutId);
  }
  scheduled.clear();
  lostClaims.clear();
}
