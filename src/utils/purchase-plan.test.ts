import { describe, it, expect } from 'vitest';
import { buildPurchasePlan } from './purchase-plan';
import type { LogogramListing } from '@/types/eureka';

const L = (qty: number, price: number, world = 'A'): LogogramListing => ({
  quantity: qty,
  pricePerUnit: price,
  worldName: world,
});

describe('buildPurchasePlan', () => {
  it('returns empty plan for zero need', () => {
    const plan = buildPurchasePlan([L(10, 100)], 0);
    expect(plan.entries).toHaveLength(0);
    expect(plan.totalCost).toBe(0);
    expect(plan.fulfilled).toBe(true);
  });

  it('buys from cheapest listing first (single listing sufficient)', () => {
    const plan = buildPurchasePlan([L(10, 100), L(10, 200)], 5);
    expect(plan.entries).toEqual([
      { worldName: 'A', quantity: 5, pricePerUnit: 100 },
    ]);
    expect(plan.totalCost).toBe(500);
    expect(plan.fulfilled).toBe(true);
  });

  it('spans multiple listings when first is insufficient', () => {
    const plan = buildPurchasePlan([L(3, 100, 'A'), L(10, 150, 'B')], 8);
    expect(plan.entries).toEqual([
      { worldName: 'A', quantity: 3, pricePerUnit: 100 },
      { worldName: 'B', quantity: 5, pricePerUnit: 150 },
    ]);
    expect(plan.totalCost).toBe(3 * 100 + 5 * 150);
    expect(plan.fulfilled).toBe(true);
  });

  it('marks not fulfilled when listings run out', () => {
    const plan = buildPurchasePlan([L(5, 100)], 10);
    expect(plan.entries).toEqual([
      { worldName: 'A', quantity: 5, pricePerUnit: 100 },
    ]);
    expect(plan.totalCost).toBe(500);
    expect(plan.fulfilled).toBe(false);
  });

  it('handles empty listings', () => {
    const plan = buildPurchasePlan([], 5);
    expect(plan.entries).toHaveLength(0);
    expect(plan.totalCost).toBe(0);
    expect(plan.fulfilled).toBe(false);
  });
});
