import { describe, it, expect } from 'vitest';
import { deriveMcCosts } from './mc-analysis';
import type { LogogramListing } from '@/types/eureka';

const IDS = ['log1', 'log2', 'log3'];

const mkListings = (price: number, qty = 9999): LogogramListing[] => [
  { quantity: qty, pricePerUnit: price, worldName: 'A' },
];

describe('deriveMcCosts', () => {
  it('returns zero costs when all inventory covers all opens', () => {
    const mcOpensPerIter = [
      [5, 5, 5],
      [5, 5, 5],
      [5, 5, 5],
    ];
    const inventory = { log1: 10, log2: 10, log3: 10 };
    const listings = new Map<string, LogogramListing[]>([
      ['log1', mkListings(100)],
      ['log2', mkListings(100)],
      ['log3', mkListings(100)],
    ]);

    const result = deriveMcCosts({
      mcOpensPerIter,
      logogramOrder: IDS,
      inventory,
      listingsByLogogramId: listings,
    });

    expect(result.totalCost95).toBe(0);
    expect(result.totalCost50).toBe(0);
    for (const id of IDS) {
      expect(result.costPerLogogram95[id]).toBe(0);
      expect(result.costPerLogogram50[id]).toBe(0);
    }
  });

  it('50% total is ≤ 95% total', () => {
    const mcOpensPerIter: number[][] = [];
    for (let i = 0; i < 100; i++) {
      mcOpensPerIter.push([5 + i % 10, 3 + i % 7, 2 + i % 5]);
    }
    const listings = new Map<string, LogogramListing[]>([
      ['log1', mkListings(100)],
      ['log2', mkListings(200)],
      ['log3', mkListings(50)],
    ]);

    const result = deriveMcCosts({
      mcOpensPerIter,
      logogramOrder: IDS,
      inventory: {},
      listingsByLogogramId: listings,
    });

    expect(result.totalCost50).toBeLessThanOrEqual(result.totalCost95);
  });

  it('sum of per-logogram costs ≈ total (within 5%)', () => {
    const mcOpensPerIter: number[][] = [];
    for (let i = 0; i < 200; i++) {
      mcOpensPerIter.push([10 + (i % 20), 8 + (i % 15), 5 + (i % 10)]);
    }
    const listings = new Map<string, LogogramListing[]>([
      ['log1', mkListings(100)],
      ['log2', mkListings(200)],
      ['log3', mkListings(50)],
    ]);

    const result = deriveMcCosts({
      mcOpensPerIter,
      logogramOrder: IDS,
      inventory: {},
      listingsByLogogramId: listings,
    });

    const sum95 = IDS.reduce((s, id) => s + result.costPerLogogram95[id]!, 0);
    const sum50 = IDS.reduce((s, id) => s + result.costPerLogogram50[id]!, 0);

    expect(Math.abs(sum95 - result.totalCost95) / result.totalCost95).toBeLessThan(0.05);
    expect(Math.abs(sum50 - result.totalCost50) / result.totalCost50).toBeLessThan(0.05);
  });

  it('applies inventory deduction per iteration', () => {
    const mcOpensPerIter = [
      [10, 10, 10],
      [10, 10, 10],
      [10, 10, 10],
    ];
    const listings = new Map<string, LogogramListing[]>([
      ['log1', mkListings(100)],
      ['log2', mkListings(100)],
      ['log3', mkListings(100)],
    ]);

    const withInv = deriveMcCosts({
      mcOpensPerIter,
      logogramOrder: IDS,
      inventory: { log1: 10 },
      listingsByLogogramId: listings,
    });
    expect(withInv.costPerLogogram95.log1).toBe(0);
    expect(withInv.costPerLogogram95.log2).toBeGreaterThan(0);
  });

  it('handles empty mcOpensPerIter gracefully', () => {
    const result = deriveMcCosts({
      mcOpensPerIter: [],
      logogramOrder: IDS,
      inventory: {},
      listingsByLogogramId: new Map(),
    });
    expect(result.totalCost95).toBe(0);
    expect(result.totalCost50).toBe(0);
  });

  it('handles single iteration (N=1, window fallback path)', () => {
    // N=1 exercises the windowIndices fallback (high <= low)
    const listings = new Map<string, LogogramListing[]>([
      ['log1', mkListings(100)],
      ['log2', mkListings(200)],
      ['log3', mkListings(50)],
    ]);
    const result = deriveMcCosts({
      mcOpensPerIter: [[5, 3, 2]],
      logogramOrder: IDS,
      inventory: {},
      listingsByLogogramId: listings,
    });
    // With one iteration, both 95% and 50% windows collapse to that same iteration
    expect(result.totalCost95).toBe(result.totalCost50);
    // Cost = 5*100 + 3*200 + 2*50 = 1200
    expect(result.totalCost95).toBe(1200);
    expect(result.costPerLogogram95.log1).toBe(500);
    expect(result.costPerLogogram95.log2).toBe(600);
    expect(result.costPerLogogram95.log3).toBe(100);
  });

  it('falls back to empty listings when logogram id has no entry', () => {
    // buildPurchasePlan with [] listings returns totalCost = 0 (unfulfilled).
    // The logogram contributes 0 cost rather than crashing.
    const listings = new Map<string, LogogramListing[]>([
      ['log1', mkListings(100)],
      // log2, log3 intentionally missing
    ]);
    const result = deriveMcCosts({
      mcOpensPerIter: [[5, 5, 5]],
      logogramOrder: IDS,
      inventory: {},
      listingsByLogogramId: listings,
    });
    expect(result.costPerLogogram95.log1).toBe(500);
    expect(result.costPerLogogram95.log2).toBe(0);
    expect(result.costPerLogogram95.log3).toBe(0);
    // Total matches (only log1 contributes)
    expect(result.totalCost95).toBe(500);
  });
});
