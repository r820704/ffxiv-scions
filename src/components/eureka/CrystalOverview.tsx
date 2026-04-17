// src/components/eureka/CrystalOverview.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { LogogramPrice } from '@/types/eureka';
import { eurekaData, getMneme } from '@/data/eureka-data';
import { LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import type { McDerivedCosts } from '@/utils/mc-analysis';
import { cn } from '@/lib/utils';
import { buildPurchasePlan, type PurchasePlan } from '@/utils/purchase-plan';

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
  mcCosts: McDerivedCosts | null;
}

export default function CrystalOverview({
  inventory,
  onSetCount,
  prices,
  priceLoading,
  optimizationResult,
  mcCosts,
}: CrystalOverviewProps) {
  const listingsMap = useMemo(
    () => new Map(prices.map((p) => [p.itemId, p.listings])),
    [prices]
  );

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [mnemeInfoRows, setMnemeInfoRows] = useState<Set<string>>(new Set());

  const [showPopover, setShowPopover] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!showPopover) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverTriggerRef.current?.contains(e.target as Node) ||
        popoverContentRef.current?.contains(e.target as Node)
      ) return;
      setShowPopover(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showPopover]);

  const togglePopover = () => {
    if (!popoverTriggerRef.current) return;
    if (showPopover) {
      setShowPopover(false);
      return;
    }
    const rect = popoverTriggerRef.current.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + 6, left: rect.left });
    setShowPopover(true);
  };

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
          <span className="text-sm font-medium text-primary flex items-center gap-1">
            成本總覽
            <button
              ref={popoverTriggerRef}
              onClick={(e) => { e.stopPropagation(); togglePopover(); }}
              className="shrink-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center cursor-pointer bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              aria-label="查看名詞說明"
            >
              ?
            </button>
          </span>
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
        <div className="grid grid-cols-[1fr_60px_30px_30px_72px] sm:grid-cols-[1fr_60px_30px_30px_72px_72px] gap-1 text-[10px] text-muted-foreground/60 pb-1 border-b border-border mb-1">
          <span>名稱</span>
          <span className="text-center">持有</span>
          <span className="text-right">需求</span>
          <span className="text-right">還需</span>
          <span className="text-right">保底</span>
          <span className="text-right hidden sm:block">預估</span>
        </div>

        {/* Rows — one per logogram (9 total) */}
        {LOGOGRAM_FIXED_ORDER.map((logogramId) => {
          const logogram = logogramMap.get(logogramId);
          if (!logogram) return null;
          const hasOptResult = optimizationResult != null && mcCosts != null;
          const need95 = hasOptResult ? Math.round(mcCosts.opensNeeded95[logogramId] ?? 0) : 0;
          const owned = inventory[logogramId] || 0;
          const remaining95 = hasOptResult ? Math.max(0, need95 - owned) : 0;

          const lineCost95 = hasOptResult ? (mcCosts.costPerLogogram95[logogramId] ?? 0) : 0;
          const lineCost50 = hasOptResult ? (mcCosts.costPerLogogram50[logogramId] ?? 0) : 0;

          const listings = listingsMap.get(logogram.itemId) ?? [];
          const plan = hasOptResult && remaining95 > 0 ? buildPurchasePlan(listings, remaining95) : null;
          const isExpanded = expandedRows.has(logogramId);
          const totalAvailable = listings.reduce((sum, l) => sum + l.quantity, 0);

          // Mneme requirements from optimizer
          const mnemeReqs = optimizationResult?.mnemeNeeds[logogramId];
          const hasMnemeReqs = mnemeReqs && Object.keys(mnemeReqs).length > 0;

          return (
            <div key={logogramId}>
              <div
                className={cn(
                  'grid grid-cols-[1fr_60px_30px_30px_72px] sm:grid-cols-[1fr_60px_30px_30px_72px_72px] gap-1 items-center py-1 text-xs border-b border-border/30',
                  hasOptResult && remaining95 > 0 && 'cursor-pointer hover:bg-secondary/50'
                )}
                onClick={() => hasOptResult && remaining95 > 0 && toggleRow(logogramId)}
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
                  {hasOptResult && remaining95 > 0 && plan && !plan.fulfilled && (
                    <span className="text-[9px] text-red-400" title="市場供應不足">⚠</span>
                  )}
                  {hasOptResult && remaining95 > 0 && (
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
                  {hasOptResult ? `x${need95}` : '—'}
                </span>
                <span
                  className={cn(
                    'text-right font-semibold',
                    !hasOptResult ? 'text-muted-foreground' : remaining95 === 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {hasOptResult ? remaining95 : '—'}
                </span>
                <span className="text-amber-400 text-right">
                  {!hasOptResult
                    ? '—'
                    : priceLoading
                      ? '...'
                      : lineCost95 > 0
                        ? Math.round(lineCost95).toLocaleString()
                        : '—'}
                </span>
                <span className="text-primary text-right hidden sm:block">
                  {!hasOptResult
                    ? '—'
                    : priceLoading
                      ? '...'
                      : lineCost50 > 0
                        ? Math.round(lineCost50).toLocaleString()
                        : '—'}
                </span>
              </div>
              {hasOptResult && !priceLoading && lineCost50 > 0 && (
                <div className="sm:hidden text-[10px] text-primary pl-3 text-right">
                  預估 {Math.round(lineCost50).toLocaleString()}
                </div>
              )}

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
        {/* 總計列 */}
        {mcCosts && (
          <div className="grid grid-cols-[1fr_60px_30px_30px_72px] sm:grid-cols-[1fr_60px_30px_30px_72px_72px] gap-1 items-center pt-2 pb-1 text-xs font-semibold border-t-2 border-border mt-1">
            <span className="text-foreground">總計</span>
            <span></span>
            <span></span>
            <span></span>
            <span className="text-amber-400 text-right">
              {Math.round(mcCosts.totalCost95).toLocaleString()}
            </span>
            <span className="text-primary text-right hidden sm:block">
              {Math.round(mcCosts.totalCost50).toLocaleString()}
            </span>
          </div>
        )}
        {/* Mobile-only stacked 總計 預估 */}
        {mcCosts && (
          <div className="sm:hidden text-[10px] text-primary pl-3 text-right font-semibold">
            預估 {Math.round(mcCosts.totalCost50).toLocaleString()}
          </div>
        )}
      </div>
      {showPopover && popoverPos && createPortal(
        <div
          ref={popoverContentRef}
          className="fixed z-50 max-w-xs p-3 rounded-lg bg-card text-card-foreground text-xs shadow-lg border border-border"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-amber-400">保底</span>
              <span className="ml-1">— 95% 的人不會超過這個金額（保險預算）</span>
            </div>
            <div>
              <span className="font-semibold text-primary">預估</span>
              <span className="ml-1">— 半數人花費在此以下（中位數）</span>
            </div>
            <div className="pt-2 border-t border-border/50 text-muted-foreground">
              每列顯示的需求與花費，是在對應情境下各文理通常會開的次數與花費，加總近似總計。
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
