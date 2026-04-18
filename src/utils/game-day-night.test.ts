import { describe, it, expect } from 'vitest';
import { isDayTime, getNextTransition } from './game-day-night';

describe('isDayTime', () => {
  it('returns true at 06:00', () => {
    expect(isDayTime({ hours: 6, minutes: 0 })).toBe(true);
  });
  it('returns true at 17:59', () => {
    expect(isDayTime({ hours: 17, minutes: 59 })).toBe(true);
  });
  it('returns false at 18:00', () => {
    expect(isDayTime({ hours: 18, minutes: 0 })).toBe(false);
  });
  it('returns false at 05:59', () => {
    expect(isDayTime({ hours: 5, minutes: 59 })).toBe(false);
  });
  it('returns false at 00:00', () => {
    expect(isDayTime({ hours: 0, minutes: 0 })).toBe(false);
  });
});

describe('getNextTransition', () => {
  it('returns ms until 18:00 when currently daytime (noon)', () => {
    // Eorzea 12:00 corresponds to real ms 2_100_000
    const ms = getNextTransition(2_100_000);
    expect(ms).toBe(1_050_000);
  });

  it('returns ms until 06:00 when currently nighttime (22:00)', () => {
    const ms = getNextTransition(3_850_000);
    expect(ms).toBe(1_400_000);
  });
});
