// src/components/eureka/CrystalOverview.tsx
import { useState, useMemo } from 'react';
import type { LogogramPrice, LogogramListing } from '@/types/eureka';
import { eurekaData } from '@/data/eureka-data';
import { computeCrystalNeeds, computeRemainingCost, LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import { cn } from '@/lib/utils';

const logogramMap = new Map(eurekaData.logograms.map((l) => [l.id, l]));

interface PurchasePlan {
  entries: { worldName: string; quantity: number; pricePerUnit: number }[];
  totalCost: number;
  fulfilled: boolean;
}

function buildPurchasePlan(listings: LogogramListing[], need: number): PurchasePlan {
  const entries: PurchasePlan['entries'] = [];
  let remaining = need;
  let totalCost = 0;

  for (const listing of listings) {
    if (remaining <= 0) break;
    const take = Math.min(listing.quantity, remaining);
    entries.push({
      worldName: listing.worldName,
      quantity: take,
      pricePerUnit: listing.pricePerUnit,
    });
    totalCost += take * listing.pricePerUnit;
    remaining -= take;
  }

  return { entries, totalCost, fulfilled: remaining <= 0 };
}

interface CrystalOverviewProps {
  learnedSkills: Set<string>;
  inventory: Record<string, number>;
  onSetCount: (logogramId: string, count: number) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function CrystalOverview({
  learnedSkills,
  inventory,
  onSetCount,
  prices,
  priceLoading,
}: CrystalOverviewProps) {
  const needs = useMemo(() => computeCrystalNeeds(learnedSkills), [learnedSkills]);
  const remainingCost = useMemo(
    () => computeRemainingCost(learnedSkills, inventory, prices),
    [learnedSkills, inventory, prices]
  );

  const unlearnedCount = 56 - learnedSkills.size;

  const listingsMap = useMemo(
    () => new Map(prices.map((p) => [p.itemId, p.listings])),
    [prices]
  );

  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    () => new Set(LOGOGRAM_FIXED_ORDER)
  );

  const expandAll = () => setExpandedRows(new Set(LOGOGRAM_FIXED_ORDER));
  const collapseAll = () => setExpandedRows(new Set());
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">碎晶總覽</span>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer"
            >
              全部展開
            </button>
            <button
              onClick={collapseAll}
              className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer"
            >
              全部縮合
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_60px_30px_30px_72px] gap-1 text-[10px] text-muted-foreground/60 pb-1 border-b border-border mb-1">
          <span>名稱</span>
          <span className="text-center">持有</span>
          <span className="text-right">需求</span>
          <span className="text-right">還需</span>
          <span className="text-right">花費</span>
        </div>

        {/* Rows — one per logogram (9 total) */}
        {LOGOGRAM_FIXED_ORDER.map((logogramId) => {
          const logogram = logogramMap.get(logogramId);
          if (!logogram) return null;
          const need = needs[logogramId] || 0;
          const owned = inventory[logogramId] || 0;
          const remaining = Math.max(0, need - owned);

          const listings = listingsMap.get(logogram.itemId) ?? [];
          const plan = remaining > 0 ? buildPurchasePlan(listings, remaining) : null;
          const lineCost = plan ? plan.totalCost : 0;
          const isExpanded = expandedRows.has(logogramId);
          const totalAvailable = listings.reduce((sum, l) => sum + l.quantity, 0);

          return (
            <div key={logogramId}>
              <div
                className={cn(
                  'grid grid-cols-[1fr_60px_30px_30px_72px] gap-1 items-center py-1 text-xs border-b border-border/30',
                  remaining > 0 && 'cursor-pointer hover:bg-secondary/50'
                )}
                onClick={() => remaining > 0 && toggleRow(logogramId)}
              >
                <span className="text-xs text-foreground truncate flex items-center gap-1">
                  {logogram.nameTw}
                  {remaining > 0 && plan && !plan.fulfilled && (
                    <span className="text-[9px] text-red-400" title="市場供應不足">⚠</span>
                  )}
                  {remaining > 0 && (
                    <span className="text-[8px] text-muted-foreground/50">{isExpanded ? '▲' : '▼'}</span>
                  )}
                </span>
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetCount(logogramId, owned - 1); }}
                    className="w-4 h-4 rounded-l-sm border border-border bg-secondary text-primary text-[10px] flex items-center justify-center cursor-pointer hover:bg-muted"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={owned}
                    onChange={(e) => onSetCount(logogramId, parseInt(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-4 text-center border-y border-border bg-background text-foreground text-[10px] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetCount(logogramId, owned + 1); }}
                    className="w-4 h-4 rounded-r-sm border border-border bg-secondary text-primary text-[10px] flex items-center justify-center cursor-pointer hover:bg-muted"
                  >
                    +
                  </button>
                </div>
                <span className="text-primary text-right">x{need}</span>
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
                    : lineCost > 0
                      ? lineCost.toLocaleString()
                      : '—'}
                </span>
              </div>

              {/* Purchase plan detail */}
              {isExpanded && plan && (
                <div className="bg-secondary/30 rounded px-3 py-1.5 my-1 text-[10px] space-y-0.5">
                  {plan.entries.map((entry, i) => (
                    <div key={i} className="flex justify-between text-muted-foreground">
                      <span>
                        <span className="text-foreground">{entry.worldName}</span>
                        {' '}x{entry.quantity} @ {entry.pricePerUnit.toLocaleString()} gil
                      </span>
                      <span className="text-amber-400">
                        {(entry.quantity * entry.pricePerUnit).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {!plan.fulfilled && (
                    <div className="text-red-400 pt-0.5">
                      市場供應不足（需 {remaining} 個，僅有 {totalAvailable} 個）
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
