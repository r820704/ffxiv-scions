import { useCallback, useRef, useState } from 'react';
import { EUREKA_ZONES } from '@/data/weather-data';
import { useGameClock } from '@/hooks/useGameClock';
import GameClock from '@/components/eureka-weather/GameClock';
import WeatherFilterBar from '@/components/eureka-weather/WeatherFilterBar';
import ZoneWeatherRow from '@/components/eureka-weather/ZoneWeatherRow';

export default function EurekaWeatherPage() {
  const { now } = useGameClock();
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
  }, []);

  return (
    <div>
      <h1 className="font-title text-2xl font-bold text-center text-primary mb-4">
        優雷卡天氣
      </h1>
      <div className="flex flex-col gap-3">
        <GameClock />
        <WeatherFilterBar selected={selected} onToggle={toggle} onClearAll={clearAll} />
        <div className="flex flex-col gap-3">
          {EUREKA_ZONES.map((z, i) => (
            <ZoneWeatherRow
              key={z}
              zone={z}
              selectedWeathers={selected}
              now={now}
              scrollRef={registerRef(i)}
              onScroll={handleScroll(i)}
              onJumpToNow={jumpToNow}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
