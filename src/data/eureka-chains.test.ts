import { describe, it, expect } from 'vitest';
import { EUREKA_CHAINS } from './eureka-chains';

describe('eureka-chains', () => {
  it('has 16 chains (15 jobs + PLD shield)', () => {
    expect(EUREKA_CHAINS).toHaveLength(16);
  });
  it('covers all 15 SB jobs exactly once on main hand', () => {
    const mainhand = EUREKA_CHAINS.filter((c) => !c.isShield);
    expect(mainhand).toHaveLength(15);
    const jobs = new Set(mainhand.map((c) => c.job));
    expect(jobs.size).toBe(15);
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
