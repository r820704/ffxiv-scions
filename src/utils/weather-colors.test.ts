import { describe, it, expect } from 'vitest';
import { getWeatherColor } from './weather-colors';

describe('getWeatherColor', () => {
  it('returns warm yellow for clear weathers', () => {
    expect(getWeatherColor('碧空')).toBe('#ffd166');
    expect(getWeatherColor('晴朗')).toBe('#ffd166');
  });

  it('returns blue for rain', () => {
    expect(getWeatherColor('小雨')).toBe('#4cc9f0');
    expect(getWeatherColor('暴雨')).toBe('#4cc9f0');
  });

  it('returns purple for thunder', () => {
    expect(getWeatherColor('打雷')).toBe('#b5179e');
    expect(getWeatherColor('雷雨')).toBe('#b5179e');
  });

  it('returns default color for unknown weathers', () => {
    expect(getWeatherColor('未知')).toBe('#7a8ba8');
    expect(getWeatherColor('')).toBe('#7a8ba8');
  });
});
