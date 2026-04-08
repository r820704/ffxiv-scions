import { describe, it, expect } from 'vitest';
import { getWeatherIconUrl } from './weather-icons';

describe('getWeatherIconUrl', () => {
  it('returns a bundled asset url for a known weather', () => {
    const url = getWeatherIconUrl('Clear Skies');
    expect(url).toBeDefined();
    expect(url).toMatch(/060201/);
  });

  it('returns icons for the South Horn weathers', () => {
    expect(getWeatherIconUrl('Atmospheric Phantasms')).toMatch(/060238/);
    expect(getWeatherIconUrl('Illusory Disturbances')).toMatch(/060239/);
  });

  it('returns undefined for unknown weathers', () => {
    expect(getWeatherIconUrl('Made Up Weather')).toBeUndefined();
  });
});
