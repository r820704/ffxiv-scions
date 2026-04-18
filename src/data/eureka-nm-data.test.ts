import { describe, it, expect } from 'vitest';
import { eurekaNms, getNmsForZoneAndWeather } from './eureka-nm-data';

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
});

describe('getNmsForZoneAndWeather', () => {
  it('returns at least one match for Anemos + Gales (Pazuzu)', () => {
    const matches = getNmsForZoneAndWeather('Eureka Anemos', 'Gales');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((n) => n.id === 'pazuzu')).toBe(true);
  });

  it('returns only zone-matching entries', () => {
    const matches = getNmsForZoneAndWeather('Eureka Pyros', 'Heat Waves');
    for (const nm of matches) {
      expect(nm.zone).toBe('Eureka Pyros');
    }
  });

  it('returns empty array for unmatched combination', () => {
    const matches = getNmsForZoneAndWeather('Eureka Anemos', 'Snow');
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBe(0);
  });
});
