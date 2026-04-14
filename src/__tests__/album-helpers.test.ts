// src/__tests__/album-helpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeCrystalNeeds,
  computeRemainingCost,
  LOGOGRAM_FIXED_ORDER,
  isCraftable,
  synthesizeRecipe,
  computeSlotNeeds,
} from '@/utils/album-helpers';
import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogogramPrice } from '@/types/eureka';
import type { SkillSlotRow } from '@/hooks/useSkillSlots';

describe('LOGOGRAM_FIXED_ORDER', () => {
  it('should contain all logogram IDs from eurekaData', () => {
    const allLogogramIds = eurekaData.logograms.map((l) => l.id);
    expect(LOGOGRAM_FIXED_ORDER).toEqual(allLogogramIds);
  });

  it('should have exactly 9 entries', () => {
    expect(LOGOGRAM_FIXED_ORDER).toHaveLength(9);
  });
});

describe('ALBUM_ORDER', () => {
  it('should contain exactly 56 entries', () => {
    expect(ALBUM_ORDER).toHaveLength(56);
  });

  it('should contain only valid logosAction IDs', () => {
    const validIds = new Set(eurekaData.logosActions.map((a) => a.id));
    for (const id of ALBUM_ORDER) {
      expect(validIds.has(id), `${id} not found in logosActions`).toBe(true);
    }
  });
});

describe('computeCrystalNeeds', () => {
  it('should return zero needs when all skills are learned', () => {
    const allLearned = new Set(ALBUM_ORDER);
    const needs = computeCrystalNeeds(allLearned);
    for (const id of LOGOGRAM_FIXED_ORDER) {
      expect(needs[id]).toBe(0);
    }
  });

  it('should return total needs when no skills are learned', () => {
    const noneLearned = new Set<string>();
    const needs = computeCrystalNeeds(noneLearned);
    const totalNeeds = Object.values(needs).reduce((a, b) => a + b, 0);
    expect(totalNeeds).toBeGreaterThan(0);
  });

  it('should aggregate mneme needs to logogram level', () => {
    const needs = computeCrystalNeeds(new Set());
    // All keys should be logogram IDs, not mneme IDs
    for (const key of Object.keys(needs)) {
      expect(LOGOGRAM_FIXED_ORDER).toContain(key);
    }
  });

  it('should exclude learned skills from needs', () => {
    const allLearned = new Set(ALBUM_ORDER);
    const oneLearned = new Set([ALBUM_ORDER[0]!]);
    const needsAll = computeCrystalNeeds(allLearned);
    const needsOne = computeCrystalNeeds(oneLearned);
    const needsNone = computeCrystalNeeds(new Set());
    const totalAll = Object.values(needsAll).reduce((a, b) => a + b, 0);
    const totalOne = Object.values(needsOne).reduce((a, b) => a + b, 0);
    const totalNone = Object.values(needsNone).reduce((a, b) => a + b, 0);
    expect(totalAll).toBe(0);
    expect(totalOne).toBeLessThan(totalNone);
  });
});

describe('computeRemainingCost', () => {
  const mockPrices: LogogramPrice[] = eurekaData.logograms.map((l) => ({
    itemId: l.itemId,
    price: 1000,
    worldName: 'TestWorld',
    lastUpdated: Date.now(),
    listings: [{ pricePerUnit: 1000, quantity: 999, worldName: 'TestWorld' }],
  }));

  it('should return 0 when all skills learned', () => {
    const allLearned = new Set(ALBUM_ORDER);
    const cost = computeRemainingCost(allLearned, {}, mockPrices);
    expect(cost).toBe(0);
  });

  it('should deduct inventory from cost (inventory keyed by logogram ID)', () => {
    const learned = new Set<string>();
    const noInv = computeRemainingCost(learned, {}, mockPrices);
    const fullInv: Record<string, number> = {};
    LOGOGRAM_FIXED_ORDER.forEach((id) => { fullInv[id] = 999; });
    const withInv = computeRemainingCost(learned, fullInv, mockPrices);
    expect(withInv).toBe(0);
    expect(noInv).toBeGreaterThan(0);
  });

  it('should return null when prices unavailable', () => {
    const cost = computeRemainingCost(new Set(), {}, []);
    expect(cost).toBeNull();
  });
});

