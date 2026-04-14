import { useState, useCallback, useEffect, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { fetchLogogramPrices } from '@/services/universalis';
import type { LogogramPrice } from '@/types/eureka';
import type { Recipe } from '@/types/eureka';
import AlbumGrid from '@/components/eureka/AlbumGrid';
import CrystalOverview from '@/components/eureka/CrystalOverview';
import AlbumRecipeList from '@/components/eureka/AlbumRecipeList';
import SkillSlots from '@/components/eureka/SkillSlots';
import { useAlbumState } from '@/hooks/useAlbumState';
import { useSkillSlots } from '@/hooks/useSkillSlots';
import { synthesizeRecipe, computeSlotNeeds, computeCrystalNeeds, LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import { cn } from '@/lib/utils';

type EurekaMode = 'album' | 'synthesis';

export default function EurekaPage() {
  const [prices, setPrices] = useState<LogogramPrice[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const [mode, setMode] = useState<EurekaMode>('album');

  const { learnedSkills, toggleLearned, learnAll, resetAll, inventory, setItemCount } = useAlbumState();
  const { slots, setSlot } = useSkillSlots();
  const [albumCostEnabled, setAlbumCostEnabled] = useState(true);
  const [slotCostEnabled, setSlotCostEnabled] = useState(true);

  const slotNeeds = useMemo(
    () => computeSlotNeeds(slots),
    [slots]
  );

  const remainingCost = useMemo(() => {
    if (prices.length === 0) return null;
    const priceMap = new Map(prices.map((p) => [p.itemId, p.price]));
    const albumNeeds = albumCostEnabled ? computeCrystalNeeds(learnedSkills) : {};
    const sNeeds = slotCostEnabled ? slotNeeds : {};
    let total = 0;

    for (const logogramId of LOGOGRAM_FIXED_ORDER) {
      const need = (albumNeeds[logogramId] || 0) + (sNeeds[logogramId] || 0);
      const owned = inventory[logogramId] || 0;
      const remaining = Math.max(0, need - owned);
      if (remaining === 0) continue;
      const logogram = eurekaData.logograms.find((l) => l.id === logogramId);
      if (!logogram) continue;
      const price = priceMap.get(logogram.itemId);
      if (price == null) return null;
      total += remaining * price;
    }
    return total;
  }, [learnedSkills, inventory, prices, slotNeeds, albumCostEnabled, slotCostEnabled]);

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
          {/* Mode toggle */}
          <div className="flex gap-0.5 bg-secondary rounded-lg p-0.5 w-fit mb-4">
            <button
              onClick={() => setMode('album')}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer',
                mode === 'album'
                  ? 'bg-card text-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              圖鑑模式
            </button>
            <button
              onClick={() => setMode('synthesis')}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer',
                mode === 'synthesis'
                  ? 'bg-card text-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              合成模式
            </button>
          </div>

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
              {/* Mini grid + Skill slots row */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <AlbumGrid
                    learnedSkills={learnedSkills}
                    onToggle={toggleLearned}
                    mode={mode}
                    inventory={inventory}
                    onSynthesize={(recipe: Recipe) => {
                      const next = synthesizeRecipe(recipe, inventory);
                      Object.entries(next).forEach(([id, count]) => setItemCount(id, count));
                    }}
                    mini
                  />
                </div>
                <SkillSlots
                  slots={slots}
                  learnedSkills={learnedSkills}
                  onSetSlot={setSlot}
                />
              </div>
              {/* 還需花費 */}
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
                  {slots.flat().filter(Boolean).length > 0 && (
                    <> + {slots.flat().filter(Boolean).length} 個技能格待合成</>
                  )}
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
                slotNeeds={slotNeeds}
                albumCostEnabled={albumCostEnabled}
                slotCostEnabled={slotCostEnabled}
                onToggleAlbumCost={() => setAlbumCostEnabled((prev) => !prev)}
                onToggleSlotCost={() => setSlotCostEnabled((prev) => !prev)}
                hasSlots
              />
            </div>
          </div>

          {/* Recipe list with search/filters */}
          <AlbumRecipeList
            learnedSkills={learnedSkills}
            onToggle={toggleLearned}
            prices={prices}
            priceLoading={priceLoading}
            inventory={inventory}
            mode={mode}
            onSynthesize={(recipe: Recipe) => {
              const next = synthesizeRecipe(recipe, inventory);
              Object.entries(next).forEach(([id, count]) => setItemCount(id, count));
            }}
          />
        </div>
      </div>
    </div>
  );
}
