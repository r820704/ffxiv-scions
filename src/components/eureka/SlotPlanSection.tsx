import type { LogogramPrice } from '@/types/eureka';
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import type { McDerivedCosts } from '@/utils/mc-analysis';

interface SlotPlanSectionProps {
  slotConfig: [string | null, string | null][];
  prices: LogogramPrice[];
  priceLoading: boolean;
  slotResult: SlotOptimizationResult | null;
  slotOptimizing: boolean;
  slotMcCosts: McDerivedCosts | null;
  isStale: boolean;
  onRunOptimizer: () => void;
  onResetSlots: () => void;
}

export default function SlotPlanSection({
  slotConfig,
  prices,
  priceLoading,
  slotResult,
  slotOptimizing,
  slotMcCosts,
  isStale,
  onRunOptimizer,
  onResetSlots,
}: SlotPlanSectionProps) {
  const filledSlotCount = slotConfig.filter(([s]) => s !== null).length;

  return (
    <div className={`bg-secondary rounded-lg p-3 ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-xs text-muted-foreground">整體花費</span>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-base font-semibold text-primary">
            預估 {slotOptimizing ? '計算中...' : slotMcCosts ? `${Math.round(slotMcCosts.totalCost50).toLocaleString()} Gil` : '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            保底 {slotOptimizing ? '計算中...' : slotMcCosts ? `${Math.round(slotMcCosts.totalCost95).toLocaleString()} Gil` : '—'}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1 gap-2">
        <div className="text-[10px] text-muted-foreground/80">
          預估：50% 分位（中位數）；保底：95% 分位
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onResetSlots}
            disabled={filledSlotCount === 0}
            className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            重置技能格
          </button>
          <button
            onClick={onRunOptimizer}
            disabled={slotOptimizing || priceLoading || prices.length === 0 || filledSlotCount === 0}
            className="text-xs px-3 py-1 rounded bg-amber-600 text-amber-50 hover:bg-amber-500 transition-colors cursor-pointer disabled:bg-amber-600/40 disabled:cursor-not-allowed"
          >
            {slotOptimizing ? '計算中...' : slotResult && !isStale ? '重新計算' : '計算最佳合成'}
          </button>
        </div>
      </div>
      {isStale && (
        <div className="text-[10px] text-amber-400 bg-amber-400/10 rounded px-2 py-1 mt-1.5">
          ⚠ 技能格已變更，請重新計算
        </div>
      )}
    </div>
  );
}
