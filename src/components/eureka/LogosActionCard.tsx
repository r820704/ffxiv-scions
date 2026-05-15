import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { calculateRecipeCostsMC } from '@/utils/eureka-helpers';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import ActionDetailTooltip from './ActionDetailTooltip';
import { cn } from '@/lib/utils';

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
  /** When set, only show the recipe at this index (album guide mode — single-recipe filter) */
  guideRecipeIdx?: number;
  /** Highlight this recipe with primary color (slot guide mode — does NOT filter to only-this) */
  highlightRecipeIdx?: number;
  /** When true, hide all price/cost information */
  hidePrice?: boolean;
  /** Show full materials + per-ingredient unit prices but skip the per-recipe total-cost summary */
  showUnitPriceOnly?: boolean;
  /** Render recipes in this index order (slot guide mode — user selection sorted to top) */
  recipeOrder?: number[];
  /** When set, recipe wrapper becomes clickable; receives original recipe index */
  onRecipeClick?: (recipeIdx: number) => void;
  /** When true, ingredients render vertically (one per line) and the topmost recipe gets a "▶ 用於計算" badge */
  compactLayout?: boolean;
  /** Slot context badge shown in the card header (slot-mode only) */
  slotBadge?: SlotBadgeInfo;
  /** When provided, render a learned-state toggle inside the card header. */
  isLearned?: boolean;
  onToggleLearned?: () => void;
}

