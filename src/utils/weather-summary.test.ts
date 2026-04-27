import { describe, it, expect } from 'vitest';
import { getNextHits } from './weather-summary';
import { EUREKA_ZONES } from '@/data/weather-data';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';

const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

describe('getNextHits', () => {
  it('returns empty array for unknown filter id with no matches', () => {
    const hits = getNextHits('NonExistentWeather', EUREKA_ZONES, fixedNow, 48);
    expect(hits).toEqual([]);
  });

  it('returns up to topN hits sorted by startTime ascending', () => {
    const hits = getNextHits('Gales', EUREKA_ZONES, fixedNow, 48, 3);
    expect(hits.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i]!.startTime).toBeGreaterThanOrEqual(hits[i - 1]!.startTime);
    }
  });

  it('only includes zones where the weather actually appears in forecast window', () => {
    // 'Gales' only appears in Eureka Anemos rate table
    const hits = getNextHits('Gales', EUREKA_ZONES, fixedNow, 48);
    for (const hit of hits) {
      expect(hit.zone).toBe('Eureka Anemos');
    }
  });

  it('reports cellIndex (0-based) for each hit so the caller can scroll to that cell', () => {
    const hits = getNextHits('Gales', EUREKA_ZONES, fixedNow, 48);
    for (const hit of hits) {
      expect(hit.cellIndex).toBeGreaterThanOrEqual(0);
      expect(hit.cellIndex).toBeLessThan(48);
    }
  });

  it('handles NIGHT_FILTER_KEY: matches first night cell in each zone', () => {
    const hits = getNextHits(NIGHT_FILTER_KEY, EUREKA_ZONES, fixedNow, 48);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThanOrEqual(3);
  });

  it('returns at most one hit per zone (the first occurrence)', () => {
    const hits = getNextHits('Gales', EUREKA_ZONES, fixedNow, 48);
    const zonesSeen = new Set(hits.map((h) => h.zone));
    expect(zonesSeen.size).toBe(hits.length);
  });
});
