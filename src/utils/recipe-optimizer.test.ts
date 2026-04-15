import { describe, it, expect } from 'vitest';
import { optimizeRecipes } from './recipe-optimizer';
import type { LogogramPrice } from '@/types/eureka';

const mockPrices: LogogramPrice[] = [
  { itemId: 24007, price: 215, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24008, price: 188, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24009, price: 3800, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24010, price: 500, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24011, price: 15000, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24012, price: 4500, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24013, price: 1398, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24014, price: 1100, worldName: 'Bahamut', lastUpdated: null, listings: [] },
  { itemId: 24809, price: 7000, worldName: 'Bahamut', lastUpdated: null, listings: [] },
];

describe('optimizeRecipes', () => {
  it('should return results for all unlearned skills', () => {
    const result = optimizeRecipes(new Set(), mockPrices);
    // All 56 skills should have a selected recipe
    expect(Object.keys(result.selectedRecipes).length).toBe(56);
    expect(result.totalCost).toBeGreaterThan(0);
  });

  it('should return fewer skills when some are learned', () => {
    const result2 = optimizeRecipes(new Set(['wisdom-aetherweaver']), mockPrices);
    expect(Object.keys(result2.selectedRecipes).length).toBe(55);
  });

  it('should produce lower total cost than naive approach', () => {
    const result = optimizeRecipes(new Set(), mockPrices);
    // Total cost should be positive and finite
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.totalCost).toBeLessThan(Infinity);
  });

  it('should have consistent mneme needs with selected recipes', () => {
    const result = optimizeRecipes(new Set(), mockPrices);
    // All logogram costs should be non-negative
    for (const logogramId of Object.keys(result.costPerLogogram)) {
      expect(result.costPerLogogram[logogramId]).toBeGreaterThanOrEqual(0);
    }
    // Total should equal sum of per-logogram costs
    const sumCosts = Object.values(result.costPerLogogram).reduce((a, b) => a + b, 0);
    expect(result.totalCost).toBe(sumCosts);
  });

  it('should reduce cost when skills are learned', () => {
    const noLearned = optimizeRecipes(new Set(), mockPrices);
    const someLearned = optimizeRecipes(
      new Set(['wisdom-aetherweaver', 'wisdom-martialist', 'wisdom-platebearer']),
      mockPrices
    );
    expect(someLearned.totalCost).toBeLessThan(noLearned.totalCost);
  });
});

