import { describe, it, expect } from 'vitest';
import { eurekaNms, getActiveNms, formatNmTrigger } from './eureka-nm-data';

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

  it('every entry has at least one trigger condition', () => {
    for (const nm of eurekaNms) {
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
