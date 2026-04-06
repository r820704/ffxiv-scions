import { describe, it, expect } from 'vitest';
import { toEorzeaTime, formatEorzeaTime, getWeatherPeriodStart, WEATHER_PERIOD_MS } from './eorzea-time';

describe('WEATHER_PERIOD_MS', () => {
  it('should be 1400000 ms (8 Eorzea hours = 1400 real seconds)', () => {
    expect(WEATHER_PERIOD_MS).toBe(1400000);
  });
});

describe('toEorzeaTime', () => {
  it('should return hours and minutes', () => {
    const et = toEorzeaTime(Date.now());
    expect(et.hours).toBeGreaterThanOrEqual(0);
    expect(et.hours).toBeLessThan(24);
    expect(et.minutes).toBeGreaterThanOrEqual(0);
    expect(et.minutes).toBeLessThan(60);
  });
});

describe('formatEorzeaTime', () => {
  it('should format with zero padding', () => {
    expect(formatEorzeaTime({ hours: 0, minutes: 0 })).toBe('00:00');
    expect(formatEorzeaTime({ hours: 8, minutes: 5 })).toBe('08:05');
    expect(formatEorzeaTime({ hours: 23, minutes: 59 })).toBe('23:59');
  });
});

describe('getWeatherPeriodStart', () => {
  it('should align to weather period boundary', () => {
    const start = getWeatherPeriodStart(1609459200000);
    expect(start % WEATHER_PERIOD_MS).toBe(0);
  });

  it('should return same value for timestamps within same period', () => {
    const ts = 1609459200000;
    const s1 = getWeatherPeriodStart(ts);
    // 100 seconds is well within a 1400-second period
    const s2 = getWeatherPeriodStart(ts + 100000);
    expect(s1).toBe(s2);
  });

  it('should return different value for timestamps in different periods', () => {
    const ts = 1609459200000;
    const s1 = getWeatherPeriodStart(ts);
    const s2 = getWeatherPeriodStart(ts + WEATHER_PERIOD_MS);
    expect(s2 - s1).toBe(WEATHER_PERIOD_MS);
  });
});
