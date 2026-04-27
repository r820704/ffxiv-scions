import { useCallback, useRef, useState } from 'react';
import { EUREKA_ZONES } from '@/data/weather-data';
import { useGameClock } from '@/hooks/useGameClock';
import GameClock from '@/components/eureka-weather/GameClock';
import WeatherFilterBar from '@/components/eureka-weather/WeatherFilterBar';
import ZoneWeatherRow from '@/components/eureka-weather/ZoneWeatherRow';
import HelpModal from '@/components/eureka-weather/HelpModal';
import OnboardingHint from '@/components/eureka-weather/OnboardingHint';
import LoadMoreButton from '@/components/eureka-weather/LoadMoreButton';

const SCROLL_REVEAL_THRESHOLD = 80;

export default function EurekaWeatherPage() {
  const { now } = useGameClock();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scrolledAway, setScrolledAway] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [forecastCount, setForecastCount] = useState(48);
  const scrollRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isSyncingRef = useRef(false);

  const toggle = (w: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  };

  const clearAll = useCallback(() => {
    setSelected(new Set());
  }, []);

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

  return (
    <div>
      <div className="relative flex items-center justify-center mb-4">
        <h1 className="font-title text-2xl font-bold text-primary">優雷卡天氣</h1>
        <button
          type="button"
          aria-label="說明"
          onClick={() => setHelpOpen(true)}
          className="absolute right-0 w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        >
          ?
        </button>
      </div>
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <div className="flex flex-col gap-3">
        <GameClock />
        <OnboardingHint />
        <WeatherFilterBar
          selected={selected}
          onToggle={toggle}
          onClearAll={clearAll}
          onJumpToNow={scrolledAway ? jumpToNow : undefined}
        />
        <div className="flex flex-col gap-3">
          {EUREKA_ZONES.map((z, i) => (
            <ZoneWeatherRow
              key={z}
              zone={z}
              selectedWeathers={selected}
              now={now}
              forecastCount={forecastCount}
              scrollRef={registerRef(i)}
              onScroll={handleScroll(i)}
            />
          ))}
          <LoadMoreButton
            count={forecastCount}
            step={24}
            max={96}
            onLoadMore={setForecastCount}
          />
        </div>
      </div>
    </div>
  );
}
