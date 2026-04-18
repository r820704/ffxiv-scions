import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { calculateRecipeCostsMC } from '@/utils/eureka-helpers';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import ActionDetailTooltip from './ActionDetailTooltip';

export interface SlotBadgeInfo {
  slotIdx: number;
  successRate: number;
  partnerSkill?: { nameTw: string; iconId: number } | null;
}

interface LogosActionCardProps {
  action: LogosAction;
  prices: LogogramPrice[];
  priceLoading: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** When set, only show the recipe at this index (guide mode) */
  guideRecipeIdx?: number;
  /** When true, hide all price/cost information (guide mode) */
  hidePrice?: boolean;
  /** Slot context badge shown in the card header (slot-mode only) */
  slotBadge?: SlotBadgeInfo;
}

export default function LogosActionCard({
  action, prices, priceLoading, isExpanded, onToggleExpand, guideRecipeIdx, hidePrice, slotBadge,
}: LogosActionCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const toggleExpand = onToggleExpand ?? (() => setInternalExpanded((prev) => !prev));
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; flipUp: boolean } | null>(null);
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

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < 320;
    setTooltipPos({
      top: flipUp ? rect.top : rect.bottom,
      left: rect.left,
      flipUp,
    });
  };

  const handleMouseEnter = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    clearTimeout(hoverTimeoutRef.current);
    updatePosition();
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
    updatePosition();
    setShowTooltip((prev) => !prev);
  };

  const recipeCosts = useMemo(() => {
    if (hidePrice || prices.length === 0) return null;
    return action.recipes.map((recipe) =>
      calculateRecipeCostsMC(recipe.ingredients, prices)
    );
  }, [action.recipes, prices, hidePrice]);

  const cheapestIdx = useMemo(() => {
    if (!recipeCosts || action.recipes.length <= 1) return -1;
    let minCost = Infinity;
    let minIdx = -1;
    recipeCosts.forEach((costs, i) => {
      if (costs != null && costs.cost95 < minCost) {
        minCost = costs.cost95;
        minIdx = i;
      }
    });
    return minIdx;
  }, [recipeCosts, action.recipes.length]);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {slotBadge && (
        <div className="flex items-center gap-2 mb-2 flex-wrap text-[11px]">
          <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
            格 {slotBadge.slotIdx + 1}
          </span>
          {slotBadge.partnerSkill && (
            <span className="flex items-center gap-1 text-muted-foreground/80">
              <span className="text-muted-foreground/50">+</span>
              <img
                src={`https://xivapi.com/i/064000/0${slotBadge.partnerSkill.iconId}.png`}
                alt={slotBadge.partnerSkill.nameTw}
                className="w-4 h-4 shrink-0"
                loading="lazy"
              />
              <span>{slotBadge.partnerSkill.nameTw}</span>
            </span>
          )}
          <span
            className={`ml-auto shrink-0 ${slotBadge.successRate >= 1.0 ? 'text-green-400' : 'text-amber-400'}`}
          >
            {Math.round(slotBadge.successRate * 100)}% 成功
          </span>
        </div>
      )}
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
            {showTooltip && tooltipPos && createPortal(
              <div
                ref={tooltipRef}
                className="fixed z-50"
                style={{
                  left: tooltipPos.left,
                  ...(tooltipPos.flipUp
                    ? { bottom: window.innerHeight - tooltipPos.top + 4 }
                    : { top: tooltipPos.top + 4 }),
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ActionDetailTooltip action={action} />
              </div>,
              document.body,
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
        const isGuide = guideRecipeIdx != null;
        const recipesToShow = isGuide
          ? [{ recipe: action.recipes[guideRecipeIdx]!, ri: guideRecipeIdx }]
          : action.recipes.map((recipe, ri) => ({ recipe, ri }));
        const hasMultiple = !isGuide && action.recipes.length > 1;
        const maxCols = Math.max(...recipesToShow.map((r) => r.recipe.ingredients.length));
        const templateCols = `repeat(${maxCols}, max-content)${hidePrice ? '' : ' auto'}`;
        return (
        <div
          className="mt-2 pt-2 border-t border-border/50 grid text-xs"
          style={{ gridTemplateColumns: templateCols }}
        >
          {recipesToShow.map(({ recipe, ri }, idx) => {
            const costs = recipeCosts?.[ri] ?? null;
            const cost95 = costs?.cost95 ?? null;
            const cost50 = costs?.cost50 ?? null;
            const isCheapest = hasMultiple && cheapestIdx === ri;
            return (
              <Fragment key={ri}>
                {hasMultiple && idx > 0 && (
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
                    const logogramPrice = !hidePrice && logogram
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
                          <span className="text-[0.65rem] text-muted-foreground leading-tight flex">
                            <span className="shrink-0">{logogram.nameTw}</span>
                            {!hidePrice && (
                              priceLoading ? (
                                <span className="inline-block h-3 w-16 bg-muted animate-pulse rounded ml-1" />
                              ) : logogramPrice?.price != null ? (
                                <>
                                  <span className="text-amber-400 font-medium tabular-nums min-w-[4.5rem] text-right ml-0.5">
                                    {logogramPrice.price.toLocaleString()} gil
                                  </span>
                                  {logogramPrice.worldName && (
                                    <span className="ml-1">@ {logogramPrice.worldName}</span>
                                  )}
                                </>
                              ) : (
                                <span className="ml-1">價格未知</span>
                              )
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {Array.from({ length: maxCols - recipe.ingredients.length }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {!hidePrice && (
                    <div className="text-right justify-self-end flex flex-col items-end gap-0.5">
                      {priceLoading ? (
                        <span className="text-muted-foreground">計算中...</span>
                      ) : cost50 != null && cost95 != null ? (
                        <>
                          <span className="font-medium text-amber-400">
                            預估 {cost50.toLocaleString()} gil
                          </span>
                          <span className="text-[0.6rem] text-muted-foreground">
                            （保底 {cost95.toLocaleString()} gil）
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  )}
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
