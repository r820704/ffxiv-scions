// src/utils/album-helpers.ts
import type { LogogramPrice, RecipeIngredient } from '@/types/eureka';
import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';

// Fixed display order for mnemes in crystal overview (never reorder)
export const MNEME_FIXED_ORDER: string[] = eurekaData.mnemes.map((m) => m.id);

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

function cheapestRecipe(actionId: string): RecipeIngredient[] {
  const action = actionMap.get(actionId);
  if (!action || action.recipes.length === 0) return [];
  // For now, just pick the first recipe (cheapest selection deferred to price-aware version)
  return action.recipes[0].ingredients;
}

export function computeCrystalNeeds(
  learnedSkills: Set<string>
): Record<string, number> {
  const needs: Record<string, number> = {};
  for (const id of MNEME_FIXED_ORDER) {
    needs[id] = 0;
  }

  for (const skillId of ALBUM_ORDER) {
    if (learnedSkills.has(skillId)) continue;
    const ingredients = cheapestRecipe(skillId);
    for (const ing of ingredients) {
      needs[ing.mnemeId] = (needs[ing.mnemeId] || 0) + ing.quantity;
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

  for (const mnemeId of MNEME_FIXED_ORDER) {
    const need = needs[mnemeId] || 0;
    const owned = inventory[mnemeId] || 0;
    const remaining = Math.max(0, need - owned);
    if (remaining === 0) continue;

    const logogram = getLogogramForMneme(mnemeId);
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

  for (const mnemeId of MNEME_FIXED_ORDER) {
    const need = needs[mnemeId] || 0;
    if (need === 0) continue;

    const logogram = getLogogramForMneme(mnemeId);
    if (!logogram) continue;
    const price = priceMap.get(logogram.itemId);
    if (price == null) return null;

    total += need * price;
  }

  return total;
}
