// src/utils/slot-optimizer.ts

import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';
import type { RecipeIngredient, LogogramPrice } from '@/types/eureka';
import { LOGOGRAM_FIXED_ORDER } from './album-helpers';

/** Mneme count → synthesis success rate */
export const SUCCESS_RATE_TABLE: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 0.7,
  5: 0.5,
  6: 0.3,
};

/** 8 slots, each holding 0–2 skill IDs. Index 0–1 = pre-use (dashed), 2–7 = BA (solid). */
export type SlotConfig = [string | null, string | null][];

/** One possible recipe combination for a single slot */
export interface SlotCombination {
  skill1RecipeIdx: number;
  skill2RecipeIdx?: number;
  totalMnemes: number;
  successRate: number;
  /** Phase 1 rough expected cost (median of 1K MC) */
  roughCost: number;
}

/** Result of the two-phase slot optimization */
export interface SlotOptimizationResult {
  /** Per-slot selected recipe indices (slot index → recipe choices) */
  selectedRecipes: Record<number, { skill1RecipeIdx: number; skill2RecipeIdx?: number }>;
  /** MC simulation matrix: [10000][9] — per-iteration per-logogram opens */
  mcOpensPerIter: number[][];
  /** Per-slot recipe combinations with rough costs (for manual switching) */
  slotCombinations: Record<number, SlotCombination[]>;
}

const logogramIndexMap = new Map(LOGOGRAM_FIXED_ORDER.map((id, i) => [id, i]));
const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));
const logogramMap = new Map(eurekaData.logograms.map((l) => [l.id, l]));

/** Ingredients + success rate for one slot's synthesis */
export interface SlotSynthesisNeed {
  ingredients: RecipeIngredient[];
  successRate: number;
}

/**
 * Run Monte Carlo simulation for slot-based synthesis.
 *
 * Each iteration simulates all slots sequentially:
 * 1. For each slot, gather required mnemes (open logograms, random diceroll per open)
 * 2. Attempt synthesis with given success rate
 * 3. On failure, mnemes are lost — re-gather and retry
 * 4. Surplus mnemes from opens are pooled for later slots
 *
 * Returns: [iterations][9] matrix of per-logogram total opens.
 */
export function simulateSlotMC(
  slotNeeds: SlotSynthesisNeed[],
  iterations: number,
): number[][] {
  const numLogograms = LOGOGRAM_FIXED_ORDER.length; // 9

  // Pre-compute per-ingredient: which logogram index, which mneme indices in that logogram
  interface PreparedIngredient {
    mnemeId: string;
    quantity: number;
    logogramIdx: number;
    logogramMnemeIds: string[];
  }

  const preparedSlots: PreparedIngredient[][] = slotNeeds.map((need) =>
    need.ingredients.map((ing) => {
      const logogram = getLogogramForMneme(ing.mnemeId);
      const logogramIdx = logogram ? (logogramIndexMap.get(logogram.id) ?? -1) : -1;
      return {
        mnemeId: ing.mnemeId,
        quantity: ing.quantity,
        logogramIdx,
        logogramMnemeIds: logogram?.mnemeIds ?? [],
      };
    }),
  );

  const result: number[][] = new Array(iterations);

  for (let iter = 0; iter < iterations; iter++) {
    const opens = new Array<number>(numLogograms).fill(0);
    // Global memory pool: mnemeId → count of surplus mnemes
    const pool: Record<string, number> = {};

    for (let si = 0; si < slotNeeds.length; si++) {
      const need = slotNeeds[si]!;
      const prepared = preparedSlots[si]!;
      if (prepared.length === 0) continue;

      // Retry loop for synthesis failure
      let success = false;
      while (!success) {
        // Gather all required mnemes for this slot
        for (const prep of prepared) {
          let remaining = prep.quantity;
          // Draw from pool first
          const pooled = pool[prep.mnemeId] ?? 0;
          const fromPool = Math.min(pooled, remaining);
          if (fromPool > 0) {
            pool[prep.mnemeId] = pooled - fromPool;
            remaining -= fromPool;
          }
          // Open logograms for the rest
          while (remaining > 0) {
            if (prep.logogramIdx < 0) break;
            opens[prep.logogramIdx]++;
            const totalTypes = prep.logogramMnemeIds.length;
            const rolledIdx = Math.floor(Math.random() * totalTypes);
            const rolledMneme = prep.logogramMnemeIds[rolledIdx]!;
            if (rolledMneme === prep.mnemeId) {
              remaining--;
            } else {
              // Surplus goes to pool
              pool[rolledMneme] = (pool[rolledMneme] ?? 0) + 1;
            }
          }
        }

        // Synthesis diceroll
        if (Math.random() < need.successRate) {
          success = true;
        }
        // On failure: mnemes are consumed (lost), loop again
      }
    }

    result[iter] = opens;
  }

  return result;
}

