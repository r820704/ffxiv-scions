// src/utils/recipe-optimizer.ts
//
// Greedy recipe optimizer with local search.
// Selects the best recipe for each multi-recipe skill to minimize
// total 95% probability cost across all logograms.

import type { LogogramPrice } from '@/types/eureka';
import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import { jointLogogramsNeeded95, clearJointCache } from './joint-probability';
import { LOGOGRAM_FIXED_ORDER } from './album-helpers';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));
const logogramMap = new Map(eurekaData.logograms.map((l) => [l.id, l]));

/** Per-logogram mneme needs: logogramId → { mnemeId → quantity } */
export type MnemeNeeds = Record<string, Record<string, number>>;

/** Result of recipe optimization */
export interface OptimizationResult {
  /** Selected recipe index for each skill (skillId → recipe index) */
  selectedRecipes: Record<string, number>;
  /** Aggregated mneme needs per logogram */
  mnemeNeeds: MnemeNeeds;
  /**
   * Monte Carlo simulation: per-iteration per-logogram opens until requirements met.
   * Shape: [iterations][LOGOGRAM_FIXED_ORDER.length].
   * Use with deriveMcCosts (src/utils/mc-analysis) to compute per-logogram and
   * total costs at target percentiles, including inventory-aware variants.
   */
  mcOpensPerIter: number[][];
}

const MC_ITERATIONS = 10000;

/** Get which logograms a recipe touches */
function getRecipeLogograms(skillId: string, recipeIdx: number): Set<string> {
  const action = actionMap.get(skillId);
  if (!action) return new Set();
  const recipe = action.recipes[recipeIdx];
  if (!recipe) return new Set();

  const logograms = new Set<string>();
  for (const ing of recipe.ingredients) {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (logogram) logograms.add(logogram.id);
  }
  return logograms;
}

/**
 * Add a recipe's ingredients to the mneme needs accumulator.
 */
function addRecipeToNeeds(
  needs: MnemeNeeds,
  recipeIdx: number,
  skillId: string,
): void {
  const action = actionMap.get(skillId);
  if (!action) return;
  const recipe = action.recipes[recipeIdx];
  if (!recipe) return;

  for (const ing of recipe.ingredients) {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (!logogram) continue;
    if (!needs[logogram.id]) needs[logogram.id] = {};
    needs[logogram.id]![ing.mnemeId] = (needs[logogram.id]![ing.mnemeId] || 0) + ing.quantity;
  }
}

/**
 * Remove a recipe's ingredients from the mneme needs accumulator.
 */
function removeRecipeFromNeeds(
  needs: MnemeNeeds,
  recipeIdx: number,
  skillId: string,
): void {
  const action = actionMap.get(skillId);
  if (!action) return;
  const recipe = action.recipes[recipeIdx];
  if (!recipe) return;

  for (const ing of recipe.ingredients) {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (!logogram) continue;
    if (!needs[logogram.id]) continue;
    needs[logogram.id]![ing.mnemeId] = (needs[logogram.id]![ing.mnemeId] || 0) - ing.quantity;
    if (needs[logogram.id]![ing.mnemeId]! <= 0) {
      delete needs[logogram.id]![ing.mnemeId];
    }
  }
}

/**
 * Calculate 95% cost for a single logogram given its mneme needs.
 */
function calcLogogramCost(
  logogramId: string,
  needs: MnemeNeeds,
  priceMap: Map<number, number | null>,
): { opens: number; cost: number } {
  const logogram = logogramMap.get(logogramId);
  if (!logogram) return { opens: 0, cost: 0 };

  const mnemeReqs = needs[logogramId];
  if (!mnemeReqs) return { opens: 0, cost: 0 };

  const requirements = Object.values(mnemeReqs).filter((q) => q > 0);
  if (requirements.length === 0) return { opens: 0, cost: 0 };

  const opens = jointLogogramsNeeded95(requirements, logogram.mnemeIds.length);
  const price = priceMap.get(logogram.itemId);
  if (price == null) return { opens, cost: 0 };

  return { opens, cost: opens * price };
}

/**
 * Calculate total 95% cost across all logograms.
 */
