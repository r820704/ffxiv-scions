import { useEffect, useMemo, useRef } from 'react';
import { generateForecasts, findWeatherMatches } from '@/utils/weather-engine';
import { zoneNamesTw, weatherNamesTw, type EurekaZone } from '@/data/weather-data';
import { WEATHER_PERIOD_MS, toEorzeaTime } from '@/utils/eorzea-time';
import { isDayTime } from '@/utils/game-day-night';
import { getNmsForZoneAndWeather } from '@/data/eureka-nm-data';
import WeatherIcon from '@/components/WeatherIcon';

interface ZoneWeatherRowProps {
  zone: EurekaZone;
  selectedWeathers: Set<string>;
  now: number;
  scrollRef?: (el: HTMLDivElement | null) => void;
  onScroll?: (scrollLeft: number) => void;
  onJumpToNow?: () => void;
}

const FORECAST_COUNT = 24;

function formatRelMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

export default function ZoneWeatherRow({
  zone,
  selectedWeathers,
  now,
  scrollRef,
  onScroll,
  onJumpToNow,
}: ZoneWeatherRowProps) {
  const localRef = useRef<HTMLDivElement | null>(null);

  const forecasts = useMemo(
    () => generateForecasts(zone, FORECAST_COUNT, now),
    [zone, now],
  );

  const nextMatch = useMemo(() => {
    if (selectedWeathers.size === 0) return null;
    const [match] = findWeatherMatches(zone, selectedWeathers, 1, now);
    return match ?? null;
  }, [zone, selectedWeathers, now]);

  const firstSelectedTw = selectedWeathers.size > 0
    ? weatherNamesTw[[...selectedWeathers][0]!] ?? [...selectedWeathers][0]!
    : null;

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const setRefs = (el: HTMLDivElement | null) => {
    localRef.current = el;
    scrollRef?.(el);
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-semibold text-foreground">{zoneNamesTw[zone]}</span>
        <div className="flex items-center gap-2">
          {nextMatch && firstSelectedTw && (
            <span className="text-xs text-amber-300">
              下次{firstSelectedTw}：{formatRelMs(nextMatch.startTime - now)}
            </span>
          )}
          {onJumpToNow && (
            <button
              type="button"
              onClick={onJumpToNow}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border/50 hover:border-primary transition-colors text-muted-foreground cursor-pointer"
            >
              ↺ 回到現在
            </button>
          )}
        </div>
      </div>
      <div
        ref={setRefs}
        onScroll={(e) => onScroll?.(e.currentTarget.scrollLeft)}
        className="flex gap-1 mt-2 overflow-x-auto scroll-smooth"
      >
        {forecasts.map((f, idx) => {
          const isCurrent = idx === 0;
          const matched = selectedWeathers.has(f.weather);
          const estMid = toEorzeaTime(f.startTime + WEATHER_PERIOD_MS / 2);
          const isDay = isDayTime(estMid);
          const nms = getNmsForZoneAndWeather(zone, f.weather);
          return (
            <div
              key={f.startTime}
              data-period-cell
              data-matched={matched ? 'true' : 'false'}
              title={nms.length > 0 ? `可能出現：${nms.map((n) => n.nameTw).join('、')}` : undefined}
              className={`relative flex-shrink-0 w-16 rounded p-1 text-center text-[10px] border ${
                matched ? 'border-amber-500 bg-amber-500/10' : 'border-border/50'
              } ${isDay ? 'bg-amber-50/[.03]' : 'bg-indigo-900/[.08]'} ${
                isCurrent ? 'ring-1 ring-primary' : ''
              }`}
            >
              <div className="flex justify-center">
                <WeatherIcon weatherEn={f.weather} weatherTw={f.weatherTw} size={20} />
              </div>
              <div className="text-muted-foreground mt-0.5">{f.weatherTw}</div>
              <div className="text-muted-foreground/70">
                {isCurrent ? '現在' : `+${formatRelMs(f.startTime - now)}`}
              </div>
              {nms.length > 0 && (
                <div className="absolute top-0.5 right-0.5 px-1 rounded bg-red-600 text-white text-[8px] font-bold leading-[10px] shadow-sm animate-pulse">
                  NM
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
