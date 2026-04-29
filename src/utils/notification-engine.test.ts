import { describe, it, expect, afterEach } from 'vitest';
import {
  isNotificationSupported,
  formatLocalHHMM,
  buildFocusHash,
  buildNotification,
  computeNextOccurrence,
} from './notification-engine';
import type { Reminder } from '@/types/reminder';

describe('isNotificationSupported', () => {
  const originalNotification = globalThis.Notification;

  afterEach(() => {
    if (originalNotification) {
      (globalThis as { Notification?: unknown }).Notification = originalNotification;
    } else {
      delete (globalThis as { Notification?: unknown }).Notification;
    }
  });

  it('returns false when Notification undefined', () => {
    delete (globalThis as { Notification?: unknown }).Notification;
    expect(isNotificationSupported()).toBe(false);
  });

  it('returns true when Notification exists', () => {
    (globalThis as { Notification?: unknown }).Notification = function () {} as unknown;
    expect(isNotificationSupported()).toBe(true);
  });
});

describe('formatLocalHHMM', () => {
  it('formats Unix ms to HH:MM in local time', () => {
    const ts = new Date(2026, 3, 29, 14, 30, 0).getTime();
    expect(formatLocalHHMM(ts)).toBe('14:30');
  });

  it('pads single-digit hours and minutes', () => {
    const ts = new Date(2026, 3, 29, 9, 5, 0).getTime();
    expect(formatLocalHHMM(ts)).toBe('09:05');
  });
});

describe('buildFocusHash', () => {
  it('encodes zone + cellIndex computed from targetMs', () => {
    const baseStart = new Date(2026, 3, 29, 14, 0, 0).getTime();
    const reminder: Reminder = {
      id: 'r1',
      zone: 'Eureka Anemos',
      weather: 'Gales',
      targetMs: baseStart,
      recurring: false,
      source: 'm9-zone-hit',
      createdAt: 0,
    };
    const hash = buildFocusHash(reminder, baseStart);
    expect(hash).toMatch(/^#\/eureka-weather/);
    expect(hash).toContain('focus=Eureka Anemos:0');
  });
});

describe('buildNotification', () => {
  const base: Reminder = {
    id: 'r1',
    zone: 'Eureka Anemos',
    weather: 'Gales',
    targetMs: new Date(2026, 3, 29, 14, 30, 0).getTime(),
    recurring: false,
    source: 'm9-zone-hit',
    createdAt: 0,
  };

  it('zone-hit source: title is weather + zone, body has time + NMs', () => {
    const out = buildNotification(base, ['Cassie', 'Polyphemus']);
    expect(out.title).toBe('強風 · 優雷卡常風之地');
    expect(out.body).toContain('1 分鐘後開始（14:30）');
    expect(out.body).toContain('可能 NM：Cassie / Polyphemus');
    expect(out.tag).toBe('r1');
  });

  it('zone-hit source: omits NM segment when no active NMs', () => {
    const out = buildNotification(base, []);
    expect(out.body).toBe('1 分鐘後開始（14:30）');
  });

  it('zone-hit source: truncates NM list to 2 + count when >2', () => {
    const out = buildNotification(base, ['A', 'B', 'C', 'D']);
    expect(out.body).toContain('可能 NM：A / B 等 4 隻');
  });

  it('m10/m1 source with nmName: title prioritizes NM name, NM segment dropped', () => {
    const r: Reminder = { ...base, source: 'm10-search', nmName: 'Cassie' };
    const out = buildNotification(r, ['Cassie']);
    expect(out.title).toBe('Cassie 即將出現');
    expect(out.body).not.toContain('可能 NM');
  });
});

describe('computeNextOccurrence', () => {
  it('returns next cell start time where (zone, weather) matches', () => {
    const fromMs = new Date(2026, 3, 29, 0, 0, 0).getTime();
    const next = computeNextOccurrence('Eureka Anemos', 'Gales', fromMs);
    expect(next).not.toBeNull();
    expect(next!).toBeGreaterThan(fromMs);
  });

  it('returns null if no occurrence within search horizon', () => {
    const next = computeNextOccurrence('Eureka Anemos', 'NotARealWeather', Date.now());
    expect(next).toBeNull();
  });
});
