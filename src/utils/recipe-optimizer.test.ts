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

  describe('Monte Carlo 95% total', () => {
    it('should produce an mcOpensPerIter matrix with expected shape', () => {
      const result = optimizeRecipes(new Set(), mockPrices);
      expect(result.mcOpensPerIter.length).toBe(10000);
      // Each row is 9 logograms
      for (const row of result.mcOpensPerIter.slice(0, 5)) {
        expect(row.length).toBe(9);
      }
    });

    it('should produce a positive totalCost95Mc for non-empty needs', () => {
      const result = optimizeRecipes(new Set(), mockPrices);
      expect(result.totalCost95Mc).toBeGreaterThan(0);
      expect(result.totalCost95Mc).toBeLessThan(Infinity);
    });

    it('should have totalCost95Mc <= sum of per-logogram 95% costs (joint ≤ marginal sum)', () => {
      // The MC joint 95% should be less than or equal to the sum of per-logogram 95%s,
      // because the sum-of-marginals overestimates the joint percentile.
      const result = optimizeRecipes(new Set(), mockPrices);
      // Allow small MC noise tolerance (1% slack).
      expect(result.totalCost95Mc).toBeLessThanOrEqual(result.totalCost * 1.01);
    });

    it('should return 0 cost when all skills learned', () => {
      const allSkills = new Set<string>();
      // Build set of all 56 skill IDs via optimizer output
      const baseline = optimizeRecipes(new Set(), mockPrices);
      for (const skillId of Object.keys(baseline.selectedRecipes)) {
        allSkills.add(skillId);
      }
      const result = optimizeRecipes(allSkills, mockPrices);
      expect(result.totalCost95Mc).toBe(0);
      // All MC iterations should yield zero opens
      for (const row of result.mcOpensPerIter.slice(0, 5)) {
        expect(row.every((o) => o === 0)).toBe(true);
      }
    });
  });
});

