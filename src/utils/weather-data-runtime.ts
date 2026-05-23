import type { EurekaZone } from '@/data/weather-data';
import { getWeatherForZone, findWeatherMatches, currentRunRemaining } from './weather-engine';

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

/**
 * Absolute timestamp of the next occurrence start of `weather` in `zone`.
 * If the weather is currently active, returns the start of the next window
 * after the current run ends (not the current run itself). Returns null when
 * no future occurrence can be found within the engine's lookahead window.
 */
export function nextWeatherStart(zone: EurekaZone, weather: string, now: number): number | null {
  if (isWeatherActive(zone, weather, now)) {
    const remaining = currentRunRemaining(zone, weather, now);
    if (remaining == null) return null;
    const afterCurrent = now + remaining + 1;
    const matches = findWeatherMatches(zone, new Set([weather]), 1, afterCurrent);
    return matches[0]?.startTime ?? null;
  }
  const matches = findWeatherMatches(zone, new Set([weather]), 1, now);
  return matches[0]?.startTime ?? null;
}
