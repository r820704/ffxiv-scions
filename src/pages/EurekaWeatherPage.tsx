import { useCallback, useEffect, useRef, useState } from 'react';
import { EUREKA_ZONES } from '@/data/weather-data';
import { useUrlSelectedWeathers } from '@/hooks/useUrlSelectedWeathers';
import { useGameClock } from '@/hooks/useGameClock';
import { useNmDetailHash } from '@/hooks/useNmDetailHash';
import WeatherFilterBar from '@/components/eureka-weather/WeatherFilterBar';
import ZoneWeatherRow from '@/components/eureka-weather/ZoneWeatherRow';
import HelpModal from '@/components/eureka-weather/HelpModal';
import NmSearchPanel from '@/components/eureka-weather/NmSearchPanel';
import NmDetailModal from '@/components/eureka-weather/NmDetailModal';
import NmListModal from '@/components/eureka-weather/NmListModal';
import { NmTooltipProvider } from '@/components/eureka-weather/NmTooltip';
import OnboardingHint from '@/components/eureka-weather/OnboardingHint';
import WeatherSummaryBar from '@/components/eureka-weather/WeatherSummaryBar';
import { RemindersProvider } from '@/hooks/useReminders';
import RemindersHeaderButton from '@/components/eureka-weather/RemindersHeaderButton';
import type { EurekaZone } from '@/data/weather-data';

const SCROLL_REVEAL_THRESHOLD = 80;

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

function formatClientTime(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function EurekaWeatherPage() {
  const { now, eorzeaClock, isDay, msUntilTransition } = useGameClock();
  const [selected, setSelected] = useUrlSelectedWeathers();
  const [scrolledAway, setScrolledAway] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [forecastCount, setForecastCount] = useState(48);
  const FORECAST_MAX = 96;
  const FORECAST_STEP = 24;
  const remainingStep = Math.min(FORECAST_STEP, FORECAST_MAX - forecastCount);
  const loadMore = useCallback(() => {
    setForecastCount((c) => Math.min(c + FORECAST_STEP, FORECAST_MAX));
  }, []);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isSyncingRef = useRef(false);

  const [detailNmId, setDetailNmId] = useNmDetailHash();
  const openDetail = useCallback((id: string) => setDetailNmId(id), [setDetailNmId]);
  const closeDetail = useCallback(() => setDetailNmId(null), [setDetailNmId]);

  const [listZone, setListZone] = useState<EurekaZone | null>(null);
  const openList = useCallback((z: EurekaZone) => setListZone(z), []);
  const closeList = useCallback(() => setListZone(null), []);
  const openDetailFromList = useCallback((id: string) => {
    setListZone(null);
    setDetailNmId(id);
  }, [setDetailNmId]);

  const toggle = (w: string) => {
    const next = new Set(selected);
    if (next.has(w)) next.delete(w);
    else next.add(w);
    setSelected(next);
  };

  const clearAll = useCallback(() => {
    setSelected(new Set());
  }, [setSelected]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast('已複製連結');
    } catch {
      setToast('複製失敗');
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const registerRef = (index: number) => (el: HTMLDivElement | null) => {
    scrollRefs.current[index] = el;
  };

  const handleScroll = useCallback((index: number) => (scrollLeft: number) => {
    setScrolledAway(scrollLeft > SCROLL_REVEAL_THRESHOLD);
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    scrollRefs.current.forEach((r, i) => {
      if (r && i !== index && r.scrollLeft !== scrollLeft) {
        r.scrollLeft = scrollLeft;
      }
    });
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  const jumpToNow = useCallback(() => {
    scrollRefs.current.forEach((r) => {
      if (r) r.scrollTo({ left: 0, behavior: 'smooth' });
    });
    setScrolledAway(false);
  }, []);

  // Cell layout: w-16 (64px) + gap-1 (4px) = 68px stride. Scroll target leaves ~68px
  // padding on the left so the target cell is visible (not flush against the edge).
  const scrollToCell = useCallback((_zone: EurekaZone, cellIndex: number) => {
    const cellStride = 68;
    const left = Math.max(0, cellIndex * cellStride - cellStride);
    scrollRefs.current.forEach((r) => {
      if (r) r.scrollTo({ left, behavior: 'smooth' });
    });
  }, []);

  return (
    <RemindersProvider>
    <NmTooltipProvider>
      <div className="flex items-center justify-center mb-4">
        <h1 className="font-title text-2xl font-bold text-primary">優雷卡天氣</h1>
      </div>
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <NmSearchPanel
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        now={now}
        forecastCount={forecastCount}
        onScrollToCell={scrollToCell}
        onOpenDetail={openDetail}
      />
      <NmDetailModal nmId={detailNmId} onClose={closeDetail} />
      <NmListModal zone={listZone} onClose={closeList} onOpenDetail={openDetailFromList} />
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-md px-4 py-2 text-sm shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="bg-secondary rounded-lg px-3 py-2 flex items-center gap-2 flex-wrap text-sm">
          <span className="text-xs text-muted-foreground">現實時間</span>
          <span className="font-mono font-semibold text-foreground">{formatClientTime(now)}</span>
          <span className="text-muted-foreground mx-1">·</span>
          <span className="text-xs text-muted-foreground">艾奧傑亞</span>
          <span className="font-mono font-semibold text-foreground">{eorzeaClock}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDay ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
            {isDay ? '☀ 白天' : '🌙 夜晚'}
          </span>
          <span className="text-xs text-muted-foreground">距{isDay ? '夜晚' : '白天'} {formatCountdown(msUntilTransition)}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <RemindersHeaderButton />
            <button
              type="button"
              aria-label="搜尋 NM"
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
            >
              🔍
            </button>
            <button
              type="button"
              aria-label="說明"
              onClick={() => setHelpOpen(true)}
              className="w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              ?
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-border/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <span>📋</span>
              <span>複製連結</span>
            </button>
          </div>
        </div>
        <OnboardingHint />
        <WeatherFilterBar
          selected={selected}
          onToggle={toggle}
          onClearAll={clearAll}
          onJumpToNow={scrolledAway ? jumpToNow : undefined}
        />
        <WeatherSummaryBar
          selected={selected}
          now={now}
          forecastCount={forecastCount}
          onScrollToCell={scrollToCell}
          onToast={setToast}
        />
        <div className="flex flex-col gap-3">
          {EUREKA_ZONES.map((z, i) => (
            <ZoneWeatherRow
              key={z}
              zone={z}
              selectedWeathers={selected}
              now={now}
              forecastCount={forecastCount}
              loadMoreStep={remainingStep > 0 ? remainingStep : undefined}
              onLoadMore={remainingStep > 0 ? loadMore : undefined}
              scrollRef={registerRef(i)}
              onScroll={handleScroll(i)}
              onOpenDetail={openDetail}
              onOpenList={openList}
            />
          ))}
        </div>
      </div>
    </NmTooltipProvider>
    </RemindersProvider>
  );
}
