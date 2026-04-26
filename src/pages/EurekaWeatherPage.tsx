import { useCallback, useRef, useState } from 'react';
import { EUREKA_ZONES } from '@/data/weather-data';
import { useGameClock } from '@/hooks/useGameClock';
import GameClock from '@/components/eureka-weather/GameClock';
import WeatherFilterBar from '@/components/eureka-weather/WeatherFilterBar';
import ZoneWeatherRow from '@/components/eureka-weather/ZoneWeatherRow';

const SCROLL_REVEAL_THRESHOLD = 80;

export default function EurekaWeatherPage() {
  const { now } = useGameClock();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scrolledAway, setScrolledAway] = useState(false);
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
      <h1 className="font-title text-2xl font-bold text-center text-primary mb-4">
        優雷卡天氣
      </h1>
      <div className="flex flex-col gap-3">
        <GameClock />
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
              scrollRef={registerRef(i)}
              onScroll={handleScroll(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
