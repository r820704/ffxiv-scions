import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isNotificationSupported } from '@/utils/notification-engine';
import { computeNextNotifications, type NotificationEntry } from '@/utils/nm-tracker-notification';
import type { StateCtx } from '@/utils/nm-tracker-state';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';
import { isDayTime, getNextTransition } from '@/utils/game-day-night';
import { toEorzeaTime } from '@/utils/eorzea-time';
import { eurekaNms, type EurekaNm } from '@/data/eureka-nm-data';
import { NM_TRACKER_NOTIFICATION_ENABLED_KEY, type NmRecord } from '@/types/nm-tracker';

const CHANNEL_NAME = 'eureka-nm-tracker-notifications';

interface UseArgs {
  pinned: string[];
  records: Record<string, NmRecord>;
}

interface UseResult {
  enabled: boolean;
  setEnabled: (next: boolean) => Promise<void>;
  permission: NotificationPermission;
  supported: boolean;
  upcomingEntries: NotificationEntry[];
}

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(NM_TRACKER_NOTIFICATION_ENABLED_KEY) === 'true';
}

function makeCtxAt(nm: EurekaNm): (t: number) => StateCtx {
  return (t: number) => ({
    isNight: !isDayTime(toEorzeaTime(t)),
    isWeather: (w: string) => isWeatherActive(nm.zone, w, t),
    minutesToWeather: (w: string) => msUntilWeather(nm.zone, w, t) / 60_000,
    msToTransition: getNextTransition(t),
  });
}

function ctxAt(nm: EurekaNm, t: number): StateCtx {
  return makeCtxAt(nm)(t);
}

export function useNmTrackerNotifications({ pinned, records }: UseArgs): UseResult {
  const [enabled, setEnabledState] = useState<boolean>(readEnabled);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    isNotificationSupported() ? Notification.permission : 'denied',
  );
  const timersRef = useRef<number[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Stable serialized keys to prevent infinite effect loops when callers pass
  // inline array/object literals (which have new references on every render).
  const pinnedKey = pinned.join(',');
  const recordsKey = JSON.stringify(records);

  const upcomingEntries = useMemo(() => {
    const pinnedNms = eurekaNms.filter(n => pinned.includes(n.id));
    return computeNextNotifications(pinnedNms, records, Date.now(), ctxAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable serialized keys guard identity
  }, [pinnedKey, recordsKey]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  // Schedule push notifications for upcoming entries
  useEffect(() => {
    clearTimers();

    if (!enabled || permission !== 'granted') {
      return;
    }

    // Initialise broadcast channel for cross-tab notification dedupe
    if (!channelRef.current && typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    }

    const now = Date.now();
    for (const entry of upcomingEntries) {
      const delayMs = entry.at - now;
      if (delayMs < 0) continue;
      // Cap at 24h to avoid extremely-long setTimeouts (browsers may misbehave)
      if (delayMs > 24 * 60 * 60 * 1000) continue;
      const tid = window.setTimeout(() => {
        try {
          const tag = `nm-tracker:${entry.nmId}:${entry.trigger}`;
          // eslint-disable-next-line no-new -- side effect intentional
          new Notification(entry.label, { body: entry.body, tag });
          channelRef.current?.postMessage({ type: 'fired', id: tag });
        } catch {
          // notification can fail if permission revoked mid-session — swallow
        }
      }, delayMs);
      timersRef.current.push(tid);
    }

    return () => clearTimers();
  }, [upcomingEntries, enabled, permission, clearTimers]);

  // Cleanup channel on unmount
  useEffect(() => {
    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const setEnabled = useCallback(async (next: boolean) => {
    setEnabledState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NM_TRACKER_NOTIFICATION_ENABLED_KEY, String(next));
    }
    if (next && isNotificationSupported() && Notification.permission === 'default') {
      try {
        const p = await Notification.requestPermission();
        setPermission(p);
      } catch {
        // Permission API may reject on some browsers
      }
    } else if (isNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    enabled,
    setEnabled,
    permission,
    supported: isNotificationSupported(),
    upcomingEntries,
  };
}