export default function LogosActionCard({
  action, prices, priceLoading, isExpanded, onToggleExpand, guideRecipeIdx, hidePrice, slotBadge,
  highlightRecipeIdx, showUnitPriceOnly, recipeOrder, onRecipeClick, compactLayout,
  isLearned, onToggleLearned,
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
            className={`ml-auto shrink-0 ${slotBadge.successRate >= 1.0 ? 'text-green-400' : 'text-warning'}`}
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
          {onToggleLearned && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLearned();
              }}
              aria-label={isLearned ? '取消已習得' : '標記為已習得'}
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded border cursor-pointer transition-colors shrink-0',
                isLearned
                  ? 'border-primary-dark text-primary-dark bg-primary-dark/10 hover:bg-primary-dark/20'
                  : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground',
              )}
            >
              {isLearned ? '✓ 已習得' : '標記習得'}
            </button>
          )}
          <span className="text-muted-foreground text-xs ml-1">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Recipes - collapsible */}
      {expanded && (() => {
        const isGuide = guideRecipeIdx != null;
        const baseOrder = recipeOrder ?? action.recipes.map((_, i) => i);
        const recipesToShow = isGuide
          ? [{ recipe: action.recipes[guideRecipeIdx]!, ri: guideRecipeIdx }]
          : baseOrder.map((ri) => ({ recipe: action.recipes[ri]!, ri }));
        const hasMultiple = !isGuide && action.recipes.length > 1;
        const showTotalCost = !hidePrice && !showUnitPriceOnly;
        if (compactLayout) {
          return (
            <div className="mt-2 pt-2 border-t border-border/50 flex flex-col gap-1.5 text-xs">
              {recipesToShow.map(({ recipe, ri }, idx) => {
                const isCheapest = hasMultiple && cheapestIdx === ri;
                const isHighlighted = highlightRecipeIdx === ri;
                const wrapperBg = isHighlighted
                  ? 'bg-primary/15 ring-1 ring-primary/40'
                  : isCheapest
                    ? 'bg-primary-dark/15 ring-1 ring-primary-dark/40'
                    : 'bg-muted/50';
                const clickable = onRecipeClick != null;
                return (
                  <Fragment key={ri}>
                    {hasMultiple && idx > 0 && (
                      <div className="flex items-center gap-2 my-0.5">
                        <div className="flex-1 border-t border-border/50" />
                        <span className="text-[0.6rem] text-muted-foreground/60 shrink-0">或</span>
                        <div className="flex-1 border-t border-border/50" />
                      </div>
                    )}
                    <div
                      className={`rounded px-2.5 py-1.5 ${wrapperBg} ${clickable ? 'cursor-pointer hover:ring-1 hover:ring-primary/30' : ''}`}
                      onClick={clickable ? () => onRecipeClick(ri) : undefined}
                    >
                      <div className="grid gap-x-2 gap-y-0.5 items-baseline" style={{ gridTemplateColumns: 'max-content max-content max-content' }}>
                        {recipe.ingredients.map((ing, ii) => {
                          const mneme = getMneme(ing.mnemeId);
                          const logogram = getLogogramForMneme(ing.mnemeId);
                          const logogramPrice = !hidePrice && logogram
                            ? prices.find((p) => p.itemId === logogram.itemId)
                            : undefined;
                          return (
                            <Fragment key={ii}>
                              <span className="text-foreground">
                                {mneme?.nameTw ?? ing.mnemeId}
                                {ing.quantity > 1 && <span className="text-primary"> ×{ing.quantity}</span>}
                              </span>
                              <span className="text-[0.65rem] text-muted-foreground">
                                {logogram?.nameTw ?? ''}
                              </span>
                              <span className="text-[0.65rem] text-gil tabular-nums">
                                {!hidePrice && logogram && (
                                  priceLoading ? (
                                    <span className="inline-block h-3 w-12 bg-muted animate-pulse rounded" />
                                  ) : logogramPrice?.price != null ? (
                                    `${logogramPrice.price.toLocaleString()} gil`
                                  ) : (
                                    <span className="text-muted-foreground">價格未知</span>
                                  )
                                )}
                              </span>
                            </Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          );
        }
        return (
        <div className="mt-2 pt-2 border-t border-border/50 flex flex-col gap-2 text-xs">
          {recipesToShow.map(({ recipe, ri }, idx) => {
            const costs = recipeCosts?.[ri] ?? null;
            const cost95 = costs?.cost95 ?? null;
            const cost50 = costs?.cost50 ?? null;
            const isCheapest = hasMultiple && cheapestIdx === ri;
            const isHighlighted = highlightRecipeIdx === ri;
            const wrapperBg = isHighlighted
              ? 'bg-primary/15 ring-1 ring-primary/40'
              : isCheapest
                ? 'bg-primary-dark/15 ring-1 ring-primary-dark/40'
                : 'bg-muted/50';
            const clickable = onRecipeClick != null;
            return (
              <Fragment key={ri}>
                {hasMultiple && idx > 0 && (
                  <div className="flex items-center gap-2 my-0.5">
                    <div className="flex-1 border-t border-border/50" />
                    <span className="text-[0.6rem] text-muted-foreground/60 shrink-0">或</span>
                    <div className="flex-1 border-t border-border/50" />
                  </div>
                )}
                <div
                  className={`rounded px-3 py-2 ${wrapperBg} ${clickable ? 'cursor-pointer hover:ring-1 hover:ring-primary/30' : ''}`}
                  onClick={clickable ? () => onRecipeClick(ri) : undefined}
                >
                  <div className="flex flex-col gap-1.5">
                    {recipe.ingredients.map((ing, ii) => {
                      const mneme = getMneme(ing.mnemeId);
                      const logogram = getLogogramForMneme(ing.mnemeId);
                      const logogramPrice = !hidePrice && logogram
                        ? prices.find((p) => p.itemId === logogram.itemId)
                        : undefined;
                      return (
                        <div key={ii} className="flex flex-col gap-0.5">
                          <span className="text-foreground flex items-baseline gap-1.5 flex-wrap">
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
                            <span className="text-[0.65rem] text-muted-foreground leading-tight flex items-baseline gap-1 flex-wrap">
                              <span className="shrink-0">{logogram.nameTw}</span>
                              {!hidePrice && (
                                priceLoading ? (
                                  <span className="inline-block h-3 w-16 bg-muted animate-pulse rounded" />
                                ) : logogramPrice?.price != null ? (
                                  <>
                                    <span className="text-gil font-medium tabular-nums">
                                      {logogramPrice.price.toLocaleString()} gil
                                    </span>
                                    {logogramPrice.worldName && (
                                      <span>@ {logogramPrice.worldName}</span>
                                    )}
                                  </>
                                ) : (
                                  <span>價格未知</span>
                                )
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {showTotalCost && (
                      <div className="border-t border-border/30 pt-1 mt-0.5 flex items-baseline justify-end flex-wrap gap-x-2">
                        {priceLoading ? (
                          <span className="text-muted-foreground">計算中...</span>
                        ) : cost50 != null && cost95 != null ? (
                          <>
                            <span className="font-medium text-gil">
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
