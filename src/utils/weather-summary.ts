import type { EurekaZone } from '@/data/weather-data';
import { generateForecasts } from './weather-engine';
import { isCellNight } from './weather-period-bg';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';

export interface ZoneHit {
  zone: EurekaZone;
  startTime: number;
  cellIndex: number;
  weather: string;
}

// Find the next occurrence of `filterId` in each zone (first cell that matches),
// then merge across zones, sort ascending by startTime, return top N.
// `filterId` may be a weather name OR `NIGHT_FILTER_KEY` (matches night cells).
export function getNextHits(
  filterId: string,
  zones: readonly EurekaZone[],
  fromTs: number,
  forecastCount: number,
  topN: number = 3,
): ZoneHit[] {
  const isNightFilter = filterId === NIGHT_FILTER_KEY;
  const results: ZoneHit[] = [];

  for (const zone of zones) {
    const forecasts = generateForecasts(zone, forecastCount, fromTs);
    for (let i = 0; i < forecasts.length; i++) {
      const f = forecasts[i]!;
      const matches = isNightFilter ? isCellNight(f.startTime) : f.weather === filterId;
      if (matches) {
        results.push({
          zone,
          startTime: f.startTime,
          cellIndex: i,
          weather: f.weather,
        });
        break;
      }
    }
  }

  return results.sort((a, b) => a.startTime - b.startTime).slice(0, topN);
}