const MC_PHASE1 = 1000;
const MC_PHASE2 = 10000;
const MAX_COMBOS_FOR_MC = 1000;

/**
 * Calculate analytical expected cost for a set of slot synthesis needs.
 * Used as a fast approximation for pruning in Phase 1.
 *
 * Formula per slot: Σ(quantity × logogram_mneme_count × logogram_price) / successRate
 */
function analyticalCost(
  slotNeeds: SlotSynthesisNeed[],
  priceMap: Map<number, number | null>,
): number {
  let total = 0;
  for (const need of slotNeeds) {
    let slotCost = 0;
    for (const ing of need.ingredients) {
      const logogram = getLogogramForMneme(ing.mnemeId);
      if (!logogram) continue;
      const price = priceMap.get(logogram.itemId) ?? 0;
      const expectedOpens = ing.quantity * logogram.mnemeIds.length;
      slotCost += expectedOpens * (price ?? 0);
    }
    total += slotCost / need.successRate;
  }
  return total;
}

/**
 * Build SlotSynthesisNeed[] from slot config and recipe index choices.
 */
function buildSlotNeeds(
  config: SlotConfig,
  recipeChoices: Record<number, { skill1RecipeIdx: number; skill2RecipeIdx?: number }>,
): SlotSynthesisNeed[] {
  const needs: SlotSynthesisNeed[] = [];
  for (const [slotIdx, choice] of Object.entries(recipeChoices)) {
    const idx = Number(slotIdx);
    const slot = config[idx];
    if (!slot) continue;
    const [skillId1, skillId2] = slot;

    const allIngredients: RecipeIngredient[] = [];
    if (skillId1) {
      const action1 = actionMap.get(skillId1);
      const recipe1 = action1?.recipes[choice.skill1RecipeIdx];
      if (recipe1) allIngredients.push(...recipe1.ingredients);
    }
    if (skillId2 && choice.skill2RecipeIdx !== undefined) {
      const action2 = actionMap.get(skillId2);
      const recipe2 = action2?.recipes[choice.skill2RecipeIdx];
      if (recipe2) allIngredients.push(...recipe2.ingredients);
    }

    const totalMnemes = allIngredients.reduce((sum, ing) => sum + ing.quantity, 0);
    const successRate = SUCCESS_RATE_TABLE[totalMnemes] ?? 0.3;

    needs.push({ ingredients: allIngredients, successRate });
  }
  return needs;
}

/**
 * Enumerate all recipe combinations for each non-empty slot.
 */
function enumerateSlotCombos(
  config: SlotConfig,
): { slotIdx: number; combos: Omit<SlotCombination, 'roughCost'>[] }[] {
  const result: { slotIdx: number; combos: Omit<SlotCombination, 'roughCost'>[] }[] = [];

  for (let i = 0; i < config.length; i++) {
    const [skillId1, skillId2] = config[i]!;
    if (!skillId1) continue;

    const action1 = actionMap.get(skillId1);
    if (!action1) continue;

    const combos: Omit<SlotCombination, 'roughCost'>[] = [];

    if (!skillId2) {
      for (let r1 = 0; r1 < action1.recipes.length; r1++) {
        const totalMnemes = action1.recipes[r1]!.ingredients.reduce(
          (sum, ing) => sum + ing.quantity,
          0,
        );
        combos.push({
          skill1RecipeIdx: r1,
          totalMnemes,
          successRate: SUCCESS_RATE_TABLE[totalMnemes] ?? 1.0,
        });
      }
    } else {
      const action2 = actionMap.get(skillId2);
      if (!action2) continue;
      for (let r1 = 0; r1 < action1.recipes.length; r1++) {
        for (let r2 = 0; r2 < action2.recipes.length; r2++) {
          const m1 = action1.recipes[r1]!.ingredients.reduce(
            (sum, ing) => sum + ing.quantity,
            0,
          );
          const m2 = action2.recipes[r2]!.ingredients.reduce(
            (sum, ing) => sum + ing.quantity,
            0,
          );
          const totalMnemes = m1 + m2;
          combos.push({
            skill1RecipeIdx: r1,
            skill2RecipeIdx: r2,
            totalMnemes,
            successRate: SUCCESS_RATE_TABLE[totalMnemes] ?? 0.3,
          });
        }
      }
    }

    result.push({ slotIdx: i, combos });
  }

  return result;
}

