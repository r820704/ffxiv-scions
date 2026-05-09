import type { LogogramPrice } from '@/types/eureka';
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import type { McDerivedCosts } from '@/utils/mc-analysis';
import { Button } from '@/components/ui/button';

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
    <div className="bg-secondary rounded-lg p-3">
      <div className={`flex justify-between items-baseline gap-2 ${isStale ? 'opacity-50' : ''}`}>
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
        <div className={`text-[10px] text-muted-foreground/80 ${isStale ? 'opacity-50' : ''}`}>
          預估：50% 分位（中位數）；保底：95% 分位
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="destructive"
            size="xs"
            onClick={onResetSlots}
            disabled={filledSlotCount === 0}
            className="bg-destructive/70 hover:bg-destructive"
          >
            重置技能格
          </Button>
          <button
            onClick={onRunOptimizer}
            disabled={slotOptimizing || priceLoading || prices.length === 0 || filledSlotCount === 0}
            className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:bg-primary/40 disabled:cursor-not-allowed"
          >
            {slotOptimizing ? '計算中...' : slotResult && !isStale ? '重新計算' : '計算最佳合成'}
          </button>
        </div>
      </div>
      {isStale && (
        <div className="text-[10px] text-warning bg-warning/10 rounded px-2 py-1 mt-1.5">
          ⚠ 技能格已變更，請重新計算
        </div>
      )}
    </div>
  );
}
