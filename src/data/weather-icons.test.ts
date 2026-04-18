import { describe, it, expect } from 'vitest';
import { getWeatherIconUrl } from './weather-icons';

describe('getWeatherIconUrl', () => {
  it('returns a bundled asset url for a known Eureka weather', () => {
    const url = getWeatherIconUrl('Fair Skies');
    expect(url).toBeDefined();
    expect(url).toMatch(/060202/);
  });

  it('returns icons for other Eureka weathers', () => {
    expect(getWeatherIconUrl('Umbral Wind')).toMatch(/060219/);
    expect(getWeatherIconUrl('Heat Waves')).toMatch(/060214/);
    expect(getWeatherIconUrl('Blizzards')).toMatch(/060216/);
  });

  it('returns undefined for non-Eureka weathers', () => {
    expect(getWeatherIconUrl('Clear Skies')).toBeUndefined();
    expect(getWeatherIconUrl('Made Up Weather')).toBeUndefined();
  });
});
