import { describe, it, expect } from 'vitest';
import { getPeriodKind, getPeriodBgClass, isCellNight } from './weather-period-bg';
import { WEATHER_PERIOD_MS } from './eorzea-time';
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

describe('isCellNight', () => {
  it('returns false for day cell (ET 8-16, midpoint ET 12)', () => {
    expect(isCellNight(findTimestampAtEtHour(8))).toBe(false);
  });

  it('returns true for dawn cell (ET 0-8, midpoint ET 4)', () => {
    expect(isCellNight(findTimestampAtEtHour(0))).toBe(true);
  });

  it('returns true for dusk cell (ET 16-24, midpoint ET 20)', () => {
    expect(isCellNight(findTimestampAtEtHour(16))).toBe(true);
  });

  it('uses realNow when provided (overrides midpoint heuristic)', () => {
    // Dusk cell at ET 16; realNow ~ET 17 (still day)
    const periodStart = findTimestampAtEtHour(16);
    const realNow = periodStart + 175 * 1000; // +1 ET hour real-time = 175 sec
    expect(isCellNight(periodStart)).toBe(true); // midpoint says night
    expect(isCellNight(periodStart, realNow)).toBe(false); // realNow says day
  });

  it('returns true when realNow is in the dawn-cell night portion (ET 0-6)', () => {
    const periodStart = findTimestampAtEtHour(0);
    // realNow at ET 4 (still night)
    const realNow = periodStart + 4 * 175 * 1000;
    expect(isCellNight(periodStart, realNow)).toBe(true);
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
