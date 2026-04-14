// src/utils/album-helpers.ts
import type { LogogramPrice, RecipeIngredient, LogosAction, Recipe } from '@/types/eureka';
import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';

// Fixed display order for logograms in crystal overview (never reorder)
export const LOGOGRAM_FIXED_ORDER: string[] = eurekaData.logograms.map((l) => l.id);

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

function cheapestRecipe(actionId: string): RecipeIngredient[] {
  const action = actionMap.get(actionId);
  if (!action || action.recipes.length === 0) return [];
  return action.recipes[0]!.ingredients;
}

/**
 * Compute how many of each logogram (碎晶) are needed for all unlearned skills.
 * Aggregates mneme needs up to their parent logogram.
 */
export function computeCrystalNeeds(
  learnedSkills: Set<string>
): Record<string, number> {
  const needs: Record<string, number> = {};
  for (const id of LOGOGRAM_FIXED_ORDER) {
    needs[id] = 0;
  }

  for (const skillId of ALBUM_ORDER) {
    if (learnedSkills.has(skillId)) continue;
    const ingredients = cheapestRecipe(skillId);
    for (const ing of ingredients) {
      const logogram = getLogogramForMneme(ing.mnemeId);
      if (!logogram) continue;
      needs[logogram.id] = (needs[logogram.id] || 0) + ing.quantity;
    }
  }

  return needs;
}

export function computeRemainingCost(
  learnedSkills: Set<string>,
  inventory: Record<string, number>,
  prices: LogogramPrice[]
): number | null {
  if (prices.length === 0) return null;

  const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
  const needs = computeCrystalNeeds(learnedSkills);
  let total = 0;

  for (const logogramId of LOGOGRAM_FIXED_ORDER) {
    const need = needs[logogramId] || 0;
    const owned = inventory[logogramId] || 0;
    const remaining = Math.max(0, need - owned);
    if (remaining === 0) continue;

    const logogram = eurekaData.logograms.find((l) => l.id === logogramId);
    if (!logogram) continue;
    const price = priceMap.get(logogram.itemId);
    if (price == null) return null;

    total += remaining * price;
  }

  return total;
}

export function computeFullCost(prices: LogogramPrice[]): number | null {
  if (prices.length === 0) return null;

  const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
  const needs = computeCrystalNeeds(new Set());
  let total = 0;

  for (const logogramId of LOGOGRAM_FIXED_ORDER) {
    const need = needs[logogramId] || 0;
    if (need === 0) continue;

    const logogram = eurekaData.logograms.find((l) => l.id === logogramId);
    if (!logogram) continue;
    const price = priceMap.get(logogram.itemId);
    if (price == null) return null;

    total += need * price;
  }

  return total;
}

/**
 * Check if a skill can be crafted with current inventory.
 * Returns true if at least one recipe's materials are all satisfied.
 * Simple check — does not consider cross-skill material competition.
 */
export function isCraftable(
  action: LogosAction,
  inventory: Record<string, number>
): boolean {
  return action.recipes.some((recipe) =>
    recipe.ingredients.every((ing) => {
      const logogram = getLogogramForMneme(ing.mnemeId);
      if (!logogram) return false;
      const owned = inventory[logogram.id] ?? 0;
      return owned >= ing.quantity;
    })
  );
}

/**
 * Deduct recipe ingredients from inventory and return new inventory.
 * Does NOT mutate the original inventory.
 */
export function synthesizeRecipe(
  recipe: Recipe,
  inventory: Record<string, number>
): Record<string, number> {
  const next = { ...inventory };
  for (const ing of recipe.ingredients) {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (logogram) {
      next[logogram.id] = (next[logogram.id] ?? 0) - ing.quantity;
    }
  }
  return next;
}
