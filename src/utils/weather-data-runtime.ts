import type { EurekaZone } from '@/data/weather-data';
import { getWeatherForZone, findWeatherMatches } from './weather-engine';

/**
 * Is the given weather currently active in the given zone at `now`?
 */
export function isWeatherActive(zone: EurekaZone, weather: string, now: number): boolean {
  return getWeatherForZone(zone, now) === weather;
}

/**
 * Milliseconds from `now` until the next occurrence of `weather` starts in `zone`.
 * Returns 0 if currently active. Returns Number.POSITIVE_INFINITY if not found within
 * findWeatherMatches's internal cap.
 */
export function msUntilWeather(zone: EurekaZone, weather: string, now: number): number {
  if (isWeatherActive(zone, weather, now)) return 0;
  const matches = findWeatherMatches(zone, new Set([weather]), 1, now);
  if (matches.length === 0) return Number.POSITIVE_INFINITY;
  return matches[0]!.startTime - now;
}
