// src/utils/slot-optimizer.ts

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