describe('isCraftable', () => {
  it('should return true when inventory has enough logograms for a recipe', () => {
    const action = eurekaData.logosActions.find(a => a.id === 'wisdom-aetherweaver')!;
    const logogram = getLogogramForMneme(action.recipes[0]!.ingredients[0]!.mnemeId)!;
    const inventory = { [logogram.id]: 1 };
    expect(isCraftable(action, inventory)).toBe(true);
  });

  it('should return false when inventory is empty', () => {
    const action = eurekaData.logosActions.find(a => a.id === 'wisdom-aetherweaver')!;
    expect(isCraftable(action, {})).toBe(false);
  });

  it('should return false when inventory has insufficient quantity', () => {
    const action = eurekaData.logosActions.find(a => a.id === 'wisdom-aetherweaver')!;
    const logogram = getLogogramForMneme(action.recipes[0]!.ingredients[0]!.mnemeId)!;
    const inventory = { [logogram.id]: 0 };
    expect(isCraftable(action, inventory)).toBe(false);
  });

  it('should return true if ANY recipe is craftable', () => {
    const multiRecipeAction = eurekaData.logosActions.find(a => a.recipes.length > 1)!;
    const recipe = multiRecipeAction.recipes[0]!;
    const inventory: Record<string, number> = {};
    for (const ing of recipe.ingredients) {
      const logogram = getLogogramForMneme(ing.mnemeId)!;
      inventory[logogram.id] = (inventory[logogram.id] ?? 0) + ing.quantity;
    }
    expect(isCraftable(multiRecipeAction, inventory)).toBe(true);
  });
});

describe('synthesizeRecipe', () => {
  it('should deduct ingredient logograms from inventory', () => {
    const action = eurekaData.logosActions.find(a => a.id === 'wisdom-aetherweaver')!;
    const recipe = action.recipes[0]!;
    const logogram = getLogogramForMneme(recipe.ingredients[0]!.mnemeId)!;
    const inventory = { [logogram.id]: 5 };
    const result = synthesizeRecipe(recipe, inventory);
    expect(result[logogram.id]).toBe(4); // 5 - 1
  });

  it('should handle multi-ingredient recipes', () => {
    const action = eurekaData.logosActions.find(a =>
      a.recipes.some(r => r.ingredients.length >= 2)
    )!;
    const recipe = action.recipes.find(r => r.ingredients.length >= 2)!;
    const inventory: Record<string, number> = {};
    for (const ing of recipe.ingredients) {
      const logogram = getLogogramForMneme(ing.mnemeId)!;
      inventory[logogram.id] = (inventory[logogram.id] ?? 0) + ing.quantity + 2;
    }
    const result = synthesizeRecipe(recipe, inventory);
    for (const ing of recipe.ingredients) {
      const logogram = getLogogramForMneme(ing.mnemeId)!;
      expect(result[logogram.id]).toBe(inventory[logogram.id]! - ing.quantity);
    }
  });

  it('should not mutate original inventory', () => {
    const action = eurekaData.logosActions.find(a => a.id === 'wisdom-aetherweaver')!;
    const recipe = action.recipes[0]!;
    const logogram = getLogogramForMneme(recipe.ingredients[0]!.mnemeId)!;
    const inventory = { [logogram.id]: 5 };
    const result = synthesizeRecipe(recipe, inventory);
    expect(inventory[logogram.id]).toBe(5);
    expect(result[logogram.id]).toBe(4);
  });
});

describe('computeSlotNeeds', () => {
  it('should return empty needs for empty slots', () => {
    const emptySlots: SkillSlotRow[] = Array.from({ length: 6 }, () => [null, null]);
    const needs = computeSlotNeeds(emptySlots);
    const total = Object.values(needs).reduce((a, b) => a + b, 0);
    expect(total).toBe(0);
  });

  it('should compute needs for filled slots', () => {
    const slots: SkillSlotRow[] = Array.from({ length: 6 }, () => [null, null]);
    slots[0] = ['wisdom-aetherweaver', null];
    const needs = computeSlotNeeds(slots);
    const total = Object.values(needs).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('should aggregate needs from multiple slots', () => {
    const slots1: SkillSlotRow[] = Array.from({ length: 6 }, () => [null, null]);
    slots1[0] = ['wisdom-aetherweaver', null];

    const slots2: SkillSlotRow[] = Array.from({ length: 6 }, () => [null, null]);
    slots2[0] = ['wisdom-aetherweaver', null];
    slots2[1] = ['wisdom-martialist', null];

    const needs1 = computeSlotNeeds(slots1);
    const needs2 = computeSlotNeeds(slots2);
    const total1 = Object.values(needs1).reduce((a, b) => a + b, 0);
    const total2 = Object.values(needs2).reduce((a, b) => a + b, 0);
    expect(total2).toBeGreaterThan(total1);
  });
});
