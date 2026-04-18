import type { LogogramPrice } from '@/types/eureka';
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import type { McDerivedCosts } from '@/utils/mc-analysis';
import SlotRecipeList from './SlotRecipeList';

interface SlotPlanSectionProps {
  slotConfig: [string | null, string | null][];
  prices: LogogramPrice[];
  priceLoading: boolean;
  slotResult: SlotOptimizationResult | null;
  slotOptimizing: boolean;
  slotMcCosts: McDerivedCosts | null;
  isStale: boolean;
  onRunOptimizer: () => void;
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
}: SlotPlanSectionProps) {
  const filledSlotCount = slotConfig.filter(([s]) => s !== null).length;
  const emptySlotCount = 8 - filledSlotCount;

  return (
    <div className="space-y-4">
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
        <div className="flex justify-between items-center mt-1">
          <div className="text-[10px] text-muted-foreground">
            {filledSlotCount} 格已配置，{emptySlotCount} 格空
          </div>
          <button
            onClick={onRunOptimizer}
            disabled={slotOptimizing || priceLoading || prices.length === 0 || filledSlotCount === 0}
            className="text-xs px-3 py-1 rounded bg-amber-600 text-amber-50 hover:bg-amber-500 transition-colors cursor-pointer disabled:bg-amber-600/40 disabled:cursor-not-allowed"
          >
            {slotOptimizing ? '計算中...' : slotResult && !isStale ? '重新計算' : '計算最佳合成'}
          </button>
        </div>
        {isStale && (
          <div className="text-[10px] text-amber-400 bg-amber-400/10 rounded px-2 py-1 mt-1.5">
            ⚠ 技能格已變更，請重新計算
          </div>
        )}
      </div>

      <SlotRecipeList
        slotConfig={slotConfig}
        slotResult={slotResult}
        isStale={isStale}
      />
    </div>
  );
}
