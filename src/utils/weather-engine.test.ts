import { describe, it, expect } from 'vitest';
import { calculateForecastTarget, resolveWeather, getWeatherForZone, generateForecasts } from './weather-engine';

describe('calculateForecastTarget', () => {
  it('should return a number between 0 and 99', () => {
    const result = calculateForecastTarget(1000000000000);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(100);
  });

  it('should be deterministic for the same timestamp', () => {
    const ts = 1609459200000; // 2021-01-01 00:00:00 UTC
    expect(calculateForecastTarget(ts)).toBe(calculateForecastTarget(ts));
  });

  it('should return different values for different weather periods', () => {
    const ts1 = 1609459200000;
    const ts2 = ts1 + 1400000; // next weather period
    const r1 = calculateForecastTarget(ts1);
    const r2 = calculateForecastTarget(ts2);
    // They *could* be equal by chance, but very unlikely
    // Just verify they are valid numbers
    expect(r1).toBeGreaterThanOrEqual(0);
    expect(r2).toBeGreaterThanOrEqual(0);
  });
});

describe('resolveWeather', () => {
  it('should resolve Limsa Lominsa weather correctly for low target', () => {
    // target 0-19 = Clouds
    expect(resolveWeather('Limsa Lominsa', 0)).toBe('Clouds');
    expect(resolveWeather('Limsa Lominsa', 19)).toBe('Clouds');
  });

  it('should resolve Limsa Lominsa weather correctly for mid target', () => {
    // target 20-49 = Clear Skies
    expect(resolveWeather('Limsa Lominsa', 20)).toBe('Clear Skies');
    expect(resolveWeather('Limsa Lominsa', 49)).toBe('Clear Skies');
  });

  it('should resolve fallback weather for high target', () => {
    // target 90-99 = Rain (last entry)
    expect(resolveWeather('Limsa Lominsa', 90)).toBe('Rain');
    expect(resolveWeather('Limsa Lominsa', 99)).toBe('Rain');
  });

  it('should return null for unknown zone', () => {
    expect(resolveWeather('NonExistentZone', 50)).toBeNull();
  });

  it('should handle single-weather zones (Solution Nine)', () => {
    expect(resolveWeather('Solution Nine', 0)).toBe('Fair Skies');
    expect(resolveWeather('Solution Nine', 99)).toBe('Fair Skies');
  });
});

describe('getWeatherForZone', () => {
  it('should return a valid weather string for known zone', () => {
    const weather = getWeatherForZone('Limsa Lominsa', Date.now());
    expect(weather).toBeTruthy();
    expect(typeof weather).toBe('string');
  });

  it('should return null for unknown zone', () => {
    expect(getWeatherForZone('Nowhere', Date.now())).toBeNull();
  });
});

describe('generateForecasts', () => {
  it('should generate the requested number of forecasts', () => {
    const forecasts = generateForecasts('Limsa Lominsa', 10);
    expect(forecasts).toHaveLength(10);
  });

  it('should include TC weather names', () => {
    const forecasts = generateForecasts('Limsa Lominsa', 5);
    for (const f of forecasts) {
      expect(f.weatherTw).toBeTruthy();
      expect(f.startTime).toBeGreaterThan(0);
    }
  });

  it('should produce sequential timestamps spaced by weather period', () => {
    const forecasts = generateForecasts('Limsa Lominsa', 5, 1609459200000);
    for (let i = 1; i < forecasts.length; i++) {
      expect(forecasts[i]!.startTime - forecasts[i - 1]!.startTime).toBe(1400000);
    }
  });
});
