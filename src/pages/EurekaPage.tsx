import { useState, useCallback, useEffect, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { fetchLogogramPrices } from '@/services/universalis';
import type { LogogramPrice } from '@/types/eureka';
import MnemeSelector from '@/components/eureka/MnemeSelector';
import AlbumGrid from '@/components/eureka/AlbumGrid';
import CrystalOverview from '@/components/eureka/CrystalOverview';
import AlbumRecipeList from '@/components/eureka/AlbumRecipeList';
import { useAlbumState } from '@/hooks/useAlbumState';
import { computeRemainingCost } from '@/utils/album-helpers';
import { cn } from '@/lib/utils';

type EurekaTab = 'album' | 'mnemes';

export default function EurekaPage() {
  const [tab, setTab] = useState<EurekaTab>('album');
  const [prices, setPrices] = useState<LogogramPrice[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [selectedMnemes, setSelectedMnemes] = useState<Set<string>>(new Set());

  const { learnedSkills, toggleLearned, learnAll, resetAll, inventory, setItemCount } = useAlbumState();

  const remainingCost = useMemo(
    () => computeRemainingCost(learnedSkills, inventory, prices),
    [learnedSkills, inventory, prices]
  );

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

  const handleToggleMneme = useCallback((mnemeId: string) => {
    setSelectedMnemes((prev) => {
      const next = new Set(prev);
      if (next.has(mnemeId)) {
        next.delete(mnemeId);
      } else {
        next.add(mnemeId);
      }
      return next;
    });
  }, []);

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

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab('album')}
          className={cn(
            'px-4 py-2 text-sm rounded-md transition-colors cursor-pointer',
            tab === 'album'
              ? 'bg-secondary text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          圖鑑
        </button>
        <button
          onClick={() => setTab('mnemes')}
          className={cn(
            'px-4 py-2 text-sm rounded-md transition-colors cursor-pointer',
            tab === 'mnemes'
              ? 'bg-secondary text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          材料反查
        </button>
      </div>

      {tab === 'album' ? (
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
            <div className="w-full md:w-[45%] flex-shrink-0 space-y-3">
              <AlbumGrid learnedSkills={learnedSkills} onToggle={toggleLearned} />
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
                <div className="text-[10px] text-muted-foreground">
                  {56 - learnedSkills.size} 個技能未習得
                </div>
              </div>
            </div>
            <div className="w-full md:flex-1">
              <CrystalOverview
                learnedSkills={learnedSkills}
                inventory={inventory}
                onSetCount={setItemCount}
                prices={prices}
                priceLoading={priceLoading}
              />
            </div>
          </div>

          {/* Recipe list with search/filters */}
          <AlbumRecipeList
            learnedSkills={learnedSkills}
            onToggle={toggleLearned}
            prices={prices}
            priceLoading={priceLoading}
          />
        </div>
      ) : (
        <MnemeSelector
          selectedMnemes={selectedMnemes}
          onToggleMneme={handleToggleMneme}
          prices={prices}
          priceLoading={priceLoading}
        />
      )}
      </div>
    </div>
  );
}
