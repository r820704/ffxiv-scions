import { describe, it, expect } from 'vitest';
import { eurekaNms, getActiveNms, getActiveNmsAt, formatNmTrigger, getNmTriggeringWeathers, NIGHT_FILTER_KEY } from './eureka-nm-data';
import { WEATHER_PERIOD_MS, toEorzeaTime } from '@/utils/eorzea-time';

describe('eurekaNms', () => {
  it('contains entries for all 4 Eureka zones', () => {
    const zones = new Set(eurekaNms.map((n) => n.zone));
    expect(zones.has('Eureka Anemos')).toBe(true);
    expect(zones.has('Eureka Pagos')).toBe(true);
    expect(zones.has('Eureka Pyros')).toBe(true);
    expect(zones.has('Eureka Hydatos')).toBe(true);
  });

  it('every entry has a non-empty nameTw in TC', () => {
    for (const nm of eurekaNms) {
      expect(nm.nameTw.length).toBeGreaterThan(0);
    }
  });

  it('every entry with a trigger has at least one trigger condition (weather or timeOfDay)', () => {
    for (const nm of eurekaNms) {
      if (!nm.trigger) continue; // unconditional NMs (常駐) are allowed post-D1
      const { weather, timeOfDay } = nm.trigger;
      expect(Boolean((weather && weather.length > 0) || timeOfDay)).toBe(true);
    }
  });
});

describe('getActiveNms', () => {
  it('returns Pazuzu on Anemos + Gales + night', () => {
    const matches = getActiveNms('Eureka Anemos', 'Gales', false);
    expect(matches.some((n) => n.id === 'pazuzu')).toBe(true);
  });

  it('does not return Pazuzu on Anemos + Gales + day (wrong time)', () => {
    const matches = getActiveNms('Eureka Anemos', 'Gales', true);
    expect(matches.some((n) => n.id === 'pazuzu')).toBe(false);
  });

  it('returns night-only NMs on any weather at night', () => {
    const matches = getActiveNms('Eureka Pagos', 'Fair Skies', false);
    expect(matches.some((n) => n.id === 'taxim')).toBe(true);
    expect(matches.some((n) => n.id === 'louhi')).toBe(true);
  });

  it('does not return night-only NMs during the day', () => {
    const matches = getActiveNms('Eureka Pagos', 'Fair Skies', true);
    expect(matches.some((n) => n.id === 'taxim')).toBe(false);
    expect(matches.some((n) => n.id === 'louhi')).toBe(false);
  });

  it('returns Copycat Cassie on Pagos + Blizzards (not Fog)', () => {
    const fog = getActiveNms('Eureka Pagos', 'Fog', true);
    expect(fog.some((n) => n.id === 'copycat-cassie')).toBe(false);
    const blizzards = getActiveNms('Eureka Pagos', 'Blizzards', true);
    expect(blizzards.some((n) => n.id === 'copycat-cassie')).toBe(true);
  });

  it('only returns NMs for the requested zone', () => {
    const matches = getActiveNms('Eureka Pyros', 'Heat Waves', true);
    for (const nm of matches) {
      expect(nm.zone).toBe('Eureka Pyros');
    }
  });
});

describe('getActiveNmsAt — current cell uses realNow not midpoint', () => {
  // Find a real-world timestamp where ET hour ≈ etHour with small minute offset
  function findTsAtEt(etHour: number, fromTs = 1714000000000): number {
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

  it('does NOT include night-only NM when realNow is ET 17 (P2 day tail) but midpoint is ET 20 (night)', () => {
    // periodStart at ET 16 (start of P2 dusk cell)
    const periodStart = findTsAtEt(16);
    // 1 ET hour = 175 real seconds; realNow = periodStart + 175s puts us at ET ~17 (still day)
    const realNow = periodStart + 175 * 1000;
    const etRealNow = toEorzeaTime(realNow);
    const midpointEt = toEorzeaTime(periodStart + WEATHER_PERIOD_MS / 2);
    expect(etRealNow.hours).toBe(17);
    expect(midpointEt.hours).toBeGreaterThanOrEqual(18);

    const nms = getActiveNmsAt('Eureka Anemos', 'Fair Skies', periodStart, realNow);
    expect(nms.every((nm) => nm.trigger?.timeOfDay !== 'night')).toBe(true);
  });

  it('falls back to midpoint isDay when realNow is omitted (parity with getActiveNms)', () => {
    const periodStart = findTsAtEt(16);
    const a = getActiveNmsAt('Eureka Anemos', 'Fair Skies', periodStart);
    const midpointEt = toEorzeaTime(periodStart + WEATHER_PERIOD_MS / 2);
    const isDay = midpointEt.hours >= 6 && midpointEt.hours < 18;
    const b = getActiveNms('Eureka Anemos', 'Fair Skies', isDay);
    expect(a.map((n) => n.id).sort()).toEqual(b.map((n) => n.id).sort());
  });
});

describe('getNmTriggeringWeathers', () => {
  it('returns distinct weathers that trigger at least one NM', () => {
    const list = getNmTriggeringWeathers();
    expect(list).toContain('Gales');
    expect(list).toContain('Fog');
    expect(list).toContain('Thunder');
    expect(list).toContain('Heat Waves');
    expect(list).toContain('Blizzards');
    expect(list).toContain('Umbral Wind');
  });

  it('does NOT include weathers without NM', () => {
    const list = getNmTriggeringWeathers();
    expect(list).not.toContain('Fair Skies');
    expect(list).not.toContain('Showers');
    expect(list).not.toContain('Snow');
    expect(list).not.toContain('Gloom');
    expect(list).not.toContain('Thunderstorms');
  });

  it('returns sorted ascending for stable order', () => {
    const list = getNmTriggeringWeathers();
    const sorted = [...list].sort();
    expect(list).toEqual(sorted);
  });
});

describe('NIGHT_FILTER_KEY', () => {
  it('is a sentinel string distinct from any real weather name', () => {
    expect(typeof NIGHT_FILTER_KEY).toBe('string');
    expect(NIGHT_FILTER_KEY.startsWith('__')).toBe(true);
  });
});

describe('formatNmTrigger', () => {
  it('formats weather-only NM', () => {
    const skoll = eurekaNms.find((n) => n.id === 'skoll')!;
    expect(formatNmTrigger(skoll)).toBe('暴雪');
  });

  it('formats night-only NM', () => {
    const taxim = eurekaNms.find((n) => n.id === 'taxim')!;
    expect(formatNmTrigger(taxim)).toBe('夜間');
  });

  it('formats weather + night NM with +', () => {
    const pazuzu = eurekaNms.find((n) => n.id === 'pazuzu')!;
    expect(formatNmTrigger(pazuzu)).toBe('強風+夜間');
  });
});
