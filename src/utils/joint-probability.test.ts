import { describe, it, expect, beforeEach } from 'vitest';
import { jointLogogramsNeeded95, buildProbCurve } from './joint-probability';

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

describe('buildProbCurve', () => {
  it('should return p[0] = 0 when requirements are non-zero', () => {
    const curve = buildProbCurve([1], 7, 5);
    expect(curve[0]).toBe(0);
  });

  it('should return p[0] = 1 for empty requirements', () => {
    const curve = buildProbCurve([], 7, 5);
    expect(curve[0]).toBe(1);
  });

  it('should be monotonically non-decreasing', () => {
    const curve = buildProbCurve([1, 1], 7, 50);
    for (let n = 1; n < curve.length; n++) {
      expect(curve[n]).toBeGreaterThanOrEqual(curve[n - 1]!);
    }
  });

  it('should reach >= 0.95 at jointLogogramsNeeded95 index', () => {
    const reqs = [1];
    const total = 7;
    const n95 = jointLogogramsNeeded95(reqs, total);
    const curve = buildProbCurve(reqs, total, n95 + 5);
    expect(curve[n95]).toBeGreaterThanOrEqual(0.95);
    expect(curve[n95 - 1]).toBeLessThan(0.95);
  });

  it('should match binomial intuition for single-mneme single-need', () => {
    // 1 from 2 mnemes: p(N) = 1 - (1/2)^N
    const curve = buildProbCurve([1], 2, 6);
    expect(curve[1]).toBeCloseTo(0.5, 6);
    expect(curve[2]).toBeCloseTo(0.75, 6);
    expect(curve[3]).toBeCloseTo(0.875, 6);
  });

  it('should match jointLogogramsNeeded95 for joint requirements', () => {
    const reqs = [1, 1];
    const total = 7;
    const n95 = jointLogogramsNeeded95(reqs, total);
    const curve = buildProbCurve(reqs, total, n95 + 5);
    expect(curve[n95]).toBeGreaterThanOrEqual(0.95);
    expect(curve[n95 - 1]).toBeLessThan(0.95);
  });
});

import {
  jointLogogramsNeeded50,
  jointLogogramsNeededN,
  clearJointCache,
} from './joint-probability';

describe('jointLogogramsNeededN (parameterized)', () => {
  beforeEach(() => clearJointCache());

  it('returns fewer opens at 50% than at 95%', () => {
    const n95 = jointLogogramsNeededN([5, 3], 9, 0.95);
    const n50 = jointLogogramsNeededN([5, 3], 9, 0.5);
    expect(n50).toBeGreaterThan(0);
    expect(n50).toBeLessThan(n95);
  });

  it('cache key includes confidence (different values produce different results from cache)', () => {
    const n95a = jointLogogramsNeededN([5, 3], 9, 0.95);
    const n50a = jointLogogramsNeededN([5, 3], 9, 0.5);
    const n95b = jointLogogramsNeededN([5, 3], 9, 0.95);
    const n50b = jointLogogramsNeededN([5, 3], 9, 0.5);
    expect(n95b).toBe(n95a);
    expect(n50b).toBe(n50a);
    expect(n95a).not.toBe(n50a);
  });

  it('empty requirements returns 0 regardless of confidence', () => {
    expect(jointLogogramsNeededN([], 5, 0.95)).toBe(0);
    expect(jointLogogramsNeededN([], 5, 0.5)).toBe(0);
  });
});

describe('jointLogogramsNeeded50 wrapper', () => {
  beforeEach(() => clearJointCache());

  it('matches jointLogogramsNeededN at 0.5', () => {
    expect(jointLogogramsNeeded50([5, 3], 9)).toBe(
      jointLogogramsNeededN([5, 3], 9, 0.5),
    );
  });
});

describe('jointLogogramsNeeded95 wrapper (back-compat)', () => {
  beforeEach(() => clearJointCache());

  it('matches jointLogogramsNeededN at 0.95', () => {
    expect(jointLogogramsNeeded95([5, 3], 9)).toBe(
      jointLogogramsNeededN([5, 3], 9, 0.95),
    );
  });
});
