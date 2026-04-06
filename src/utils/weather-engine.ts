import { weatherRates, weatherNamesTw } from '../data/weather-data';
import { WEATHER_PERIOD_MS, getWeatherPeriodStart } from './eorzea-time';

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
  const maxIterations = count * 20; // safety limit

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
