// src/utils/mc-analysis.ts
//
// Derive per-logogram costs and total costs from a Monte Carlo simulation matrix,
// using conditional expectation at target percentiles to ensure Σ per-row ≈ total.

import type { LogogramListing } from '@/types/eureka';
import { buildPurchasePlan } from './purchase-plan';

export interface McDerivedCosts {
  /** Per-logogram opens needed at 95% percentile (conditional expectation) */
  opensNeeded95: Record<string, number>;
  /** Per-logogram opens needed at 50% percentile (conditional expectation) */
  opensNeeded50: Record<string, number>;
  /** Per-logogram cost at 95% percentile, using tiered market purchase */
  costPerLogogram95: Record<string, number>;
  /** Per-logogram cost at 50% percentile */
  costPerLogogram50: Record<string, number>;
  /** Total cost at 95% percentile (mean of iterations in window near 95%) */
  totalCost95: number;
  /** Total cost at 50% percentile (mean of iterations in window near 50%) */
  totalCost50: number;
}

export interface DeriveMcCostsInput {
  /** [iterations][logogram-column] matrix of opens counts */
  mcOpensPerIter: number[][];
  /** Column index → logogram id (length === mcOpensPerIter[i].length) */
  logogramOrder: string[];
  /** logogram id → current inventory count */
  inventory: Record<string, number>;
  /** logogram id → market listings (sorted by price ASC) */
  listingsByLogogramId: Map<string, LogogramListing[]>;
}

/** Window half-width around target percentile: ±1% */
const WINDOW_HALF = 0.01;

/**
 * Derive per-logogram + total costs at 50% and 95% percentiles from MC output.
 *
 * Strategy: for each iteration, compute the total cost using tiered market
 * purchase (buildPurchasePlan). Sort iterations by total cost. For each target
 * percentile, take the iterations in the ±1% window and average their per-column
 * opens → per-logogram need. Per-logogram cost = buildPurchasePlan(avg need).
 * Total cost = mean of window iteration totals.
 *
 * This guarantees Σ per-logogram cost ≈ total cost (within ~1-2% drift).
 */
export function deriveMcCosts(input: DeriveMcCostsInput): McDerivedCosts {
  const { mcOpensPerIter, logogramOrder, inventory, listingsByLogogramId } = input;

  const zeroCosts = (): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const id of logogramOrder) out[id] = 0;
    return out;
  };

  if (mcOpensPerIter.length === 0) {
    return {
      opensNeeded95: zeroCosts(),
      opensNeeded50: zeroCosts(),
      costPerLogogram95: zeroCosts(),
      costPerLogogram50: zeroCosts(),
      totalCost95: 0,
      totalCost50: 0,
    };
  }

  const N = mcOpensPerIter.length;
  const numLogograms = logogramOrder.length;

  // Compute per-logogram cost for each iteration, and sum to get total.
  // Storing per-logogram costs lets us average them in a percentile window
  // so that Σ(per-logogram avg) = avg(total) exactly (linearity of mean).
  const costsPerIter = new Array<Float64Array>(N);
  const totalsPerIter = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const row = mcOpensPerIter[i]!;
    const logogramCosts = new Float64Array(numLogograms);
    let total = 0;
    for (let j = 0; j < numLogograms; j++) {
      const logogramId = logogramOrder[j]!;
      const opens = row[j] ?? 0;
      const owned = inventory[logogramId] ?? 0;
      const remaining = Math.max(0, opens - owned);
      if (remaining > 0) {
        const listings = listingsByLogogramId.get(logogramId) ?? [];
        logogramCosts[j] = buildPurchasePlan(listings, remaining).totalCost;
      }
      total += logogramCosts[j]!;
    }
    costsPerIter[i] = logogramCosts;
    totalsPerIter[i] = total;
  }

  const sortedIdx = Array.from({ length: N }, (_, i) => i).sort(
    (a, b) => totalsPerIter[a]! - totalsPerIter[b]!,
  );

  const windowIndices = (targetPct: number): number[] => {
    const low = Math.max(0, Math.floor(N * (targetPct - WINDOW_HALF)));
    const high = Math.min(N, Math.ceil(N * (targetPct + WINDOW_HALF)));
    if (high <= low) return [sortedIdx[Math.min(N - 1, Math.floor(N * targetPct))]!];
    return sortedIdx.slice(low, high);
  };

  const window95 = windowIndices(0.95);
  const window50 = windowIndices(0.5);

  const avgOpens = (window: number[]): Record<string, number> => {
    const sums = new Array<number>(numLogograms).fill(0);
    for (const idx of window) {
      const row = mcOpensPerIter[idx]!;
      for (let j = 0; j < numLogograms; j++) {
        sums[j]! += row[j] ?? 0;
      }
    }
    const out: Record<string, number> = {};
    for (let j = 0; j < numLogograms; j++) {
      out[logogramOrder[j]!] = sums[j]! / window.length;
    }
    return out;
  };

  const avgCosts = (window: number[]): Record<string, number> => {
    const sums = new Array<number>(numLogograms).fill(0);
    for (const idx of window) {
      const costs = costsPerIter[idx]!;
      for (let j = 0; j < numLogograms; j++) {
        sums[j]! += costs[j]!;
      }
    }
    const out: Record<string, number> = {};
    for (let j = 0; j < numLogograms; j++) {
      out[logogramOrder[j]!] = sums[j]! / window.length;
    }
    return out;
  };

  const opensNeeded95 = avgOpens(window95);
  const opensNeeded50 = avgOpens(window50);

  const costPerLogogram95 = avgCosts(window95);
  const costPerLogogram50 = avgCosts(window50);

  const windowMean = (window: number[]): number => {
    let sum = 0;
    for (const idx of window) sum += totalsPerIter[idx]!;
    return sum / window.length;
  };

  return {
    opensNeeded95,
    opensNeeded50,
    costPerLogogram95,
    costPerLogogram50,
    totalCost95: windowMean(window95),
    totalCost50: windowMean(window50),
  };
}
