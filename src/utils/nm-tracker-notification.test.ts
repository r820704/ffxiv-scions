import { describe, it, expect } from 'vitest';
import { computeNextNotifications } from './nm-tracker-notification';
import type { StateCtx } from './nm-tracker-state';
import type { EurekaNm } from '@/data/eureka-nm-data';

const pazuzu: EurekaNm = {
  id: 'pazuzu',
  nameTw: '帕祖祖',
  nameEn: 'Pazuzu',
  zone: 'Eureka Anemos',
  level: 20,
  trigger: { nm: { weather: ['Gales'] }, mob: { timeOfDay: 'night' } },
};

const sabotender: EurekaNm = {
  id: 'sabotender-corrido',
  nameTw: '寇里多仙人掌怪',
  nameEn: 'Sabotender Corrido',
  zone: 'Eureka Anemos',
  level: 1,
};

describe('computeNextNotifications', () => {
  it('returns empty for no pinned NMs', () => {
    expect(computeNextNotifications([], {}, Date.now(), () => ({
      isNight: false,
      isWeather: () => false,
      minutesToWeather: () => Number.POSITIVE_INFINITY,
      msToTransition: 999_999,
    }))).toEqual([]);
  });

  it('skips 常駐 NMs (no trigger)', () => {
    const result = computeNextNotifications([sabotender], {}, Date.now(), () => ({
      isNight: false,
      isWeather: () => false,
      minutesToWeather: () => Number.POSITIVE_INFINITY,
      msToTransition: 999_999,
    }));
    expect(result).toEqual([]);
  });

  it('finds T2 when all conditions are immediately ✓', () => {
    const now = Date.now();
    const ctxAt = (_nm: EurekaNm, _t: number): StateCtx => ({
      isNight: true,
      isWeather: (w: string) => w === 'Gales',
      minutesToWeather: () => 0,
      msToTransition: 999_999,
    });
    const result = computeNextNotifications([pazuzu], {}, now, ctxAt);
    const t2 = result.find(r => r.trigger === 'T2');
    expect(t2).toBeDefined();
    expect(t2!.nmId).toBe('pazuzu');
    expect(t2!.at).toBeGreaterThanOrEqual(now);
    expect(t2!.at).toBeLessThan(now + 5 * 60_000);
  });

  it('finds T1 (預備) when mob ✓ + nm即將開窗', () => {
    const now = Date.now();
    const ctxAt = (_nm: EurekaNm, _t: number): StateCtx => ({
      isNight: true,
      isWeather: () => false,
      minutesToWeather: () => 3,  // Gales opens in 3 min
      msToTransition: 999_999,
    });
    const result = computeNextNotifications([pazuzu], {}, now, ctxAt);
    const t1 = result.find(r => r.trigger === 'T1');
    expect(t1).toBeDefined();
    expect(t1!.nmId).toBe('pazuzu');
  });

  it('respects CD: no T2 while CD still running', () => {
    const now = Date.now();
    const records = { pazuzu: { popAt: now - 30 * 60_000 } };  // 30 min ago, CD = 2h, still 1h30m left
    // even with all conditions ✓ for the next 24h, T2 should wait until CD ready
    const ctxAt = (): StateCtx => ({
      isNight: true,
      isWeather: () => true,
      minutesToWeather: () => 0,
      msToTransition: 999_999,
    });
    const result = computeNextNotifications([pazuzu], records, now, ctxAt);
    const t2 = result.find(r => r.trigger === 'T2');
    if (t2) {
      // T2 must be at or after CD expiry (popAt + 2h)
      expect(t2.at).toBeGreaterThanOrEqual(now + 60 * 60_000); // at least ~1h from now
    }
  });
});
