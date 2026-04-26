import { describe, it, expect } from 'vitest';
import { getPeriodKind, getPeriodBgClass } from './weather-period-bg';
import { toEorzeaTime } from './eorzea-time';

function findTimestampAtEtHour(etHour: number, fromTs = 1714000000000): number {
  // Scan forward 1 ET day worth of real seconds (~70 minutes) to find a timestamp
  // whose ET hour equals etHour and ET minutes are near 0.
  let best = fromTs;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 4500; i += 5) {
    const ts = fromTs + i * 1000;
    const et = toEorzeaTime(ts);
    if (et.hours !== etHour) continue;
    if (et.minutes < bestDiff) {
      bestDiff = et.minutes;
      best = ts;
      if (bestDiff < 1) return best;
    }
  }
  return best;
}

describe('getPeriodKind', () => {
  it('returns dawn for ET 0–8', () => {
    expect(getPeriodKind(findTimestampAtEtHour(0))).toBe('dawn');
    expect(getPeriodKind(findTimestampAtEtHour(7))).toBe('dawn');
  });

  it('returns day for ET 8–16', () => {
    expect(getPeriodKind(findTimestampAtEtHour(8))).toBe('day');
    expect(getPeriodKind(findTimestampAtEtHour(15))).toBe('day');
  });

  it('returns dusk for ET 16–24', () => {
    expect(getPeriodKind(findTimestampAtEtHour(16))).toBe('dusk');
    expect(getPeriodKind(findTimestampAtEtHour(23))).toBe('dusk');
  });
});

describe('getPeriodBgClass', () => {
  it('returns distinct gradient class per kind', () => {
    const dawn = getPeriodBgClass('dawn');
    const day = getPeriodBgClass('day');
    const dusk = getPeriodBgClass('dusk');
    expect(dawn).not.toBe(day);
    expect(day).not.toBe(dusk);
    expect(dawn).not.toBe(dusk);
    expect(dawn).toContain('linear-gradient');
    expect(day).toContain('linear-gradient');
    expect(dusk).toContain('linear-gradient');
  });

  it('places dawn day/night transition at 75% (ET 6 boundary)', () => {
    // Dawn cell covers ET 0-8, transition from night to day at ET 6 = 75% of cell width
    const dawn = getPeriodBgClass('dawn');
    expect(dawn).toMatch(/73%/);
    expect(dawn).toMatch(/77%/);
  });

  it('places dusk day/night transition at 25% (ET 18 boundary)', () => {
    // Dusk cell covers ET 16-24, transition from day to night at ET 18 = 25% of cell width
    const dusk = getPeriodBgClass('dusk');
    expect(dusk).toMatch(/23%/);
    expect(dusk).toMatch(/27%/);
  });
});
