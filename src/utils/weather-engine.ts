import { weatherRates, weatherNamesTw } from '../data/weather-data';
import { WEATHER_PERIOD_MS, getWeatherPeriodStart } from './eorzea-time';

export const DEFAULT_LOOKBACK_PERIODS = 9;
export const MAX_RUN_LOOKAHEAD_PERIODS = 12;

// SaintCoinach weather calculation algorithm
export function calculateForecastTarget(timestamp: number): number {
  const unix = Math.trunc(timestamp / 1000);
  const bell = Math.trunc(unix / 175);
  const increment = (bell + 8 - (bell % 8)) % 24;
  const totalDays = Math.trunc(unix / 4200) >>> 0;
  const calcBase = totalDays * 0x64 + increment;
  const step1 = ((calcBase << 0xB) ^ calcBase) >>> 0;
  const step2 = ((step1 >>> 8) ^ step1) >>> 0;
  return step2 % 0x64;
}

// Look up weather for a zone given a forecast target value (0-99)
export function resolveWeather(zone: string, target: number): string | null {
  const rates = weatherRates[zone];
  if (!rates) return null;

  for (let i = 0; i < rates.length; i += 2) {
    const weatherName = rates[i] as string;
    const threshold = rates[i + 1];
    // Last entry has no threshold — it's the fallback
    if (threshold === undefined || typeof threshold === 'string') {
      return weatherName;
    }
    if (target < (threshold as number)) {
      return weatherName;
    }
  }
  return null;
}

// Get current weather for a zone at a given timestamp
export function getWeatherForZone(zone: string, timestamp: number): string | null {
  const periodStart = getWeatherPeriodStart(timestamp);
  const target = calculateForecastTarget(periodStart);
  return resolveWeather(zone, target);
}

// Get TC name for a weather
export function getWeatherTw(weather: string): string {
  return weatherNamesTw[weather] ?? weather;
}

export interface WeatherForecast {
  startTime: number;
  weather: string;
  weatherTw: string;
}

// Generate weather forecasts for a zone
export function generateForecasts(zone: string, count: number, fromTimestamp?: number): WeatherForecast[] {
  const now = fromTimestamp ?? Date.now();
  let periodStart = getWeatherPeriodStart(now);
  const results: WeatherForecast[] = [];

  for (let i = 0; i < count; i++) {
    const target = calculateForecastTarget(periodStart);
    const weather = resolveWeather(zone, target);
    if (weather) {
      results.push({
        startTime: periodStart,
        weather,
        weatherTw: getWeatherTw(weather),
      });
    }
    periodStart += WEATHER_PERIOD_MS;
  }
  return results;
}

// Look back up to `maxLookbackPeriods` weather periods from `now` to find the
// most recent period with the given `weather` whose end time is already <= now.
// Returns null if no match or if the zone is unknown.
export function findLastEndedWeather(
  zone: string,
  weather: string,
  now: number,
  maxLookbackPeriods: number = DEFAULT_LOOKBACK_PERIODS,
): WeatherForecast | null {
  if (!weatherRates[zone]) return null;

  const currentStart = getWeatherPeriodStart(now);
  for (let i = 1; i <= maxLookbackPeriods; i++) {
    const candidateStart = currentStart - i * WEATHER_PERIOD_MS;
    const target = calculateForecastTarget(candidateStart);
    const w = resolveWeather(zone, target);
    if (w === weather) {
      return {
        startTime: candidateStart,
        weather: w,
        weatherTw: getWeatherTw(w),
      };
    }
  }
  return null;
}

// From `now`, scan forward across consecutive same-weather periods and return
// the milliseconds remaining until the run ends (next period flips). Returns
// null if the zone is unknown or the current period weather does not match.
// Capped at MAX_RUN_LOOKAHEAD_PERIODS to bound work.
export function currentRunRemaining(
  zone: string,
  weather: string,
  now: number,
  maxLookahead: number = MAX_RUN_LOOKAHEAD_PERIODS,
): number | null {
  if (!weatherRates[zone]) return null;
  const periodStart = getWeatherPeriodStart(now);
  const currentWeather = resolveWeather(zone, calculateForecastTarget(periodStart));
  if (currentWeather !== weather) return null;

  for (let i = 1; i <= maxLookahead; i++) {
    const nextStart = periodStart + i * WEATHER_PERIOD_MS;
    const nextWeather = resolveWeather(zone, calculateForecastTarget(nextStart));
    if (nextWeather !== weather) {
      return nextStart - now;
    }
  }
  return periodStart + maxLookahead * WEATHER_PERIOD_MS - now;
}

// Find weather matches with optional filter
export function findWeatherMatches(
  zone: string,
  targetWeathers: Set<string>,
  count: number,
  fromTimestamp?: number,
): WeatherForecast[] {
  const now = fromTimestamp ?? Date.now();
  let periodStart = getWeatherPeriodStart(now);
  const results: WeatherForecast[] = [];
  const maxIterations = Math.max(count * 20, 500); // safety limit; rare weathers (e.g. Fair Skies in Hydatos at 12%) may not appear in ~20 periods

  for (let i = 0; i < maxIterations && results.length < count; i++) {
    const target = calculateForecastTarget(periodStart);
    const weather = resolveWeather(zone, target);
    if (weather && targetWeathers.has(weather)) {
      results.push({
        startTime: periodStart,
        weather,
        weatherTw: getWeatherTw(weather),
      });
    }
    periodStart += WEATHER_PERIOD_MS;
  }
  return results;
}
