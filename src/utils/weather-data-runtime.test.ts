import { describe, it, expect } from 'vitest';
import { isWeatherActive, msUntilWeather, nextWeatherStart } from './weather-data-runtime';

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

describe('nextWeatherStart', () => {
  it('returns a future timestamp for inactive weather', () => {
    const now = Date.UTC(2026, 4, 19, 0, 0, 0);
    const ts = nextWeatherStart('Eureka Anemos', 'Gales', now);
    if (!isWeatherActive('Eureka Anemos', 'Gales', now)) {
      expect(ts).not.toBeNull();
      expect(ts!).toBeGreaterThan(now);
    }
  });

  it('skips the current active run when weather is active', () => {
    // Scan forward to find an active period
    const start = Date.UTC(2026, 4, 19, 0, 0, 0);
    const PERIOD_MS = 23 * 60_000 + 20_000;
    for (let i = 0; i < 100; i++) {
      const t = start + i * PERIOD_MS;
      if (isWeatherActive('Eureka Anemos', 'Gales', t)) {
        const ts = nextWeatherStart('Eureka Anemos', 'Gales', t);
        expect(ts).not.toBeNull();
        // Should be past the current period end
        expect(ts!).toBeGreaterThan(t + PERIOD_MS);
        return;
      }
    }
    throw new Error('No active Gales window found within scan range');
  });
});
