import { describe, it, expect } from 'vitest';
import { jointLogogramsNeeded95 } from './joint-probability';

describe('jointLogogramsNeeded95', () => {
  it('should return 0 for empty requirements', () => {
    expect(jointLogogramsNeeded95([], 7)).toBe(0);
  });

  it('should match single-mneme calculation for 1 requirement', () => {
    // 1 from 7 at 95% = 20 (matches logogramsNeeded95)
    expect(jointLogogramsNeeded95([1], 7)).toBe(20);
  });

  it('should match single-mneme calculation for 1 from 6', () => {
    // 1 from 6 at 95% = 17
    expect(jointLogogramsNeeded95([1], 6)).toBe(17);
  });

  it('should match single-mneme calculation for 1 from 2', () => {
    // 1 from 2 at 95% = 5
    expect(jointLogogramsNeeded95([1], 2)).toBe(5);
  });

  it('should return needed when totalTypes is 1', () => {
    expect(jointLogogramsNeeded95([3], 1)).toBe(3);
  });

  it('should require more opens for joint requirements than single', () => {
    const single1 = jointLogogramsNeeded95([1], 7);
    const single2 = jointLogogramsNeeded95([2], 7);
    const joint = jointLogogramsNeeded95([1, 2], 7);
    // Joint should be less than sum (shared opens benefit)
    expect(joint).toBeLessThan(single1 + single2);
    // Joint should be more than the larger individual
    expect(joint).toBeGreaterThanOrEqual(single2);
  });

  it('should handle two requirements from a 2-type logogram', () => {
    // Need 1 of each from a 2-type logogram
    // This is like the coupon collector: need both types
    const n = jointLogogramsNeeded95([1, 1], 2);
    // Should be reasonable (around 8-10)
    expect(n).toBeGreaterThan(2);
    expect(n).toBeLessThan(20);
  });

  it('should benefit from shared logogram opens', () => {
    // Need 1 of type A and 1 of type B from 7-type logogram
    const joint = jointLogogramsNeeded95([1, 1], 7);
    // Individual: each needs 20
    // Joint should be much less than 40 (sum) because opens are shared
    expect(joint).toBeLessThan(40);
    // But more than 20 (still need both)
    expect(joint).toBeGreaterThan(20);
  });
});
