import { describe, it, expect } from 'vitest';
import { ZONE_META, getZoneLevelLabel } from './eureka-zone-meta';
import { EUREKA_ZONES } from './weather-data';

describe('ZONE_META', () => {
  it('covers every EUREKA_ZONES entry', () => {
    for (const z of EUREKA_ZONES) {
      expect(ZONE_META[z]).toBeDefined();
    }
  });

  it('has elemental level ranges in canonical FFXIV order', () => {
    expect(ZONE_META['Eureka Anemos'].levelMin).toBe(1);
    expect(ZONE_META['Eureka Anemos'].levelMax).toBe(20);
    expect(ZONE_META['Eureka Pagos'].levelMin).toBe(20);
    expect(ZONE_META['Eureka Pagos'].levelMax).toBe(35);
    expect(ZONE_META['Eureka Pyros'].levelMin).toBe(35);
    expect(ZONE_META['Eureka Pyros'].levelMax).toBe(50);
    expect(ZONE_META['Eureka Hydatos'].levelMin).toBe(50);
    expect(ZONE_META['Eureka Hydatos'].levelMax).toBe(60);
  });
});

describe('getZoneLevelLabel', () => {
  it('formats label as "Lv X–Y"', () => {
    expect(getZoneLevelLabel('Eureka Anemos')).toBe('Lv 1–20');
    expect(getZoneLevelLabel('Eureka Hydatos')).toBe('Lv 50–60');
  });
});
