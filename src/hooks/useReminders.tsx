import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  REMINDER_BROADCAST_NAME,
  REMINDER_PERMISSION_ASKED_KEY,
  REMINDER_SOFT_CAP,
  REMINDER_STORAGE_KEY,
  type Reminder,
} from '@/types/reminder';
import {
  buildFocusHash,
  buildNotification,
  computeNextOccurrence,
  isNotificationSupported,
} from '@/utils/notification-engine';
import {
  clearAllSchedules,
  scheduleReminder,
  unscheduleReminder,
} from '@/utils/notification-scheduler';
import { getActiveNmsAt } from '@/data/eureka-nm-data';

export type AddOutcome =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'cap' | 'duplicate' | 'denied' };

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface RemindersContextValue {
  reminders: readonly Reminder[];
  isSupported: boolean;
  permission: PermissionState;
  isFull: boolean;
  add: (reminder: Reminder) => AddOutcome;
  remove: (id: string) => void;
  toggleRecurring: (id: string) => void;
  requestPermission: () => Promise<PermissionState>;
  clearAll: () => void;
}

const Ctx = createContext<RemindersContextValue | null>(null);

function readPermission(): PermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  const p = (globalThis as { Notification?: { permission: NotificationPermission } })
    .Notification?.permission;
  return (p as PermissionState | undefined) ?? 'default';
}

