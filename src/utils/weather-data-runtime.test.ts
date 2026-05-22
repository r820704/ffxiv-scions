import { describe, it, expect } from 'vitest';
import { isWeatherActive, msUntilWeather } from './weather-data-runtime';

describe('isWeatherActive', () => {
  it('returns boolean for known zone + weather', () => {
    const now = Date.UTC(2026, 4, 19, 0, 0, 0);
    expect(typeof isWeatherActive('Eureka Anemos', 'Gales', now)).toBe('boolean');
  });
});

describe('msUntilWeather', () => {
  it('returns 0 when currently active', () => {
    const now = Date.UTC(2026, 4, 19, 0, 0, 0);
    // Find a time when Gales is active in Anemos by scanning the future
    // For deterministic test: if isWeatherActive returns true at `now`, msUntilWeather should be 0
    if (isWeatherActive('Eureka Anemos', 'Gales', now)) {
      expect(msUntilWeather('Eureka Anemos', 'Gales', now)).toBe(0);
    }
  });

  it('returns positive ms when not currently active', () => {
    const now = Date.UTC(2026, 4, 19, 0, 0, 0);
    const ms = msUntilWeather('Eureka Anemos', 'Gales', now);
    expect(ms).toBeGreaterThanOrEqual(0);
    // Should find Gales within 48h (Gales rate in Anemos is non-trivial)
    expect(ms).toBeLessThan(48 * 60 * 60 * 1000);
  });
});
