// src/components/eureka/CrystalOverview.tsx
import { useMemo } from 'react';
import type { LogogramPrice } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { computeCrystalNeeds, computeRemainingCost, MNEME_FIXED_ORDER } from '@/utils/album-helpers';
import { cn } from '@/lib/utils';

interface CrystalOverviewProps {
  learnedSkills: Set<string>;
  inventory: Record<string, number>;
  onSetMnemeCount: (mnemeId: string, count: number) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function CrystalOverview({
  learnedSkills,
  inventory,
  onSetMnemeCount,
  prices,
  priceLoading,
}: CrystalOverviewProps) {
  const needs = useMemo(() => computeCrystalNeeds(learnedSkills), [learnedSkills]);
  const remainingCost = useMemo(
    () => computeRemainingCost(learnedSkills, inventory, prices),
    [learnedSkills, inventory, prices]
  );

  const unlearnedCount = 56 - learnedSkills.size;

  const priceMap = useMemo(() => new Map(prices.map((p) => [p.itemId, p.price])), [prices]);

  return (
    <div className="space-y-3">
      {/* Cost summary */}
      <div className="bg-secondary rounded-lg p-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">還需花費</span>
          <span className="text-lg font-bold text-amber-400">
            {priceLoading
              ? '...'
              : remainingCost != null
                ? `${remainingCost.toLocaleString()} Gil`
                : '價格未知'}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">{unlearnedCount} 個技能未習得</div>
      </div>

      {/* Crystal table */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="text-xs font-medium text-primary mb-2">碎晶總覽</div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_60px_30px_30px_52px] gap-1 text-[9px] text-muted-foreground/60 pb-1 border-b border-border mb-1">
          <span>名稱</span>
          <span className="text-center">持有</span>
          <span className="text-right">需求</span>
          <span className="text-right">還需</span>
          <span className="text-right">花費</span>
        </div>

        {/* Rows */}
        {MNEME_FIXED_ORDER.map((mnemeId) => {
          const mneme = getMneme(mnemeId);
          if (!mneme) return null;
          const need = needs[mnemeId] || 0;
          const owned = inventory[mnemeId] || 0;
          const remaining = Math.max(0, need - owned);

          const logogram = getLogogramForMneme(mnemeId);
          const unitPrice = logogram ? priceMap.get(logogram.itemId) ?? null : null;
          const lineCost = unitPrice != null ? remaining * unitPrice : null;

          // Skip mnemes with 0 need to keep the list compact
          if (need === 0) return null;

          return (
            <div
              key={mnemeId}
              className="grid grid-cols-[1fr_60px_30px_30px_52px] gap-1 items-center py-0.5 text-[10px] border-b border-border/30"
            >
              <span className="text-foreground truncate">{mneme.nameTw}</span>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => onSetMnemeCount(mnemeId, owned - 1)}
                  className="w-4 h-4 rounded-l-sm border border-border bg-secondary text-primary text-[10px] flex items-center justify-center cursor-pointer hover:bg-muted"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  value={owned}
                  onChange={(e) => onSetMnemeCount(mnemeId, parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="w-7 h-4 text-center border-y border-border bg-background text-foreground text-[10px] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => onSetMnemeCount(mnemeId, owned + 1)}
                  className="w-4 h-4 rounded-r-sm border border-border bg-secondary text-primary text-[10px] flex items-center justify-center cursor-pointer hover:bg-muted"
                >
                  +
                </button>
              </div>
              <span className="text-primary text-right">×{need}</span>
              <span
                className={cn(
                  'text-right font-semibold',
                  remaining === 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {remaining}
              </span>
              <span className="text-amber-400 text-right">
                {priceLoading
                  ? '...'
                  : lineCost != null && lineCost > 0
                    ? `${Math.floor(lineCost / 1000)}k`
                    : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
