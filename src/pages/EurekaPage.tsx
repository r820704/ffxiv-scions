import { useState, useCallback, useEffect, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { fetchLogogramPrices } from '@/services/universalis';
import type { LogogramPrice } from '@/types/eureka';

const PRICE_CACHE_KEY = 'eureka-prices-cache';
const PRICE_CACHE_TTL_MS = 10 * 60 * 1000;

type PriceCache = { prices: LogogramPrice[]; fetchedAt: number };

function readPriceCache(): PriceCache | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PRICE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PriceCache;
    if (!parsed || !Array.isArray(parsed.prices) || typeof parsed.fetchedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePriceCache(prices: LogogramPrice[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({ prices, fetchedAt: Date.now() } satisfies PriceCache),
    );
  } catch {
    /* quota exceeded — best-effort */
  }
}
import { useAlbumState } from '@/hooks/useAlbumState';
import { useSlotState } from '@/hooks/useSlotState';
import { useCalcMode } from '@/hooks/useCalcMode';
import { useRecentSkills } from '@/hooks/useRecentSkills';
import { LOGOGRAM_FIXED_ORDER } from '@/utils/album-helpers';
import { optimizeRecipes } from '@/utils/recipe-optimizer';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import { optimizeSlots } from '@/utils/slot-optimizer';
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import { deriveMcCosts, type McDerivedCosts } from '@/utils/mc-analysis';
import CalcModeToggle from '@/components/eureka/CalcModeToggle';
import AlbumStateBar from '@/components/eureka/AlbumStateBar';
import InputPanel from '@/components/eureka/InputPanel';
import CrystalOverview from '@/components/eureka/CrystalOverview';
import AlbumPlanSection from '@/components/eureka/AlbumPlanSection';
import SlotPlanSection from '@/components/eureka/SlotPlanSection';
import SkillRecipeList from '@/components/eureka/SkillRecipeList';
import HelpModal from '@/components/eureka/HelpModal';
import PageHead from '@/components/PageHead';

export default function EurekaPage() {
  const { calcMode, setCalcMode } = useCalcMode();

  const [prices, setPrices] = useState<LogogramPrice[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const { learnedSkills, toggleLearned, learnAll, resetAll, inventory, setItemCount } = useAlbumState();
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const {
    slotConfig, selectedSlot, selectSlot,
    addSkillToSelected, clearSlot, resetAllSlots, usedSkillIds,
  } = useSlotState();
  const { recentIds, pushRecent } = useRecentSkills();
  const [slotResult, setSlotResult] = useState<SlotOptimizationResult | null>(null);
  const [slotOptimizing, setSlotOptimizing] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const handlePickForSlot = useCallback((skillId: string) => {
    pushRecent(skillId);
    addSkillToSelected(skillId);
  }, [addSkillToSelected, pushRecent]);

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

  const albumMcCosts: McDerivedCosts | null = useMemo(() => {
    if (!optimizationResult || prices.length === 0) return null;
    return deriveMcCosts({
      mcOpensPerIter: optimizationResult.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory,
      listingsByLogogramId: listingsMap,
    });
  }, [optimizationResult, prices, inventory, listingsMap]);

  const slotMcCosts: McDerivedCosts | null = useMemo(() => {
    if (!slotResult || prices.length === 0) return null;
    return deriveMcCosts({
      mcOpensPerIter: slotResult.mcOpensPerIter,
      logogramOrder: LOGOGRAM_FIXED_ORDER,
      inventory,
      listingsByLogogramId: listingsMap,
    });
  }, [slotResult, prices, inventory, listingsMap]);

  const crystalOptResult: OptimizationResult | null = useMemo(() => {
    if (calcMode === 'album') return optimizationResult;
    if (!slotResult) return null;
    return {
      selectedRecipes: {},
      mnemeNeeds: {},
      mcOpensPerIter: slotResult.mcOpensPerIter,
    };
  }, [calcMode, optimizationResult, slotResult]);

  const crystalMcCosts = calcMode === 'album' ? albumMcCosts : slotMcCosts;

  const loadPrices = useCallback(async (options: { force?: boolean } = {}) => {
    if (!options.force) {
      const cache = readPriceCache();
      if (cache && Date.now() - cache.fetchedAt < PRICE_CACHE_TTL_MS) {
        setPrices(cache.prices);
        setLastFetched(new Date(cache.fetchedAt));
        return;
      }
    }
    setPriceLoading(true);
    setPriceError(false);
    try {
      const itemIds = eurekaData.logograms.map((l) => l.itemId);
      const result = await fetchLogogramPrices(itemIds);
      setPrices(result);
      setLastFetched(new Date());
      writePriceCache(result);
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
        <PageHead
          title="文理技能"
          description="優雷卡文理技能查詢、材料反查與市場價格"
          actions={
            <>
              {lastFetched && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  更新於 {lastFetched.toLocaleTimeString('zh-TW')}
                </span>
              )}
              <button
                onClick={() => loadPrices({ force: true })}
                disabled={priceLoading}
                className="px-3 py-1.5 text-xs rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
              >
                {priceLoading ? '查詢中...' : '重新查詢價格'}
              </button>
              <button
                type="button"
                aria-label="說明"
                onClick={() => setHelpOpen((v) => !v)}
                className="w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
              >
                ?
              </button>
            </>
          }
        />

        <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

        {priceError && (
          <div className="text-xs text-destructive mb-3">價格查詢失敗，請稍後重試</div>
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <CalcModeToggle calcMode={calcMode} onChange={setCalcMode} />
          <AlbumStateBar
            learnedCount={learnedSkills.size}
            total={eurekaData.logosActions.length}
            disabled={calcMode === 'slots'}
            onLearnAll={learnAll}
            onReset={resetAll}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
          <div className="w-full md:flex-1 md:min-w-0 space-y-3">
            <InputPanel
              calcMode={calcMode}
              learnedSkills={learnedSkills}
              usedSkillIds={usedSkillIds}
              slotConfig={slotConfig}
              selectedSlot={selectedSlot}
              onToggleLearn={toggleLearned}
              onPickForSlot={handlePickForSlot}
              onRecentPick={addSkillToSelected}
              onSelectSlot={selectSlot}
              onClearSlot={clearSlot}
              recentIds={recentIds}
            />
            {calcMode === 'album' ? (
              <AlbumPlanSection
                prices={prices}
                priceLoading={priceLoading}
                optimizationResult={optimizationResult}
                optimizing={optimizing}
                mcCosts={albumMcCosts}
                onRunOptimizer={runOptimizer}
              />
            ) : (
              <SlotPlanSection
                slotConfig={slotConfig}
                prices={prices}
                priceLoading={priceLoading}
                slotResult={slotResult}
                slotOptimizing={slotOptimizing}
                slotMcCosts={slotMcCosts}
                isStale={isStale}
                onRunOptimizer={runSlotOptimizer}
                onResetSlots={resetAllSlots}
              />
            )}
          </div>
          <div className={`w-full md:flex-1 md:min-w-0 ${calcMode === 'slots' && isStale ? 'opacity-50' : ''}`}>
            <CrystalOverview
              inventory={inventory}
              onSetCount={setItemCount}
              prices={prices}
              priceLoading={priceLoading}
              optimizationResult={crystalOptResult}
              mcCosts={crystalMcCosts}
            />
          </div>
        </div>

        <SkillRecipeList
          mode={calcMode}
          learnedSkills={learnedSkills}
          onToggle={toggleLearned}
          prices={prices}
          priceLoading={priceLoading}
          optimizationResult={optimizationResult}
          slotConfig={slotConfig}
          slotResult={slotResult}
        />
      </div>
    </div>
  );
}
