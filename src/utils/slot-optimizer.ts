// src/utils/slot-optimizer.ts

import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';
import type { RecipeIngredient } from '@/types/eureka';
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

