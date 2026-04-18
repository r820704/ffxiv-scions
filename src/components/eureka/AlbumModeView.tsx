import type { LogogramPrice } from '@/types/eureka';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import type { McDerivedCosts } from '@/utils/mc-analysis';
import AlbumGrid from './AlbumGrid';
import CrystalOverview from './CrystalOverview';
import AlbumRecipeList from './AlbumRecipeList';

interface AlbumModeViewProps {
  learnedSkills: Set<string>;
  toggleLearned: (skillId: string) => void;
  learnAll: () => void;
  resetAll: () => void;
  inventory: Record<string, number>;
  setItemCount: (logogramId: string, count: number) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
  optimizationResult: OptimizationResult | null;
  optimizing: boolean;
  mcCosts: McDerivedCosts | null;
  onRunOptimizer: () => void;
}

export default function AlbumModeView({
  learnedSkills,
  toggleLearned,
  learnAll,
  resetAll,
  inventory,
  setItemCount,
  prices,
  priceLoading,
  optimizationResult,
  optimizing,
  mcCosts,
  onRunOptimizer,
}: AlbumModeViewProps) {
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-secondary rounded h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-dark to-primary rounded transition-all"
            style={{ width: `${(learnedSkills.size / 56) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {learnedSkills.size} / 56 已習得
        </span>
        <button
          onClick={learnAll}
          className="text-xs px-2.5 py-1 rounded bg-primary-dark/80 text-primary-foreground hover:bg-primary-dark transition-colors cursor-pointer whitespace-nowrap font-medium"
        >
          全部解鎖
        </button>
        <button
          onClick={resetAll}
          className="text-xs px-2.5 py-1 rounded bg-destructive/70 text-destructive-foreground hover:bg-destructive transition-colors cursor-pointer whitespace-nowrap font-medium"
        >
          重置
        </button>
      </div>

      {/* Grid + Crystal: side by side on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:flex-1 space-y-3">
          <AlbumGrid
            learnedSkills={learnedSkills}
            onToggle={toggleLearned}
          />
          {/* 整體花費 */}
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
            <div className="text-[10px] text-muted-foreground/80 mt-0.5">
              預估：50% 分位（中位數）；保底：95% 分位
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[10px] text-muted-foreground">
                {56 - learnedSkills.size} 個技能未習得
              </div>
              <button
                onClick={onRunOptimizer}
                disabled={optimizing || priceLoading || prices.length === 0}
                className="text-xs px-3 py-1 rounded bg-amber-600 text-amber-50 hover:bg-amber-500 transition-colors cursor-pointer disabled:bg-amber-600/40 disabled:cursor-not-allowed"
              >
                {optimizing ? '計算中...' : optimizationResult ? '重新計算' : '計算最佳合成'}
              </button>
            </div>
          </div>
        </div>
        <div className="w-full md:flex-1">
          <CrystalOverview
            inventory={inventory}
            onSetCount={setItemCount}
            prices={prices}
            priceLoading={priceLoading}
            optimizationResult={optimizationResult}
            mcCosts={mcCosts}
          />
        </div>
      </div>

      {/* Recipe list with search/filters */}
      <AlbumRecipeList
        learnedSkills={learnedSkills}
        onToggle={toggleLearned}
        prices={prices}
        priceLoading={priceLoading}
        optimizationResult={optimizationResult}
      />
    </div>
  );
}
