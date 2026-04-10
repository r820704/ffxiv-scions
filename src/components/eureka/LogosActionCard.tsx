import { useState, useRef, useEffect } from 'react';
import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { calculateRecipeCost } from '@/utils/eureka-helpers';
import { ROLE_LABELS } from '@/types/eureka';
import PriceDisplay from './PriceDisplay';
import ActionDetailTooltip from './ActionDetailTooltip';

interface LogosActionCardProps {
  action: LogosAction;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function LogosActionCard({ action, prices, priceLoading }: LogosActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!showTooltip) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) return;
      setShowTooltip(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showTooltip]);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setShowTooltip(false), 150);
  };

  const handleTooltipTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {/* Header - always visible, clickable to expand */}
      <div
        className="flex items-center justify-between gap-2 cursor-pointer select-none"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative" ref={triggerRef}>
            <div
              className="flex items-center gap-2"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleTooltipTap}
            >
              <img
                src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                alt={action.nameTw}
                className="w-7 h-7 shrink-0"
                loading="lazy"
              />
              <span className="text-sm font-semibold text-foreground underline decoration-dotted underline-offset-2">
                {action.nameTw}
              </span>
            </div>
            {showTooltip && (
              <div
                ref={tooltipRef}
                className="absolute left-0 top-full mt-1 z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ActionDetailTooltip action={action} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {action.roles.map((role) => (
            <span
              key={role}
              className="text-[0.6rem] px-1 py-0.5 rounded bg-secondary text-secondary-foreground"
            >
              {ROLE_LABELS[role]}
            </span>
          ))}
          <span className="text-muted-foreground text-xs ml-1">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Recipes - collapsible */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border/50">
          {action.recipes.map((recipe, ri) => {
            const cost = calculateRecipeCost(recipe.ingredients, prices);
            const hasMultiple = action.recipes.length > 1;
            return (
              <div key={ri}>
                {hasMultiple && ri > 0 && (
                  <div className="flex items-center gap-2 my-1.5">
                    <div className="flex-1 border-t border-border/50" />
                    <span className="text-[0.6rem] text-muted-foreground/60 shrink-0">或</span>
                    <div className="flex-1 border-t border-border/50" />
                  </div>
                )}
                <div className="rounded bg-muted/50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs min-w-0">
                      {hasMultiple && (
                        <span className="text-[0.6rem] text-muted-foreground/80 bg-muted rounded px-1 py-0.5 shrink-0">
                          {ri + 1}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
