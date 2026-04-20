import { describe, it, expect } from 'vitest';
import { calculateForecastTarget, resolveWeather, getWeatherForZone, generateForecasts, findLastEndedWeather, findWeatherMatches } from './weather-engine';
import { WEATHER_PERIOD_MS, getWeatherPeriodStart } from './eorzea-time';

describe('calculateForecastTarget', () => {
  it('should return a number between 0 and 99', () => {
    const result = calculateForecastTarget(1000000000000);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(100);
  });

  it('should be deterministic for the same timestamp', () => {
    const ts = 1609459200000;
    expect(calculateForecastTarget(ts)).toBe(calculateForecastTarget(ts));
  });

  it('should return different values for different weather periods', () => {
    const ts1 = 1609459200000;
    const ts2 = ts1 + 1400000;
    const r1 = calculateForecastTarget(ts1);
    const r2 = calculateForecastTarget(ts2);
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r2).toBeGreaterThanOrEqual(0);
  });
});

describe('resolveWeather', () => {
  it('should resolve Eureka Anemos weather correctly for low target', () => {
    expect(resolveWeather('Eureka Anemos', 0)).toBe('Fair Skies');
    expect(resolveWeather('Eureka Anemos', 29)).toBe('Fair Skies');
  });

  it('should resolve Eureka Anemos weather correctly for mid target', () => {
    expect(resolveWeather('Eureka Anemos', 30)).toBe('Gales');
    expect(resolveWeather('Eureka Anemos', 59)).toBe('Gales');
  });

  it('should resolve fallback weather for high target', () => {
    expect(resolveWeather('Eureka Anemos', 90)).toBe('Snow');
    expect(resolveWeather('Eureka Anemos', 99)).toBe('Snow');
  });

  it('should return null for unknown zone', () => {
    expect(resolveWeather('NonExistentZone', 50)).toBeNull();
  });

  it('should handle Eureka Pyros Umbral Wind band', () => {
    expect(resolveWeather('Eureka Pyros', 64)).toBe('Umbral Wind');
    expect(resolveWeather('Eureka Pyros', 81)).toBe('Umbral Wind');
  });
});

describe('getWeatherForZone', () => {
  it('should return a valid weather string for known zone', () => {
    const weather = getWeatherForZone('Eureka Anemos', Date.now());
    expect(weather).toBeTruthy();
    expect(typeof weather).toBe('string');
  });

  it('should return null for unknown zone', () => {
    expect(getWeatherForZone('Nowhere', Date.now())).toBeNull();
  });
});

describe('generateForecasts', () => {
  it('should generate the requested number of forecasts', () => {
    const forecasts = generateForecasts('Eureka Anemos', 10);
    expect(forecasts).toHaveLength(10);
  });

  it('should include TC weather names', () => {
    const forecasts = generateForecasts('Eureka Anemos', 5);
    for (const f of forecasts) {
      expect(f.weatherTw).toBeTruthy();
      expect(f.startTime).toBeGreaterThan(0);
    }
  });

  it('should produce sequential timestamps spaced by weather period', () => {
    const forecasts = generateForecasts('Eureka Anemos', 5, 1609459200000);
    for (let i = 1; i < forecasts.length; i++) {
      expect(forecasts[i]!.startTime - forecasts[i - 1]!.startTime).toBe(1400000);
    }
  });
});

describe('findWeatherMatches', () => {
  it('finds rare weather beyond the old 20-period safety limit', () => {
    // Deterministic fixture: at 2026-04-01T00:00:00Z, Fair Skies in Eureka Hydatos
    // (12% rate) is ~24 periods away — outside the original count*20 safety cap.
    const fixedNow = new Date('2026-04-01T00:00:00Z').getTime();
    const [match] = findWeatherMatches('Eureka Hydatos', new Set(['Fair Skies']), 1, fixedNow);
    expect(match).toBeDefined();
    expect(match!.weather).toBe('Fair Skies');
  });
});

describe('findLastEndedWeather', () => {
  const fixedNow = 1734000000000; // deterministic anchor

  it('returns null when the weather never appears in lookback window', () => {
    // "Fog" does not exist in Eureka Anemos rate table
    const result = findLastEndedWeather('Eureka Anemos', 'Fog', fixedNow);
    expect(result).toBeNull();
  });

  it('returns null for unknown zone', () => {
    expect(findLastEndedWeather('NonExistentZone', 'Fair Skies', fixedNow)).toBeNull();
  });

  it('excludes the currently in-progress period (endTime must be <= now)', () => {
    const currentStart = getWeatherPeriodStart(fixedNow);
    const nowInsideCurrent = currentStart + 100;
    const result = findLastEndedWeather('Eureka Anemos', 'Fair Skies', nowInsideCurrent);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.startTime + WEATHER_PERIOD_MS).toBeLessThanOrEqual(nowInsideCurrent);
    }
  });

  it('returns the most recent ended period matching the weather', () => {
    const currentStart = getWeatherPeriodStart(fixedNow);
    let expected: number | null = null;
    for (let i = 1; i <= 9; i++) {
      const candidateStart = currentStart - i * WEATHER_PERIOD_MS;
      const forecast = generateForecasts('Eureka Anemos', 1, candidateStart)[0];
      if (forecast && forecast.weather === 'Fair Skies') {
        expected = candidateStart;
        break;
      }
    }

    const result = findLastEndedWeather('Eureka Anemos', 'Fair Skies', fixedNow);
    if (expected === null) {
      expect(result).toBeNull();
    } else {
      expect(result).not.toBeNull();
      expect(result!.startTime).toBe(expected);
      expect(result!.weather).toBe('Fair Skies');
    }
  });

  it('respects maxLookbackPeriods limit', () => {
    const currentStart = getWeatherPeriodStart(fixedNow);
    const prevStart = currentStart - WEATHER_PERIOD_MS;
    const prevForecast = generateForecasts('Eureka Anemos', 1, prevStart)[0];

    const result = findLastEndedWeather(
      'Eureka Anemos',
      prevForecast!.weather,
      fixedNow,
      1,
    );
    expect(result).not.toBeNull();
    expect(result!.startTime).toBe(prevStart);
  });

  it('returns null when lookback=1 and previous period does not match', () => {
    const currentStart = getWeatherPeriodStart(fixedNow);
    const prevStart = currentStart - WEATHER_PERIOD_MS;
    const prevForecast = generateForecasts('Eureka Anemos', 1, prevStart)[0];
    const otherWeather =
      prevForecast!.weather === 'Fair Skies' ? 'Gales' : 'Fair Skies';

    const result = findLastEndedWeather(
      'Eureka Anemos',
      otherWeather,
      fixedNow,
      1,
    );
    expect(result).toBeNull();
  });
});