function calculateTotalCost95(
  needs: MnemeNeeds,
  priceMap: Map<number, number | null>,
): { totalCost: number; opensNeeded: Record<string, number>; costPerLogogram: Record<string, number> } {
  let totalCost = 0;
  const opensNeeded: Record<string, number> = {};
  const costPerLogogram: Record<string, number> = {};

  for (const logogramId of LOGOGRAM_FIXED_ORDER) {
    const { opens, cost } = calcLogogramCost(logogramId, needs, priceMap);
    opensNeeded[logogramId] = opens;
    costPerLogogram[logogramId] = cost;
    totalCost += cost;
  }

  return { totalCost, opensNeeded, costPerLogogram };
}

/**
 * Calculate the delta in cost when changing only specific logograms.
 * Returns the new total cost.
 */
function calcCostWithAffectedLogograms(
  needs: MnemeNeeds,
  priceMap: Map<number, number | null>,
  affectedLogograms: Set<string>,
  currentCostPerLogogram: Record<string, number>,
  currentTotalCost: number,
): number {
  let newTotal = currentTotalCost;

  for (const logogramId of affectedLogograms) {
    const oldCost = currentCostPerLogogram[logogramId] || 0;
    const { cost: newCost } = calcLogogramCost(logogramId, needs, priceMap);
    newTotal += newCost - oldCost;
  }

  return newTotal;
}

/**
 * Simulate opening a single logogram until all its required mnemes are collected.
 * Returns the number of opens needed (each open draws uniformly from mnemeIds).
 */
function simulateSingleLogogramOpens(
  mnemeIds: string[],
  mnemeReqs: Record<string, number>,
): number {
  const totalTypes = mnemeIds.length;
  if (totalTypes === 0) return 0;

  // Map each mneme index to remaining required quantity (0 if not required)
  const reqByIdx = new Array(totalTypes).fill(0);
  let remainingCount = 0;
  for (let i = 0; i < totalTypes; i++) {
    const id = mnemeIds[i];
    if (id !== undefined) {
      const qty = mnemeReqs[id] ?? 0;
      reqByIdx[i] = qty;
      remainingCount += qty;
    }
  }
  if (remainingCount === 0) return 0;

  let opens = 0;
  while (remainingCount > 0) {
    opens++;
    const idx = Math.floor(Math.random() * totalTypes);
    if (reqByIdx[idx] > 0) {
      reqByIdx[idx]--;
      remainingCount--;
    }
  }
  return opens;
}

/**
 * Run Monte Carlo simulation for total album cost distribution.
 * For each iteration, simulate every logogram independently.
 * Returns per-iteration per-logogram opens matrix.
 */
function runMonteCarlo(
  needs: MnemeNeeds,
  iterations: number = MC_ITERATIONS,
): number[][] {
  const orderedLogograms = LOGOGRAM_FIXED_ORDER.map((id) => {
    const logogram = logogramMap.get(id);
    return {
      mnemeIds: logogram?.mnemeIds ?? [],
      reqs: needs[id] ?? {},
    };
  });

  const opensPerIter: number[][] = new Array(iterations);
  for (let i = 0; i < iterations; i++) {
    const row = new Array(orderedLogograms.length);
    for (let j = 0; j < orderedLogograms.length; j++) {
      const { mnemeIds, reqs } = orderedLogograms[j]!;
      row[j] = simulateSingleLogogramOpens(mnemeIds, reqs);
    }
    opensPerIter[i] = row;
  }
  return opensPerIter;
}

/**
 * Run the greedy recipe optimizer with local search refinement.
 */
