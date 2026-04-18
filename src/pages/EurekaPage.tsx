import { useState, useCallback, useEffect, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { fetchLogogramPrices } from '@/services/universalis';
import type { LogogramPrice } from '@/types/eureka';
import { useAlbumState } from '@/hooks/useAlbumState';
import { LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import { optimizeRecipes } from '@/utils/recipe-optimizer';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import { deriveMcCosts, type McDerivedCosts } from '@/utils/mc-analysis';
import AlbumModeView from '@/components/eureka/AlbumModeView';
import { useSlotState } from '@/hooks/useSlotState';
import { optimizeSlots } from '@/utils/slot-optimizer';
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import SlotModeView from '@/components/eureka/SlotModeView';
import { cn } from '@/lib/utils';

type TabMode = 'album' | 'slots';

export default function EurekaPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('album');

  // Shared state
  const [prices, setPrices] = useState<LogogramPrice[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { learnedSkills, toggleLearned, learnAll, resetAll, inventory, setItemCount } = useAlbumState();

  // Album mode state
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Slot mode state
  const {
    slotConfig, selectedSlot, selectSlot,
    addSkillToSelected, clearSlot, usedSkillIds,
  } = useSlotState();
  const [slotResult, setSlotResult] = useState<SlotOptimizationResult | null>(null);
  const [slotOptimizing, setSlotOptimizing] = useState(false);
  const [isStale, setIsStale] = useState(false);

  // Mark stale when slot config changes after a calculation
  useEffect(() => {
    if (slotResult) setIsStale(true);
  }, [slotConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  const listingsMap = useMemo(() => {
    const m = new Map<string, LogogramPrice['listings']>();
    for (const p of prices) {
      const logogram = eurekaData.logograms.find((l) => l.itemId === p.itemId);
      if (logogram) m.set(logogram.id, p.listings);
    }
    return m;
  }, [prices]);

  const runOptimizer = useCallback(() => {
    if (prices.length === 0) return;
    setOptimizing(true);
    setTimeout(() => {
      const result = optimizeRecipes(learnedSkills, prices);
      setOptimizationResult(result);
      setOptimizing(false);
    }, 50);
  }, [learnedSkills, prices]);

  const mcCosts: McDerivedCosts | null = useMemo(() => {
    if (!optimizationResult || prices.length === 0) return null;
    return deriveMcCosts({
      mcOpensPerIter: optimizationResult.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory,
      listingsByLogogramId: listingsMap,
    });
  }, [optimizationResult, prices, inventory, listingsMap]);

  const runSlotOptimizer = useCallback(() => {
    if (prices.length === 0) return;
    setSlotOptimizing(true);
    setTimeout(() => {
      const result = optimizeSlots(slotConfig, prices);
      setSlotResult(result);
      setSlotOptimizing(false);
      setIsStale(false);
    }, 50);
  }, [slotConfig, prices]);

  const slotMcCosts: McDerivedCosts | null = useMemo(() => {
    if (!slotResult || prices.length === 0) return null;
    return deriveMcCosts({
      mcOpensPerIter: slotResult.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory,
      listingsByLogogramId: listingsMap,
    });
  }, [slotResult, prices, inventory, listingsMap]);

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

  useEffect(() => { loadPrices(); }, [loadPrices]);

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 10% 20%,rgba(74,48,120,.06),transparent),radial-gradient(ellipse 50% 35% at 85% 70%,rgba(40,80,140,.05),transparent),radial-gradient(ellipse 45% 30% at 50% 90%,rgba(120,50,50,.04),transparent)' }} />
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
          <div className="text-xs text-destructive mb-3">價格查詢失敗，請稍後重試</div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b-2 border-border mb-4">
          {(['album', 'slots'] as const).map((tab) => (
            <button
              key={tab}
              className={cn(
                'px-4 py-1.5 text-sm transition-colors cursor-pointer -mb-[2px]',
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary-dark font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'album' ? '圖鑑模式' : '技能格模式'}
            </button>
          ))}
        </div>

        {activeTab === 'album' && (
          <AlbumModeView
            learnedSkills={learnedSkills}
            toggleLearned={toggleLearned}
            learnAll={learnAll}
            resetAll={resetAll}
            inventory={inventory}
            setItemCount={setItemCount}
            prices={prices}
            priceLoading={priceLoading}
            optimizationResult={optimizationResult}
            optimizing={optimizing}
            mcCosts={mcCosts}
            onRunOptimizer={runOptimizer}
          />
        )}

        {activeTab === 'slots' && (
          <SlotModeView
            slotConfig={slotConfig}
            selectedSlot={selectedSlot}
            usedSkillIds={usedSkillIds}
            onSelectSlot={selectSlot}
            onAddSkill={addSkillToSelected}
            onClearSlot={clearSlot}
            inventory={inventory}
            setItemCount={setItemCount}
            prices={prices}
            priceLoading={priceLoading}
            slotResult={slotResult}
            slotOptimizing={slotOptimizing}
            slotMcCosts={slotMcCosts}
            isStale={isStale}
            onRunOptimizer={runSlotOptimizer}
          />
        )}
      </div>
    </div>
  );
}
