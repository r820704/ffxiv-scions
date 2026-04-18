import { useState } from 'react';
import { EUREKA_ZONES } from '@/data/weather-data';
import { useGameClock } from '@/hooks/useGameClock';
import GameClock from '@/components/eureka-weather/GameClock';
import WeatherFilterBar from '@/components/eureka-weather/WeatherFilterBar';
import ZoneWeatherRow from '@/components/eureka-weather/ZoneWeatherRow';

export default function EurekaWeatherPage() {
  const { now } = useGameClock();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (w: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  };

  return (
    <div>
      <h1 className="font-title text-2xl font-bold text-center text-primary mb-4">
        優雷卡天氣
      </h1>
      <div className="flex flex-col gap-3">
        <GameClock />
        <WeatherFilterBar selected={selected} onToggle={toggle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EUREKA_ZONES.map((z) => (
            <ZoneWeatherRow key={z} zone={z} selectedWeathers={selected} now={now} />
          ))}
        </div>
      </div>
    </div>
  );
}
