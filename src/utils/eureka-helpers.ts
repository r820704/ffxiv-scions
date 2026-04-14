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
