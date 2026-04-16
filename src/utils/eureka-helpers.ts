import type { RecipeIngredient, LogogramPrice } from '@/types/eureka';
import { getLogogramForMneme } from '@/data/eureka-data';
import { buildProbCurve } from './joint-probability';

export function calculateRecipeCost(
  ingredients: RecipeIngredient[],
  prices: LogogramPrice[]
): number | null {
  const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
  let total = 0;

  for (const ingredient of ingredients) {
    const logogram = getLogogramForMneme(ingredient.mnemeId);
    if (!logogram) return null;

    const price = priceMap.get(logogram.itemId);
    if (price == null) return null;

    total += price * ingredient.quantity;
  }

  return total;
}

/**
 * Calculate the cumulative probability of getting at least k successes
 * in n trials with success probability p per trial.
 * P(X >= k) = 1 - P(X <= k-1) where X ~ Binomial(n, p)
 */
function binomialCdfAtMost(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let sum = 0;
  let term = Math.pow(1 - p, n); // P(X=0)
  sum += term;
  for (let i = 1; i <= k; i++) {
    term *= (p / (1 - p)) * ((n - i + 1) / i);
    sum += term;
  }
  return Math.min(sum, 1);
}

/**
 * Find the minimum number of logograms needed to get at least `needed`
 * of a specific mneme with >= `confidence` probability.
 * Each logogram has `totalMnemes` possible outcomes (equal probability).
 *
 * @throws {RangeError} if confidence is not in (0, 1]
 */
export function logogramsNeededN(needed: number, totalMnemes: number, confidence: number): number {
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence > 1) {
    throw new RangeError(`confidence must be in (0, 1], got ${confidence}`);
  }
  if (totalMnemes <= 1) return needed;
  const p = 1 / totalMnemes;
  // Start from the minimum possible and search upward
  for (let n = needed; n <= needed * totalMnemes * 5; n++) {
    if (1 - binomialCdfAtMost(needed - 1, n, p) >= confidence) {
      return n;
    }
  }
  return needed; // fallback
}

/**
 * Find the minimum number of logograms needed to get at least `needed`
 * of a specific mneme with >= 95% probability.
 * Each logogram has `totalMnemes` possible outcomes (equal probability).
 */
export function logogramsNeeded95(needed: number, totalMnemes: number): number {
  return logogramsNeededN(needed, totalMnemes, 0.95);
}

/**
 * Calculate recipe cost at the given joint `confidence` level (Method B greedy).
 *
 * Groups ingredients by source logogram, then greedily allocates opens across
 * logograms to minimise total gil spend while keeping the joint probability of
 * satisfying every ingredient requirement at >= confidence.
 *
 * For single-logogram recipes this collapses to the same answer as the previous
 * per-ingredient calculation. For multi-logogram recipes it spends more — but
 * the resulting cost actually buys a true `confidence` chance of crafting the
 * skill, making cross-recipe cost comparison meaningful.
 *
 * @throws {RangeError} if confidence is not in (0, 1]
 */
export function calculateRecipeCostN(
  ingredients: RecipeIngredient[],
  prices: LogogramPrice[],
  confidence: number,
): number | null {
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence > 1) {
    throw new RangeError(`confidence must be in (0, 1], got ${confidence}`);
  }

  const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));

  // Group ingredients by source logogram
  interface Group {
    logogramId: string;
    itemId: number;
    totalTypes: number;
    requirements: number[];
    price: number;
  }
  const groupMap = new Map<string, Group>();

  for (const ingredient of ingredients) {
    const logogram = getLogogramForMneme(ingredient.mnemeId);
    if (!logogram) return null;
    const price = priceMap.get(logogram.itemId);
    if (price == null) return null;

    let group = groupMap.get(logogram.id);
    if (!group) {
      group = {
        logogramId: logogram.id,
        itemId: logogram.itemId,
        totalTypes: logogram.mnemeIds.length,
        requirements: [],
        price,
      };
      groupMap.set(logogram.id, group);
    }
    group.requirements.push(ingredient.quantity);
  }

  const groups = Array.from(groupMap.values());
  if (groups.length === 0) return 0;

  const TARGET = confidence;

  // Build per-group probability curve. maxN per group: the n that achieves a
  // very high single-group confidence (0.99) is more than enough headroom for
  // the greedy to find a joint allocation.
  const curves: Float64Array[] = [];
  const minN: number[] = [];

  for (const g of groups) {
    // Estimate generous upper bound: enough opens for that group alone to hit ~99.9%.
    // sum(requirements) * totalTypes * 5 mirrors the bound in jointLogogramsNeededN.
    const sumReqs = g.requirements.reduce((a, b) => a + b, 0);
    const upper = Math.max(sumReqs * g.totalTypes * 5, 50);
    curves.push(buildProbCurve(g.requirements, g.totalTypes, upper));
    // Minimum n for any chance of success: must draw at least sum(requirements) times
    minN.push(sumReqs);
  }

  // Initialise each group at its minimum-feasible n (where probability first becomes > 0).
  const ns = minN.slice();

  // Greedy: while joint prob < TARGET, increment the group with best Δlog p / price ratio.
  // Cap iterations as a safety net; the upper bound above guarantees feasibility.
  const maxSteps = curves.reduce((acc, c) => acc + c.length, 0);
  for (let step = 0; step < maxSteps; step++) {
    let logJoint = 0;
    for (let i = 0; i < groups.length; i++) {
      const p = curves[i]![ns[i]!]!;
      if (p <= 0) {
        logJoint = -Infinity;
        break;
      }
      logJoint += Math.log(p);
    }
    if (logJoint >= Math.log(TARGET)) break;

    // Find best group to increment
    let bestIdx = -1;
    let bestRatio = -Infinity;
    for (let i = 0; i < groups.length; i++) {
      const curve = curves[i]!;
      const cur = ns[i]!;
      if (cur + 1 >= curve.length) continue; // out of range, skip
      const pCur = curve[cur]!;
      const pNext = curve[cur + 1]!;
      if (pNext <= 0) continue;
      // Δlog p (use log(pNext) when pCur is 0 to avoid -Infinity dominating)
      const dLog = pCur > 0 ? Math.log(pNext) - Math.log(pCur) : Math.log(pNext);
      const ratio = dLog / groups[i]!.price;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break; // nothing to increment
    ns[bestIdx]!++;
  }

  let total = 0;
  for (let i = 0; i < groups.length; i++) {
    total += groups[i]!.price * ns[i]!;
  }
  return total;
}

/**
 * Calculate recipe cost at 95% joint confidence. Back-compat wrapper around
 * {@link calculateRecipeCostN}.
 */
export function calculateRecipeCost95(
  ingredients: RecipeIngredient[],
  prices: LogogramPrice[],
): number | null {
  return calculateRecipeCostN(ingredients, prices, 0.95);
}

/**
 * Calculate recipe cost at 50% joint confidence (median cost). Wrapper around
 * {@link calculateRecipeCostN}.
 */
export function calculateRecipeCost50(
  ingredients: RecipeIngredient[],
  prices: LogogramPrice[],
): number | null {
  return calculateRecipeCostN(ingredients, prices, 0.5);
}
