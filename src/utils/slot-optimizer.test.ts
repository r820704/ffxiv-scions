import { describe, it, expect } from 'vitest';
import { SUCCESS_RATE_TABLE } from './slot-optimizer';

describe('SUCCESS_RATE_TABLE', () => {
  it('should return correct success rates for all mneme counts', () => {
    expect(SUCCESS_RATE_TABLE[1]).toBe(1.0);
    expect(SUCCESS_RATE_TABLE[2]).toBe(1.0);
    expect(SUCCESS_RATE_TABLE[3]).toBe(1.0);
    expect(SUCCESS_RATE_TABLE[4]).toBe(0.7);
    expect(SUCCESS_RATE_TABLE[5]).toBe(0.5);
    expect(SUCCESS_RATE_TABLE[6]).toBe(0.3);
  });

  it('should return undefined for invalid mneme counts', () => {
    expect(SUCCESS_RATE_TABLE[0]).toBeUndefined();
    expect(SUCCESS_RATE_TABLE[7]).toBeUndefined();
  });
});
