import type { RecipeIngredient, LogogramPrice, LogosAction } from '@/types/eureka';
import { eurekaData, getLogogramForMneme } from '@/data/eureka-data';

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

export function findActionsForMnemes(ownedMnemes: Set<string>): LogosAction[] {
  if (ownedMnemes.size === 0) return [];

  return eurekaData.logosActions.filter((action) =>
    action.recipes.some((recipe) =>
      recipe.ingredients.every((ing) => ownedMnemes.has(ing.mnemeId))
    )
  );
}
