import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { calculateRecipeCost } from '@/utils/eureka-helpers';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import PriceDisplay from './PriceDisplay';
import ActionDetailTooltip from './ActionDetailTooltip';

interface LogosActionCardProps {
  action: LogosAction;
  prices: LogogramPrice[];
  priceLoading: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function LogosActionCard({ action, prices, priceLoading, isExpanded, onToggleExpand }: LogosActionCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const toggleExpand = onToggleExpand ?? (() => setInternalExpanded((prev) => !prev));
  const [showTooltip, setShowTooltip] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
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

  const updateFlip = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setFlipUp(spaceBelow < 320);
  };

  const handleMouseEnter = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    clearTimeout(hoverTimeoutRef.current);
    updateFlip();
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    hoverTimeoutRef.current = setTimeout(() => setShowTooltip(false), 150);
  };

  const handleTooltipTap = (e: React.MouseEvent) => {
    // On touch devices, let the click bubble up to toggle expand instead
    if (window.matchMedia('(pointer: coarse)').matches) return;
    e.stopPropagation();
    updateFlip();
    setShowTooltip((prev) => !prev);
  };

  const cheapestIdx = useMemo(() => {
    if (action.recipes.length <= 1) return -1;
    let minCost = Infinity;
    let minIdx = -1;
    action.recipes.forEach((recipe, i) => {
      const cost = calculateRecipeCost(recipe.ingredients, prices);
      if (cost != null && cost < minCost) {
        minCost = cost;
        minIdx = i;
      }
    });
    return minIdx;
  }, [action.recipes, prices]);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {/* Header - always visible, clickable to expand */}
      <div
        className="flex items-center justify-between gap-2 cursor-pointer select-none"
        onClick={toggleExpand}
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
                className={`absolute left-0 z-50 ${flipUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}
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
              className={`text-[0.6rem] px-1 py-0.5 rounded ${ROLE_COLORS[role]}`}
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
      {expanded && (() => {
        const hasMultiple = action.recipes.length > 1;
        const maxCols = Math.max(...action.recipes.map((r) => r.ingredients.length));
        const templateCols = `repeat(${maxCols}, max-content) auto`;
        return (
        <div
          className="mt-2 pt-2 border-t border-border/50 grid text-xs"
          style={{ gridTemplateColumns: templateCols }}
        >
          {action.recipes.map((recipe, ri) => {
            const cost = calculateRecipeCost(recipe.ingredients, prices);
            const isCheapest = hasMultiple && cheapestIdx === ri;
            return (
              <Fragment key={ri}>
                {hasMultiple && ri > 0 && (
                  <div className="flex items-center gap-2 my-1.5" style={{ gridColumn: '1 / -1' }}>
                    <div className="flex-1 border-t border-border/50" />
                    <span className="text-[0.6rem] text-muted-foreground/60 shrink-0">或</span>
                    <div className="flex-1 border-t border-border/50" />
                  </div>
                )}
                <div
                  className={`rounded px-3 py-2 items-baseline gap-x-4 ${isCheapest ? 'bg-primary-dark/15 ring-1 ring-primary-dark/40' : 'bg-muted/50'}`}
                  style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'subgrid' }}
                >
                  {recipe.ingredients.map((ing, ii) => {
                    const mneme = getMneme(ing.mnemeId);
                    const logogram = getLogogramForMneme(ing.mnemeId);
                    const logogramPrice = logogram
                      ? prices.find((p) => p.itemId === logogram.itemId)
                      : undefined;
                    return (
                      <div key={ii} className="flex flex-col">
                        <span className="text-foreground flex items-baseline gap-1.5">
                          {hasMultiple && ii === 0 && (
                            <span className="text-[0.6rem] text-muted-foreground/80 bg-muted rounded px-1 py-0.5 shrink-0">
                              {ri + 1}
                            </span>
                          )}
                          <span>
                            {mneme?.nameTw ?? ing.mnemeId}
                            {ing.quantity > 1 && <span className="text-primary"> ×{ing.quantity}</span>}
                          </span>
                        </span>
                        {logogram && (
                          <span className="text-[0.65rem] text-muted-foreground leading-tight">
                            {logogram.nameTw}{' '}
                            <PriceDisplay
                              price={logogramPrice?.price ?? null}
                              worldName={logogramPrice?.worldName ?? null}
                              loading={priceLoading}
                            />
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {Array.from({ length: maxCols - recipe.ingredients.length }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  <div className="text-right justify-self-end">
                    {priceLoading ? (
                      <span className="text-muted-foreground">計算中...</span>
                    ) : cost != null ? (
                      <span className="font-medium text-amber-400">
                        合計 {cost.toLocaleString()} gil
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
        );
      })()}
    </div>
  );
}