/**
 * Two-phase slot optimizer.
 *
 * Phase 1: Enumerate all global recipe combinations. If > MAX_COMBOS_FOR_MC,
 * use analytical cost to prune to the top MAX_COMBOS_FOR_MC. Then run 1K MC
 * iterations on each candidate to get rough cost. Pick the best.
 *
 * Phase 2: Run 10K MC on the best combination for precise 50%/95% percentiles.
 */
export function optimizeSlots(
  config: SlotConfig,
  prices: LogogramPrice[],
): SlotOptimizationResult {
  const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
  const slotCombos = enumerateSlotCombos(config);

  // No slots populated → return empty result
  if (slotCombos.length === 0) {
    return {
      selectedRecipes: {},
      mcOpensPerIter: Array.from({ length: MC_PHASE2 }, () => new Array(9).fill(0)),
      slotCombinations: {},
    };
  }

  // Build all global combinations via cartesian product
  type GlobalCombo = Record<number, { skill1RecipeIdx: number; skill2RecipeIdx?: number }>;
  let globalCombos: GlobalCombo[] = [{}];

  for (const { slotIdx, combos } of slotCombos) {
    const expanded: GlobalCombo[] = [];
    for (const existing of globalCombos) {
      for (const combo of combos) {
        expanded.push({
          ...existing,
          [slotIdx]: {
            skill1RecipeIdx: combo.skill1RecipeIdx,
            skill2RecipeIdx: combo.skill2RecipeIdx,
          },
        });
      }
    }
    globalCombos = expanded;
  }

  // Phase 1: Prune if too many combinations
  if (globalCombos.length > MAX_COMBOS_FOR_MC) {
    const scored = globalCombos.map((combo) => ({
      combo,
      cost: analyticalCost(buildSlotNeeds(config, combo), priceMap),
    }));
    scored.sort((a, b) => a.cost - b.cost);
    globalCombos = scored.slice(0, MAX_COMBOS_FOR_MC).map((s) => s.combo);
  }

  // Phase 1: Run rough MC on all candidates
  let bestCombo = globalCombos[0]!;
  let bestMedian = Infinity;

  for (const combo of globalCombos) {
    const needs = buildSlotNeeds(config, combo);
    const mcResult = simulateSlotMC(needs, MC_PHASE1);
    const iterCosts = mcResult.map((row) => {
      let cost = 0;
      for (let j = 0; j < row.length; j++) {
        const logogramId = LOGOGRAM_FIXED_ORDER[j]!;
        const logogram = logogramMap.get(logogramId);
        if (!logogram || row[j] === 0) continue;
        const price = priceMap.get(logogram.itemId) ?? 0;
        cost += row[j]! * (price ?? 0);
      }
      return cost;
    });
    iterCosts.sort((a, b) => a - b);
    const median = iterCosts[Math.floor(iterCosts.length / 2)]!;
    if (median < bestMedian) {
      bestMedian = median;
      bestCombo = combo;
    }
  }

  // Phase 2: Run full MC on best combination
  const bestNeeds = buildSlotNeeds(config, bestCombo);
  const mcOpensPerIter = simulateSlotMC(bestNeeds, MC_PHASE2);

  // Build slotCombinations output (with rough costs)
  const slotCombinations: Record<number, SlotCombination[]> = {};
  for (const { slotIdx, combos } of slotCombos) {
    slotCombinations[slotIdx] = combos.map((c) => {
      const singleNeed = buildSlotNeeds(config, {
        [slotIdx]: { skill1RecipeIdx: c.skill1RecipeIdx, skill2RecipeIdx: c.skill2RecipeIdx },
      });
      const roughCost = analyticalCost(singleNeed, priceMap);
      return { ...c, roughCost };
    });
    slotCombinations[slotIdx]!.sort((a, b) => a.roughCost - b.roughCost);
  }

  return {
    selectedRecipes: bestCombo,
    mcOpensPerIter,
    slotCombinations,
  };
}

