// src/components/eureka/CrystalOverview.tsx
import { useState, useMemo } from 'react';
import type { LogogramPrice } from '@/types/eureka';
import { eurekaData, getMneme } from '@/data/eureka-data';
import { LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import { cn } from '@/lib/utils';
import { buildPurchasePlan } from '@/utils/purchase-plan';
import type { PurchasePlan } from '@/utils/purchase-plan';

const logogramMap = new Map(eurekaData.logograms.map((l) => [l.id, l]));

interface GroupedEntry {
  worldName: string;
  quantity: number;
  totalCost: number;
  avgPrice: number;
}

function groupEntriesByWorld(entries: PurchasePlan['entries']): GroupedEntry[] {
  const map = new Map<string, { quantity: number; totalCost: number }>();
  for (const entry of entries) {
    const existing = map.get(entry.worldName);
    const cost = entry.quantity * entry.pricePerUnit;
    if (existing) {
      existing.quantity += entry.quantity;
      existing.totalCost += cost;
    } else {
      map.set(entry.worldName, { quantity: entry.quantity, totalCost: cost });
    }
  }
  return Array.from(map.entries()).map(([worldName, { quantity, totalCost }]) => ({
    worldName,
    quantity,
    totalCost,
    avgPrice: Math.round(totalCost / quantity),
  }));
}

interface CrystalOverviewProps {
  inventory: Record<string, number>;
  onSetCount: (logogramId: string, count: number) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
  optimizationResult: OptimizationResult | null;
}

export default function CrystalOverview({
  inventory,
  onSetCount,
  prices,
  priceLoading,
  optimizationResult,
}: CrystalOverviewProps) {
  const listingsMap = useMemo(
    () => new Map(prices.map((p) => [p.itemId, p.listings])),
    [prices]
  );

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [mnemeInfoRows, setMnemeInfoRows] = useState<Set<string>>(new Set());

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

  const toggleMnemeInfo = (id: string) => {
    setMnemeInfoRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Crystal table */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-primary">95% 機率成本總覽</span>
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
          const hasOptResult = optimizationResult != null;
          const need = hasOptResult ? (optimizationResult.opensNeeded[logogramId] || 0) : 0;
          const owned = inventory[logogramId] || 0;
          const remaining = hasOptResult ? Math.max(0, need - owned) : 0;

          const listings = listingsMap.get(logogram.itemId) ?? [];
          const plan = hasOptResult && remaining > 0 ? buildPurchasePlan(listings, remaining) : null;
          const lineCost = plan ? plan.totalCost : 0;
          const isExpanded = expandedRows.has(logogramId);
          const totalAvailable = listings.reduce((sum, l) => sum + l.quantity, 0);

          // Mneme requirements from optimizer
          const mnemeReqs = optimizationResult?.mnemeNeeds[logogramId];
          const hasMnemeReqs = mnemeReqs && Object.keys(mnemeReqs).length > 0;

          return (
            <div key={logogramId}>
              <div
                className={cn(
                  'grid grid-cols-[1fr_60px_30px_30px_72px] gap-1 items-center py-1 text-xs border-b border-border/30',
                  hasOptResult && remaining > 0 && 'cursor-pointer hover:bg-secondary/50'
                )}
                onClick={() => hasOptResult && remaining > 0 && toggleRow(logogramId)}
              >
                <span className="text-xs text-foreground truncate flex items-center gap-1">
                  {logogram.nameTw}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMnemeInfo(logogramId); }}
                    className={cn(
                      'shrink-0 w-4 h-4 rounded-full text-[9px] flex items-center justify-center cursor-pointer transition-colors',
                      mnemeInfoRows.has(logogramId)
                        ? 'bg-primary/30 text-primary'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    )}
                    title="查看可鑑定的記憶"
                  >
                    i
                  </button>
                  {hasOptResult && remaining > 0 && plan && !plan.fulfilled && (
                    <span className="text-[9px] text-red-400" title="市場供應不足">⚠</span>
                  )}
                  {hasOptResult && remaining > 0 && (
                    <span className={cn(
                      'text-[8px]',
                      isExpanded ? 'text-muted-foreground/50' : 'text-primary/60'
                    )}>
                      {isExpanded ? '▲' : '▼ 購買方案'}
                    </span>
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
                <span className="text-primary text-right">
                  {hasOptResult ? `x${need}` : '—'}
                </span>
                <span
                  className={cn(
                    'text-right font-semibold',
                    !hasOptResult ? 'text-muted-foreground' : remaining === 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {hasOptResult ? remaining : '—'}
                </span>
                <span className="text-amber-400 text-right">
                  {!hasOptResult
                    ? '—'
                    : priceLoading
                      ? '...'
                      : lineCost > 0
                        ? lineCost.toLocaleString()
                        : '—'}
                </span>
              </div>

              {/* Mneme requirements from optimizer — always visible */}
              {hasMnemeReqs && (
                <div className="text-[10px] text-muted-foreground pl-3 py-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-muted-foreground/60">需要：</span>
                  {Object.entries(mnemeReqs).map(([mnemeId, qty]) => {
                    const mneme = getMneme(mnemeId);
                    return (
                      <span key={mnemeId} className="text-foreground">
                        {mneme?.nameTw ?? mnemeId}
                        {qty > 1 && <span className="text-primary"> ×{qty}</span>}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Mneme info — list of all mnemes this logogram can produce */}
              {mnemeInfoRows.has(logogramId) && (
                <div className="text-[10px] text-muted-foreground pl-3 py-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="text-muted-foreground/60">可鑑定：</span>
                  {logogram.mnemeIds.map((mnemeId) => {
                    const mneme = getMneme(mnemeId);
                    return (
                      <span key={mnemeId} className="text-foreground">
                        {mneme?.nameTw ?? mnemeId}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Purchase plan detail — single inline row */}
              {isExpanded && plan && (
                <div className="text-[10px] text-muted-foreground pl-3 pb-1 whitespace-nowrap overflow-x-auto">
                  {groupEntriesByWorld(plan.entries).map((g, i) => (
                    <span key={g.worldName}>
                      {i > 0 && <span className="mx-1.5 text-muted-foreground/30">|</span>}
                      <span className="text-foreground">{g.worldName}</span>
                      {' '}x{g.quantity} 均價 {g.avgPrice.toLocaleString()} gil
                    </span>
                  ))}
                  {!plan.fulfilled && (
                    <span className="ml-2 text-red-400">
                      (供應不足，僅有 {totalAvailable} 個)
                    </span>
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
