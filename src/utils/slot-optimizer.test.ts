import { describe, it, expect } from 'vitest';
import { SUCCESS_RATE_TABLE, simulateSlotMC, optimizeSlots, type SlotConfig } from './slot-optimizer';
import { eurekaData } from '@/data/eureka-data';
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

describe('simulateSlotMC', () => {
  // Helper: get action by ID
  const getAction = (id: string) => eurekaData.logosActions.find((a) => a.id === id)!;

  it('should return matrix with correct shape', () => {
    const slotNeeds = [
      {
        ingredients: getAction('wisdom-aetherweaver').recipes[0]!.ingredients,
        successRate: 1.0,
      },
    ];
    const result = simulateSlotMC(slotNeeds, 100);
    expect(result).toHaveLength(100);
    for (const row of result) {
      expect(row).toHaveLength(9); // 9 logograms
    }
  });

  it('should produce non-zero opens for the correct logogram', () => {
    const slotNeeds = [
      {
        ingredients: getAction('wisdom-aetherweaver').recipes[0]!.ingredients,
        successRate: 1.0,
      },
    ];
    const result = simulateSlotMC(slotNeeds, 500);
    for (const row of result) {
      expect(row[0]).toBeGreaterThan(0);
    }
    for (const row of result) {
      for (let j = 1; j < 9; j++) {
        expect(row[j]).toBe(0);
      }
    }
  });

  it('should require more opens on average with lower success rate', () => {
    const ing = getAction('wisdom-aetherweaver').recipes[0]!.ingredients;
    const result100 = simulateSlotMC([{ ingredients: ing, successRate: 1.0 }], 2000);
    const result30 = simulateSlotMC([{ ingredients: ing, successRate: 0.3 }], 2000);

    const avg = (matrix: number[][], col: number) =>
      matrix.reduce((sum, row) => sum + row[col]!, 0) / matrix.length;

    expect(avg(result30, 0)).toBeGreaterThan(avg(result100, 0) * 2);
  });

  it('should handle multiple slot needs', () => {
    const ing1 = getAction('wisdom-aetherweaver').recipes[0]!.ingredients;
    const ing2 = getAction('wisdom-martialist').recipes[0]!.ingredients;
    const result = simulateSlotMC(
      [
        { ingredients: ing1, successRate: 1.0 },
        { ingredients: ing2, successRate: 1.0 },
      ],
      500,
    );
    expect(result).toHaveLength(500);
    const avgOpens = result.reduce((sum, row) => sum + row[0]!, 0) / result.length;
    expect(avgOpens).toBeGreaterThanOrEqual(2);
  });

  it('should return all zeros for empty slot needs', () => {
    const result = simulateSlotMC([], 100);
    expect(result).toHaveLength(100);
    for (const row of result) {
      expect(row.every((v) => v === 0)).toBe(true);
    }
  });
});

describe('optimizeSlots', () => {
  it('should return empty result for all-empty slots', () => {
    const config: SlotConfig = Array.from({ length: 8 }, (): [null, null] => [null, null]);
    const result = optimizeSlots(config, mockPrices);
    expect(Object.keys(result.selectedRecipes)).toHaveLength(0);
    expect(result.mcOpensPerIter.length).toBeGreaterThan(0);
    for (const row of result.mcOpensPerIter.slice(0, 5)) {
      expect(row.every((v) => v === 0)).toBe(true);
    }
  });

  it('should select a recipe for a single-skill slot', () => {
    const config: SlotConfig = Array.from({ length: 8 }, (): [null, null] => [null, null]);
    config[2] = ['wisdom-aetherweaver', null];
    const result = optimizeSlots(config, mockPrices);
    expect(result.selectedRecipes[2]).toBeDefined();
    expect(result.selectedRecipes[2]!.skill1RecipeIdx).toBeGreaterThanOrEqual(0);
    expect(result.selectedRecipes[2]!.skill2RecipeIdx).toBeUndefined();
  });

  it('should select recipes for a dual-skill slot', () => {
    const config: SlotConfig = Array.from({ length: 8 }, (): [null, null] => [null, null]);
    config[2] = ['wisdom-guardian', 'wisdom-ordained'];
    const result = optimizeSlots(config, mockPrices);
    expect(result.selectedRecipes[2]).toBeDefined();
    expect(result.selectedRecipes[2]!.skill1RecipeIdx).toBeGreaterThanOrEqual(0);
    expect(result.selectedRecipes[2]!.skill2RecipeIdx).toBeGreaterThanOrEqual(0);
  });

  it('should provide slot combinations for each non-empty slot', () => {
    const config: SlotConfig = Array.from({ length: 8 }, (): [null, null] => [null, null]);
    config[2] = ['wisdom-guardian', null]; // 5 recipes
    const result = optimizeSlots(config, mockPrices);
    expect(result.slotCombinations[2]).toBeDefined();
    expect(result.slotCombinations[2]!.length).toBe(5);
  });

  it('should produce MC output with correct shape', () => {
    const config: SlotConfig = Array.from({ length: 8 }, (): [null, null] => [null, null]);
    config[0] = ['wisdom-aetherweaver', null];
    const result = optimizeSlots(config, mockPrices);
    expect(result.mcOpensPerIter.length).toBe(10000);
    for (const row of result.mcOpensPerIter.slice(0, 3)) {
      expect(row).toHaveLength(9);
    }
  });

  it('should handle multiple populated slots', () => {
    const config: SlotConfig = Array.from({ length: 8 }, (): [null, null] => [null, null]);
    config[0] = ['wisdom-aetherweaver', null];
    config[2] = ['wisdom-martialist', null];
    config[3] = ['wisdom-skirmisher', null];
    const result = optimizeSlots(config, mockPrices);
    expect(Object.keys(result.selectedRecipes)).toHaveLength(3);
  });
});
