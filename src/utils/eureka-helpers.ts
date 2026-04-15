import type { RecipeIngredient, LogogramPrice } from '@/types/eureka';
import { getLogogramForMneme } from '@/data/eureka-data';

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
 * of a specific mneme with >= 95% probability.
 * Each logogram has `totalMnemes` possible outcomes (equal probability).
 */
export function logogramsNeeded95(needed: number, totalMnemes: number): number {
  if (totalMnemes <= 1) return needed;
  const p = 1 / totalMnemes;
  const confidence = 0.95;
  // Start from the minimum possible and search upward
  for (let n = needed; n <= needed * totalMnemes * 5; n++) {
    if (1 - binomialCdfAtMost(needed - 1, n, p) >= confidence) {
      return n;
    }
  }
  return needed; // fallback
}

/**
 * Calculate recipe cost at 95% confidence, accounting for random mneme drops.
 * Each ingredient's logogram count is calculated independently.
 */
export function calculateRecipeCost95(
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

    const n = logogramsNeeded95(ingredient.quantity, logogram.mnemeIds.length);
    total += price * n;
  }

  return total;
}
