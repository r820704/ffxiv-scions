import { useState, useCallback, useEffect, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { fetchLogogramPrices } from '@/services/universalis';
import type { LogogramPrice } from '@/types/eureka';
import AlbumGrid from '@/components/eureka/AlbumGrid';
import CrystalOverview from '@/components/eureka/CrystalOverview';
import AlbumRecipeList from '@/components/eureka/AlbumRecipeList';
import { useAlbumState } from '@/hooks/useAlbumState';
import { LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import { optimizeRecipes } from '@/utils/recipe-optimizer';
import type { OptimizationResult } from '@/utils/recipe-optimizer';

export default function EurekaPage() {
  const [prices, setPrices] = useState<LogogramPrice[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const { learnedSkills, toggleLearned, learnAll, resetAll, inventory, setItemCount } = useAlbumState();

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const runOptimizer = useCallback(() => {
    if (prices.length === 0) return;
    setOptimizing(true);
    // Use setTimeout to let the UI update with loading state before blocking
    setTimeout(() => {
      const result = optimizeRecipes(learnedSkills, prices);
      setOptimizationResult(result);
      setOptimizing(false);
    }, 50);
  }, [learnedSkills, prices]);

  const remainingCost95 = useMemo(() => {
    if (!optimizationResult || prices.length === 0) return null;
    const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
    let total = 0;
    for (const logogramId of LOGOGRAM_FIXED_ORDER) {
      const opens = optimizationResult.opensNeeded[logogramId] || 0;
      const owned = inventory[logogramId] || 0;
      const remaining = Math.max(0, opens - owned);
      if (remaining === 0) continue;
      const logogram = eurekaData.logograms.find((l) => l.id === logogramId);
      if (!logogram) continue;
      const price = priceMap.get(logogram.itemId);
      if (price == null) return null;
      total += remaining * price;
    }
    return total;
  }, [optimizationResult, inventory, prices]);

  const loadPrices = useCallback(async () => {
    setPriceLoading(true);
    setPriceError(false);
    try {
      const itemIds = eurekaData.logograms.map((l) => l.itemId);
      const result = await fetchLogogramPrices(itemIds);
      setPrices(result);
      setLastFetched(new Date());
    } catch {
      setPriceError(true);
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  return (
    <div className="relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 60% 40% at 10% 20%, rgba(74,48,120,0.06), transparent)',
            'radial-gradient(ellipse 50% 35% at 85% 70%, rgba(40,80,140,0.05), transparent)',
            'radial-gradient(ellipse 45% 30% at 50% 90%, rgba(120,50,50,0.04), transparent)',
          ].join(', '),
        }}
      />
      <div className="relative">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="font-title text-2xl font-bold text-primary">Eureka 文理技能</h1>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              更新於 {lastFetched.toLocaleTimeString('zh-TW')}
            </span>
          )}
          <button
            onClick={loadPrices}
            disabled={priceLoading}
            className="px-3 py-1.5 text-xs rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
          >
            {priceLoading ? '查詢中...' : '重新查詢價格'}
          </button>
        </div>
      </div>

      {priceError && (
        <div className="text-xs text-destructive mb-3">
          價格查詢失敗，請稍後重試
        </div>
      )}

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
              {/* 95%成功機率約需花費 */}
              <div className="bg-secondary rounded-lg p-3">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">95%成功機率約需花費</span>
                  <span className="text-lg font-bold text-amber-400">
                    {optimizing
                      ? '計算中...'
                      : remainingCost95 != null
                        ? `${remainingCost95.toLocaleString()} Gil`
                        : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-muted-foreground">
                    {56 - learnedSkills.size} 個技能未習得
                  </div>
                  <button
                    onClick={runOptimizer}
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
      </div>
    </div>
  );
}
