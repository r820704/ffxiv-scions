import { describe, it, expect } from 'vitest';
import { EUREKA_CHAINS } from './eureka-chains';

describe('eureka-chains', () => {
  it('has 10 chains (9 jobs + PLD shield)', () => {
    expect(EUREKA_CHAINS).toHaveLength(10);
  });
  it('has exactly 2 PLD entries (main hand + shield)', () => {
    const pld = EUREKA_CHAINS.filter((c) => c.job === 'PLD');
    expect(pld).toHaveLength(2);
    expect(pld.filter((c) => c.isShield)).toHaveLength(1);
  });
  it('chainId is unique', () => {
    const set = new Set(EUREKA_CHAINS.map((c) => c.chainId));
    expect(set.size).toBe(EUREKA_CHAINS.length);
  });
});