export function optimizeRecipes(
  learnedSkills: Set<string>,
  prices: LogogramPrice[],
): OptimizationResult {
  clearJointCache();

  const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
  const unlearnedSkills = ALBUM_ORDER.filter((id) => !learnedSkills.has(id));
  const singleRecipeSkills: string[] = [];
  const multiRecipeSkills: string[] = [];

  for (const skillId of unlearnedSkills) {
    const action = actionMap.get(skillId);
    if (!action) continue;
    if (action.recipes.length <= 1) {
      singleRecipeSkills.push(skillId);
    } else {
      multiRecipeSkills.push(skillId);
    }
  }

  // Initialize with all single-recipe skills
  const selectedRecipes: Record<string, number> = {};
  const needs: MnemeNeeds = {};

  for (const skillId of singleRecipeSkills) {
    selectedRecipes[skillId] = 0;
    addRecipeToNeeds(needs, 0, skillId);
  }

  // Compute initial cost
  let { totalCost, costPerLogogram } = calculateTotalCost95(needs, priceMap);

  // Greedy pass: for each multi-recipe skill, pick the recipe with lowest marginal cost
  for (const skillId of multiRecipeSkills) {
    const action = actionMap.get(skillId)!;
    let bestIdx = 0;
    let bestCost = Infinity;

    for (let ri = 0; ri < action.recipes.length; ri++) {
      const affectedLogograms = getRecipeLogograms(skillId, ri);
      addRecipeToNeeds(needs, ri, skillId);

      const newTotal = calcCostWithAffectedLogograms(
        needs, priceMap, affectedLogograms, costPerLogogram, totalCost
      );

      if (newTotal < bestCost) {
        bestCost = newTotal;
        bestIdx = ri;
      }
      removeRecipeFromNeeds(needs, ri, skillId);
    }

    selectedRecipes[skillId] = bestIdx;
    addRecipeToNeeds(needs, bestIdx, skillId);

    // Update cost tracking
    const affected = getRecipeLogograms(skillId, bestIdx);
    for (const logogramId of affected) {
      const { cost } = calcLogogramCost(logogramId, needs, priceMap);
      costPerLogogram[logogramId] = cost;
    }
    totalCost = bestCost;
  }

  // Local search: iterate until no improvements
  let improved = true;
  let maxIterations = 10;
  while (improved && maxIterations-- > 0) {
    improved = false;
    for (const skillId of multiRecipeSkills) {
      const action = actionMap.get(skillId)!;
      const currentIdx = selectedRecipes[skillId]!;

      // Collect all logograms any recipe of this skill could touch
      const allAffected = new Set<string>();
      for (let ri = 0; ri < action.recipes.length; ri++) {
        for (const logId of getRecipeLogograms(skillId, ri)) {
          allAffected.add(logId);
        }
      }

      // Remove current recipe
      removeRecipeFromNeeds(needs, currentIdx, skillId);

      // Recalculate base cost without this skill's recipe
      let baseCost = totalCost;
      const tempCosts: Record<string, number> = {};
      for (const logogramId of allAffected) {
        const oldCost = costPerLogogram[logogramId] || 0;
        const { cost: newCost } = calcLogogramCost(logogramId, needs, priceMap);
        tempCosts[logogramId] = newCost;
        baseCost += newCost - oldCost;
      }

      let bestIdx = currentIdx;
      let bestCost = Infinity;

      for (let ri = 0; ri < action.recipes.length; ri++) {
        const affected = getRecipeLogograms(skillId, ri);
        addRecipeToNeeds(needs, ri, skillId);

        let candidateCost = baseCost;
        for (const logogramId of affected) {
          const base = tempCosts[logogramId] ?? costPerLogogram[logogramId] ?? 0;
          const { cost: newCost } = calcLogogramCost(logogramId, needs, priceMap);
          candidateCost += newCost - base;
        }

        if (candidateCost < bestCost) {
          bestCost = candidateCost;
          bestIdx = ri;
        }
        removeRecipeFromNeeds(needs, ri, skillId);
      }

      if (bestIdx !== currentIdx) {
        improved = true;
      }

      selectedRecipes[skillId] = bestIdx;
      addRecipeToNeeds(needs, bestIdx, skillId);

      // Update cost tracking
      for (const logogramId of allAffected) {
        const { cost } = calcLogogramCost(logogramId, needs, priceMap);
        costPerLogogram[logogramId] = cost;
      }
      totalCost = bestCost;
    }
  }

  // Monte Carlo simulation for percentile-based cost derivation (see mc-analysis.ts)
  const mcOpensPerIter = runMonteCarlo(needs);

  return {
    selectedRecipes,
    mnemeNeeds: needs,
    mcOpensPerIter,
  };
}