function readStorage(): Reminder[] {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Reminder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(list: readonly Reminder[]): void {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // quota exceeded — silently ignore for v1
  }
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<readonly Reminder[]>(() => {
    // Hydrate + prune in initializer
    const stored = readStorage();
    const now = Date.now();
    const kept: Reminder[] = [];
    for (const r of stored) {
      if (r.targetMs <= now) {
        if (!r.recurring) continue;
        const next = computeNextOccurrence(r.zone, r.weather, now);
        if (next === null) continue;
        kept.push({ ...r, targetMs: next });
      } else {
        kept.push(r);
      }
    }
    if (kept.length !== stored.length || kept.some((k, i) => k !== stored[i])) {
      writeStorage(kept);
    }
    return kept;
  });

  const [permission, setPermission] = useState<PermissionState>(() => readPermission());
  const isSupported = permission !== 'unsupported';

  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;

  const updateAndPersist = useCallback((next: readonly Reminder[]) => {
    remindersRef.current = next;
    setReminders(next);
    writeStorage(next);
  }, []);

  const fire = useCallback((reminder: Reminder) => {
    const N = (globalThis as { Notification?: typeof Notification }).Notification;
    if (!N) return;
    const activeNms = reminder.nmName
      ? [reminder.nmName]
      : getActiveNmsAt(reminder.zone, reminder.weather, reminder.targetMs).map((nm) => nm.nameTw);
    const built = buildNotification(reminder, activeNms);
    const notif = new N(built.title, { body: built.body, tag: built.tag });
    notif.onclick = () => {
      window.focus();
      window.location.hash = buildFocusHash(reminder, reminder.targetMs);
      notif.close();
    };
    if (!reminder.recurring) {
      const next = remindersRef.current.filter((r) => r.id !== reminder.id);
      updateAndPersist(next);
    }
  }, [updateAndPersist]);

  const rearmRecurring = useCallback((reminder: Reminder) => {
    const nextTarget = computeNextOccurrence(reminder.zone, reminder.weather, Date.now());
    if (nextTarget === null) {
      const next = remindersRef.current.filter((r) => r.id !== reminder.id);
      updateAndPersist(next);
      return;
    }
    const updated: Reminder = { ...reminder, targetMs: nextTarget };
    const next = remindersRef.current.map((r) => (r.id === reminder.id ? updated : r));
    updateAndPersist(next);
    scheduleReminder(updated, { onFire: fire, onRecurringRearm: rearmRecurring });
  }, [fire, updateAndPersist]);

  // Mount: schedule timers for hydrated reminders
  useEffect(() => {
    for (const r of remindersRef.current) {
      scheduleReminder(r, { onFire: fire, onRecurringRearm: rearmRecurring });
    }
    return () => {
      clearAllSchedules();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-tab sync via BroadcastChannel
  useEffect(() => {
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(REMINDER_BROADCAST_NAME);
    } catch {
      return;
    }
    const handler = (ev: MessageEvent) => {
      const data = ev.data as { type?: string; reminder?: Reminder; id?: string } | null;
      if (!data) return;
      if (data.type === 'added' && data.reminder) {
        const incoming = data.reminder;
        const exists = remindersRef.current.some((r) => r.id === incoming.id);
        if (!exists) {
          updateAndPersist([...remindersRef.current, incoming]);
          scheduleReminder(incoming, { onFire: fire, onRecurringRearm: rearmRecurring });
        }
      } else if (data.type === 'removed' && data.id) {
        unscheduleReminder(data.id);
        updateAndPersist(remindersRef.current.filter((r) => r.id !== data.id));
      } else if (data.type === 'updated' && data.reminder) {
        const updated = data.reminder;
        unscheduleReminder(updated.id);
        scheduleReminder(updated, { onFire: fire, onRecurringRearm: rearmRecurring });
        updateAndPersist(
          remindersRef.current.map((r) => (r.id === updated.id ? updated : r)),
        );
      }
    };
    ch.addEventListener('message', handler);
    return () => {
      ch?.removeEventListener('message', handler);
      ch?.close();
    };
  }, [fire, rearmRecurring, updateAndPersist]);

  const broadcast = useCallback(
    (msg: { type: 'added' | 'removed' | 'updated'; reminder?: Reminder; id?: string }) => {
      try {
        const ch = new BroadcastChannel(REMINDER_BROADCAST_NAME);
        ch.postMessage(msg);
        ch.close();
      } catch {
        // no-op
      }
    },
    [],
  );

  const add = useCallback<RemindersContextValue['add']>(
    (reminder) => {
      if (!isNotificationSupported()) return { ok: false, reason: 'unsupported' };
      if (remindersRef.current.length >= REMINDER_SOFT_CAP) {
        return { ok: false, reason: 'cap' };
      }
      if (remindersRef.current.some((r) => r.id === reminder.id)) {
        return { ok: false, reason: 'duplicate' };
      }
      const next = [...remindersRef.current, reminder];
      updateAndPersist(next);
      scheduleReminder(reminder, { onFire: fire, onRecurringRearm: rearmRecurring });
      broadcast({ type: 'added', reminder });
      return { ok: true };
    },
    [broadcast, fire, rearmRecurring, updateAndPersist],
  );

  const remove = useCallback(
    (id: string) => {
      unscheduleReminder(id);
      const next = remindersRef.current.filter((r) => r.id !== id);
      updateAndPersist(next);
      broadcast({ type: 'removed', id });
    },
    [broadcast, updateAndPersist],
  );

  const toggleRecurring = useCallback(
    (id: string) => {
      const target = remindersRef.current.find((r) => r.id === id);
      if (!target) return;
      const updated: Reminder = { ...target, recurring: !target.recurring };
      const next = remindersRef.current.map((r) => (r.id === id ? updated : r));
      updateAndPersist(next);
      unscheduleReminder(id);
      scheduleReminder(updated, { onFire: fire, onRecurringRearm: rearmRecurring });
      broadcast({ type: 'updated', reminder: updated });
    },
    [broadcast, fire, rearmRecurring, updateAndPersist],
  );

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!isNotificationSupported()) return 'unsupported';
    const N = (globalThis as { Notification?: typeof Notification }).Notification!;
    if (N.permission === 'granted' || N.permission === 'denied') {
      setPermission(N.permission as PermissionState);
      return N.permission as PermissionState;
    }
    try {
      localStorage.setItem(REMINDER_PERMISSION_ASKED_KEY, '1');
    } catch {
      // ignore
    }
    const p = await N.requestPermission();
    setPermission(p as PermissionState);
    return p as PermissionState;
  }, []);

  const clearAll = useCallback(() => {
    for (const r of remindersRef.current) {
      unscheduleReminder(r.id);
      broadcast({ type: 'removed', id: r.id });
    }
    updateAndPersist([]);
  }, [broadcast, updateAndPersist]);

  const value = useMemo<RemindersContextValue>(
    () => ({
      reminders,
      isSupported,
      permission,
      isFull: reminders.length >= REMINDER_SOFT_CAP,
      add,
      remove,
      toggleRecurring,
      requestPermission,
      clearAll,
    }),
    [reminders, isSupported, permission, add, remove, toggleRecurring, requestPermission, clearAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useReminders must be used inside <RemindersProvider>');
  }
  return ctx;
}
