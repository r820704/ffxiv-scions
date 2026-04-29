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
/** Track the ts we posted for each claim so we can compare incoming claims fairly. */
const myClaimTs = new Map<string, number>(); // id -> ts we posted for that id

function getChannel(): BroadcastChannel | null {
  if (channel) return channel;
  try {
    // Channel is shared with useReminders provider. We handle 'fire-claim'/'fired';
    // the provider handles 'added'/'removed'/'updated'. Type-dispatch keeps them isolated.
    channel = new BroadcastChannel(REMINDER_BROADCAST_NAME);
    channel.addEventListener('message', (ev: MessageEvent) => {
      const data = ev.data as { type?: string; id?: string; ts?: number } | null;
      if (!data || typeof data.id !== 'string') return;
      if (data.type === 'fire-claim' && typeof data.ts === 'number') {
        const mine = myClaimTs.get(data.id);
        if (mine === undefined) {
          // Not our claim id (we never scheduled this) — ignore
          return;
        }
        // Only yield if the competing tab posted a claim with ts <= ours.
        // BroadcastChannel does not echo to the sender, so we only see other tabs' claims.
        if (data.ts <= mine) {
          lostClaims.add(data.id);
        }
      } else if (data.type === 'fired') {
        lostClaims.add(data.id); // already fired by someone — always yield
      }
    });
  } catch {
    channel = null;
  }
  return channel;
}

export function closeChannel(): void {
  channel?.close();
  channel = null;
}

export function scheduleReminder(reminder: Reminder, handlers: ScheduleHandlers): void {
  unscheduleReminder(reminder.id);

  const fireAt = reminder.targetMs - REMINDER_LEAD_MS;
  const delay = fireAt - Date.now();
  if (delay <= 0) return;

  const timeoutId = setTimeout(() => {
    claimAndFire(reminder, handlers).catch((err) => {
      console.error('[notification-scheduler] claimAndFire failed:', err);
    });
  }, delay);

  scheduled.set(reminder.id, { timeoutId, reminder, handlers });
}

async function claimAndFire(
  reminder: Reminder,
  handlers: ScheduleHandlers,
): Promise<void> {
  scheduled.delete(reminder.id);
  lostClaims.delete(reminder.id);

  const myTs = Date.now();
  myClaimTs.set(reminder.id, myTs);
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: 'fire-claim', id: reminder.id, ts: myTs });
  }

  await new Promise<void>((resolve) => setTimeout(resolve, CLAIM_WINDOW_MS));

  if (lostClaims.has(reminder.id)) {
    lostClaims.delete(reminder.id);
    myClaimTs.delete(reminder.id);
    return;
  }

  myClaimTs.delete(reminder.id);

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
  myClaimTs.clear();
  closeChannel();
}
