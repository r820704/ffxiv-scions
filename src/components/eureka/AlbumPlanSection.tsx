import type { LogogramPrice } from '@/types/eureka';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import type { McDerivedCosts } from '@/utils/mc-analysis';

interface AlbumPlanSectionProps {
  prices: LogogramPrice[];
  priceLoading: boolean;
  optimizationResult: OptimizationResult | null;
  optimizing: boolean;
  mcCosts: McDerivedCosts | null;
  onRunOptimizer: () => void;
}

export default function AlbumPlanSection({
  prices,
  priceLoading,
  optimizationResult,
  optimizing,
  mcCosts,
  onRunOptimizer,
}: AlbumPlanSectionProps) {
  return (
    <div className="bg-secondary rounded-lg p-3">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-xs text-muted-foreground">整體花費</span>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-base font-semibold text-primary">
            預估 {optimizing ? '計算中...' : mcCosts ? `${Math.round(mcCosts.totalCost50).toLocaleString()} Gil` : '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            保底 {optimizing ? '計算中...' : mcCosts ? `${Math.round(mcCosts.totalCost95).toLocaleString()} Gil` : '—'}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-[10px] text-muted-foreground/80">
          預估：50% 分位（中位數）；保底：95% 分位
        </div>
        <button
          onClick={onRunOptimizer}
          disabled={optimizing || priceLoading || prices.length === 0}
          className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:bg-primary/40 disabled:cursor-not-allowed"
        >
          {optimizing ? '計算中...' : optimizationResult ? '重新計算' : '計算最佳合成'}
        </button>
      </div>
    </div>
  );
}
