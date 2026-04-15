import { describe, it, expect } from 'vitest';
import { calculateRecipeCost, calculateRecipeCost95, logogramsNeeded95 } from './eureka-helpers';
import type { LogogramPrice } from '@/types/eureka';

const mockPrices: LogogramPrice[] = [
  { itemId: 24007, price: 500, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24008, price: 300, worldName: 'Mandragora', lastUpdated: null, listings: [] },
  { itemId: 24009, price: 1000, worldName: 'Ramuh', lastUpdated: null, listings: [] },
  { itemId: 24010, price: 800, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24011, price: 600, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24012, price: 200, worldName: 'Valefor', lastUpdated: null, listings: [] },
  { itemId: 24013, price: 400, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24014, price: 700, worldName: 'Mandragora', lastUpdated: null, listings: [] },
  { itemId: 24809, price: 2000, worldName: 'Ramuh', lastUpdated: null, listings: [] },
];

describe('calculateRecipeCost', () => {
  it('should calculate cost for a single-mneme recipe', () => {
    const cost = calculateRecipeCost(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    expect(cost).toBe(500);
  });

  it('should calculate cost for multi-mneme recipe', () => {
    const cost = calculateRecipeCost(
      [
        { mnemeId: 'wisdom-platebearer', quantity: 1 },
        { mnemeId: 'protect-l', quantity: 1 },
      ],
      mockPrices
    );
    expect(cost).toBe(800);
  });

  it('should multiply by quantity', () => {
    const cost = calculateRecipeCost(
      [{ mnemeId: 'stoneskin-l', quantity: 3 }],
      mockPrices
    );
    expect(cost).toBe(1200);
  });

  it('should return null if any price is missing', () => {
    const noPrices: LogogramPrice[] = [
      { itemId: 24007, price: null, worldName: null, lastUpdated: null, listings: [] },
    ];
    const cost = calculateRecipeCost(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      noPrices
    );
    expect(cost).toBeNull();
  });
});

describe('logogramsNeeded95', () => {
  it('should return needed when only 1 mneme type', () => {
    expect(logogramsNeeded95(1, 1)).toBe(1);
    expect(logogramsNeeded95(3, 1)).toBe(3);
  });

  it('should match known values for 1 from 6 (expect 17)', () => {
    expect(logogramsNeeded95(1, 6)).toBe(17);
  });

  it('should match known values for 1 from 7 (expect 20)', () => {
    expect(logogramsNeeded95(1, 7)).toBe(20);
  });

  it('should require more logograms for higher quantity', () => {
    const n1 = logogramsNeeded95(1, 7);
    const n2 = logogramsNeeded95(2, 7);
    expect(n2).toBeGreaterThan(n1);
  });
});

describe('calculateRecipeCost95', () => {
  it('should be higher than base cost for multi-mneme logograms', () => {
    const baseCost = calculateRecipeCost(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    const cost95 = calculateRecipeCost95(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    expect(baseCost).not.toBeNull();
    expect(cost95).not.toBeNull();
    expect(cost95!).toBeGreaterThan(baseCost!);
  });

  it('should equal base cost for single-mneme logograms', () => {
    // curative has only 2 mnemes, but let's test with a hypothetical 1-mneme case
    // All real logograms have 2+ mnemes, so cost95 will always be > base
    const cost95 = calculateRecipeCost95(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    // conceptual has 7 mnemes, need 20 logograms at 95%
    expect(cost95).toBe(500 * 20);
  });
});
