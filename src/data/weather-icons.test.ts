import { describe, it, expect } from 'vitest';
import { getWeatherIconUrl } from './weather-icons';

describe('getWeatherIconUrl', () => {
  it('returns the XIVAPI url for a known weather', () => {
    expect(getWeatherIconUrl('Clear Skies')).toBe('https://xivapi.com/i/060000/060201.png');
  });

  it('pads the icon id to six digits', () => {
    expect(getWeatherIconUrl('Moon Dust')).toBe('https://xivapi.com/i/060000/060222.png');
  });

  it('returns undefined for unsupported weathers', () => {
    expect(getWeatherIconUrl('Atmospheric Phantasms')).toBeUndefined();
    expect(getWeatherIconUrl('Illusory Disturbances')).toBeUndefined();
  });
});
