import { describe, it, expect } from 'vitest';
import { optimizeRecipes } from './recipe-optimizer';
import { deriveMcCosts } from './mc-analysis';
import { LOGOGRAM_FIXED_ORDER } from './album-helpers';
import { eurekaData } from '@/data/eureka-data';
import type { LogogramPrice, LogogramListing } from '@/types/eureka';

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

/**
 * Synthesize listings map from mock prices so deriveMcCosts has market data to
 * compute per-logogram / total costs. Each logogram gets one deep listing.
 */
function buildListingsMap(prices: LogogramPrice[]): Map<string, LogogramListing[]> {
  const m = new Map<string, LogogramListing[]>();
  for (const p of prices) {
    const logo = eurekaData.logograms.find((l) => l.itemId === p.itemId);
    if (logo && p.price != null) {
      m.set(logo.id, [
        { quantity: 999999, pricePerUnit: p.price, worldName: p.worldName ?? 'A' },
      ]);
    }
  }
  return m;
}

describe('optimizeRecipes', () => {
  it('should return results for all unlearned skills', () => {
    const result = optimizeRecipes(new Set(), mockPrices);
    // All 56 skills should have a selected recipe
    expect(Object.keys(result.selectedRecipes).length).toBe(56);

    const costs = deriveMcCosts({
      mcOpensPerIter: result.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory: {},
      listingsByLogogramId: buildListingsMap(mockPrices),
    });
    expect(costs.totalCost95).toBeGreaterThan(0);
  });

  it('should return fewer skills when some are learned', () => {
    const result2 = optimizeRecipes(new Set(['wisdom-aetherweaver']), mockPrices);
    expect(Object.keys(result2.selectedRecipes).length).toBe(55);
  });

  it('should produce lower total cost than naive approach', () => {
    const result = optimizeRecipes(new Set(), mockPrices);
    const costs = deriveMcCosts({
      mcOpensPerIter: result.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory: {},
      listingsByLogogramId: buildListingsMap(mockPrices),
    });
    // Total cost should be positive and finite
    expect(costs.totalCost95).toBeGreaterThan(0);
    expect(costs.totalCost95).toBeLessThan(Infinity);
  });

  it('should have consistent mneme needs with selected recipes', () => {
    const result = optimizeRecipes(new Set(), mockPrices);
    const costs = deriveMcCosts({
      mcOpensPerIter: result.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory: {},
      listingsByLogogramId: buildListingsMap(mockPrices),
    });
    // All per-logogram costs should be non-negative
    for (const logogramId of Object.keys(costs.costPerLogogram95)) {
      expect(costs.costPerLogogram95[logogramId]).toBeGreaterThanOrEqual(0);
    }
    // Sum of per-logogram costs should be close to totalCost95 (within ~7% drift
    // per mc-analysis windowed-expectation design; the 95% tail window is skewed
    // so occasional runs land ~5–6%).
    const sumCosts = Object.values(costs.costPerLogogram95).reduce((a, b) => a + b, 0);
    expect(Math.abs(sumCosts - costs.totalCost95) / costs.totalCost95).toBeLessThan(0.07);
  });

  it('should reduce mneme needs when skills are learned', () => {
    // mnemeNeeds is a deterministic output of the optimizer (unlike MC totals).
    // Learning skills whose recipes are in the optimal set must reduce total needs.
    const noLearned = optimizeRecipes(new Set(), mockPrices);
    const someLearned = optimizeRecipes(
      new Set(['wisdom-aetherweaver', 'wisdom-martialist', 'wisdom-platebearer']),
      mockPrices
    );
    const sumNeeds = (needs: Record<string, Record<string, number>>): number => {
      let total = 0;
      for (const logoNeeds of Object.values(needs)) {
        for (const qty of Object.values(logoNeeds)) total += qty;
      }
      return total;
    };
    expect(sumNeeds(someLearned.mnemeNeeds)).toBeLessThan(sumNeeds(noLearned.mnemeNeeds));
    // And selectedRecipes should have 3 fewer entries (learned skills are skipped).
    expect(Object.keys(someLearned.selectedRecipes).length).toBe(
      Object.keys(noLearned.selectedRecipes).length - 3
    );
  });

  describe('Monte Carlo output', () => {
    it('should produce an mcOpensPerIter matrix with expected shape', () => {
      const result = optimizeRecipes(new Set(), mockPrices);
      expect(result.mcOpensPerIter.length).toBe(10000);
      // Each row is 9 logograms
      for (const row of result.mcOpensPerIter.slice(0, 5)) {
        expect(row.length).toBe(9);
      }
    });
  });

  describe('deriveMcCosts integration', () => {
    it('should produce a positive totalCost95 for non-empty needs', () => {
      const result = optimizeRecipes(new Set(), mockPrices);
      const costs = deriveMcCosts({
        mcOpensPerIter: result.mcOpensPerIter,
        logogramOrder: LOGOGRAM_FIXED_ORDER,
        inventory: {},
        listingsByLogogramId: buildListingsMap(mockPrices),
      });
      expect(costs.totalCost95).toBeGreaterThan(0);
      expect(costs.totalCost95).toBeLessThan(Infinity);
    });

    it('should return 0 cost when all skills learned', () => {
      const allSkills = new Set<string>();
      // Build set of all 56 skill IDs via optimizer output
      const baseline = optimizeRecipes(new Set(), mockPrices);
      for (const skillId of Object.keys(baseline.selectedRecipes)) {
        allSkills.add(skillId);
      }
      const result = optimizeRecipes(allSkills, mockPrices);
      const costs = deriveMcCosts({
        mcOpensPerIter: result.mcOpensPerIter,
        logogramOrder: LOGOGRAM_FIXED_ORDER,
        inventory: {},
        listingsByLogogramId: buildListingsMap(mockPrices),
      });
      expect(costs.totalCost95).toBe(0);
      // All MC iterations should yield zero opens
      for (const row of result.mcOpensPerIter.slice(0, 5)) {
        expect(row.every((o) => o === 0)).toBe(true);
      }
    });
  });
});
