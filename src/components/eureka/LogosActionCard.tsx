import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { calculateRecipeCost } from '@/utils/eureka-helpers';
import { ROLE_LABELS } from '@/types/eureka';
import PriceDisplay from './PriceDisplay';

interface LogosActionCardProps {
  action: LogosAction;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function LogosActionCard({ action, prices, priceLoading }: LogosActionCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground">{action.nameTw}</h3>
        <div className="flex gap-1 shrink-0">
          {action.roles.map((role) => (
            <span
              key={role}
              className="text-[0.65rem] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
            >
              {ROLE_LABELS[role]}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{action.descriptionTw}</p>
      <div className="space-y-2">
        {action.recipes.map((recipe, ri) => {
          const cost = calculateRecipeCost(recipe.ingredients, prices);
          return (
            <div key={ri} className="rounded bg-muted/50 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {recipe.ingredients.map((ing, ii) => {
                    const mneme = getMneme(ing.mnemeId);
                    const logogram = getLogogramForMneme(ing.mnemeId);
                    const logogramPrice = logogram
                      ? prices.find((p) => p.itemId === logogram.itemId)
                      : undefined;
                    return (
                      <span key={ii} className="text-foreground">
                        {mneme?.nameTw ?? ing.mnemeId}
                        {ing.quantity > 1 && <span className="text-primary"> ×{ing.quantity}</span>}
                        {logogram && (
                          <span className="text-muted-foreground ml-1">
                            ({logogram.nameTw}{' '}
                            <PriceDisplay
                              price={logogramPrice?.price ?? null}
                              worldName={logogramPrice?.worldName ?? null}
                              loading={priceLoading}
                            />
                            )
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="shrink-0 text-right">
                  {priceLoading ? (
                    <span className="text-xs text-muted-foreground">計算中...</span>
                  ) : cost != null ? (
                    <span className="text-xs font-medium text-amber-400">
                      合計 {cost.toLocaleString()} gil
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
