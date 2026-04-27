import { useEffect, useMemo, useRef } from 'react';
import {
  generateForecasts,
  findWeatherMatches,
  findLastEndedWeather,
  currentRunRemaining,
  DEFAULT_LOOKBACK_PERIODS,
} from '@/utils/weather-engine';
import { zoneNamesTw, weatherNamesTw, type EurekaZone } from '@/data/weather-data';
import { getZoneLevelLabel } from '@/data/eureka-zone-meta';
import { WEATHER_PERIOD_MS } from '@/utils/eorzea-time';
import { getPeriodKind, getPeriodBgClass, isCellNight } from '@/utils/weather-period-bg';
import { getActiveNmsAt, NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';
import WeatherIcon from '@/components/WeatherIcon';
import NmTooltip from './NmTooltip';

interface ZoneWeatherRowProps {
  zone: EurekaZone;
  selectedWeathers: Set<string>;
  now: number;
  forecastCount?: number;
  scrollRef?: (el: HTMLDivElement | null) => void;
  onScroll?: (scrollLeft: number) => void;
}

const DEFAULT_FORECAST_COUNT = 48;

function formatRelMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

export function formatCellTime(ts: number, now: number = Date.now()): string {
  const d = new Date(ts);
  const n = new Date(now);
  const sameDay =
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  if (sameDay) return `${hh}:${mi}`;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
}

export default function ZoneWeatherRow({
  zone,
  selectedWeathers,
  now,
  forecastCount = DEFAULT_FORECAST_COUNT,
  scrollRef,
  onScroll,
}: ZoneWeatherRowProps) {
  const localRef = useRef<HTMLDivElement | null>(null);

  const forecasts = useMemo(
    () => generateForecasts(zone, forecastCount, now),
    [zone, now, forecastCount],
  );

  const nextMatch = useMemo(() => {
    if (selectedWeathers.size === 0) return null;
    const [match] = findWeatherMatches(zone, selectedWeathers, 1, now);
    return match ?? null;
  }, [zone, selectedWeathers, now]);

  const targetWeather = useMemo<string | null>(() => {
    if (selectedWeathers.size === 0) {
      return forecasts[0]?.weather ?? null;
    }
    return nextMatch?.weather ?? null;
  }, [selectedWeathers, forecasts, nextMatch]);

  const targetWeatherTw = targetWeather
    ? weatherNamesTw[targetWeather] ?? targetWeather
    : null;

  const currentPeriodWeather = forecasts[0]?.weather ?? null;

  const lastEnded = useMemo(() => {
    if (!targetWeather) return null;
    return findLastEndedWeather(zone, targetWeather, now, DEFAULT_LOOKBACK_PERIODS);
  }, [zone, targetWeather, now]);

  const inProgress =
    targetWeather !== null && currentPeriodWeather === targetWeather;

  const remainingMs = useMemo(() => {
    if (!inProgress || targetWeather === null) return null;
    return currentRunRemaining(zone, targetWeather, now);
  }, [zone, targetWeather, now, inProgress]);

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

  const lastLabel = targetWeatherTw
    ? lastEnded
      ? `上次${targetWeatherTw}結束：${formatRelMs(now - (lastEnded.startTime + WEATHER_PERIOD_MS))}前`
      : `上次${targetWeatherTw}超過三小時前`
    : null;

  const rightLabel =
    targetWeatherTw === null
      ? null
      : inProgress && remainingMs !== null
        ? `目前${targetWeatherTw}剩 ${formatRelMs(remainingMs)}`
        : nextMatch
          ? `下次${targetWeatherTw}：${formatRelMs(nextMatch.startTime - now)}後`
          : null;

  const showInfoLine = targetWeatherTw !== null && (lastLabel !== null || rightLabel !== null);

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-semibold text-foreground">
          {zoneNamesTw[zone]}
          <span className="ml-2 text-xs font-normal text-amber-300/70">
            · {getZoneLevelLabel(zone)}
          </span>
        </span>
        <div className="flex items-center gap-2">
          {showInfoLine && (
            <span className="text-xs text-amber-300">
              {lastLabel}
              {lastLabel && rightLabel && ' ・ '}
              {rightLabel}
            </span>
          )}
        </div>
      </div>
      <div
        ref={setRefs}
        onScroll={(e) => onScroll?.(e.currentTarget.scrollLeft)}
        className="flex gap-1 mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {forecasts.map((f, idx) => {
          const isCurrent = idx === 0;
          const matchedByWeather = selectedWeathers.has(f.weather);
          const matchedByNight =
            selectedWeathers.has(NIGHT_FILTER_KEY) &&
            isCellNight(f.startTime, isCurrent ? now : undefined);
          const matched = matchedByWeather || matchedByNight;
          const nms = isCurrent
            ? getActiveNmsAt(zone, f.weather, f.startTime, now)
            : getActiveNmsAt(zone, f.weather, f.startTime);
          const hasAnyNm = nms.length > 0;
          const bgClass = getPeriodBgClass(getPeriodKind(f.startTime));
          const nowOffsetPct = isCurrent
            ? Math.max(0, Math.min(100, ((now - f.startTime) / WEATHER_PERIOD_MS) * 100))
            : null;
          return (
            <NmTooltip key={f.startTime} nms={nms}>
              <div
                data-period-cell
                data-matched={matched ? 'true' : 'false'}
                className={`relative flex-shrink-0 w-16 rounded p-1 text-center text-[10px] border ${bgClass} ${
                  matched
                    ? 'border-amber-500 shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_0_8px_rgba(251,191,36,0.35)]'
                    : 'border-border/50'
                } ${isCurrent ? 'ring-1 ring-primary' : ''}`}
              >
                <div className="flex justify-center">
                  <WeatherIcon weatherEn={f.weather} weatherTw={f.weatherTw} size={20} />
                </div>
                <div className="text-muted-foreground mt-0.5">{f.weatherTw}</div>
                <div className="text-muted-foreground/70">
                  {isCurrent ? '現在' : formatCellTime(f.startTime, now)}
                </div>
                {hasAnyNm && (
                  <div className="absolute top-0.5 right-0.5 px-1 rounded bg-red-600 text-white text-[8px] font-bold leading-[10px] shadow-[0_0_6px_rgba(220,38,38,0.6)]">
                    NM
                  </div>
                )}
                {nowOffsetPct !== null && (
                  <div
                    data-now-line
                    className="absolute top-0 bottom-0 w-[2px] bg-amber-400/70 shadow-[0_0_4px_rgba(251,191,36,0.5)] pointer-events-none"
                    style={{ left: `${nowOffsetPct}%` }}
                  />
                )}
              </div>
            </NmTooltip>
          );
        })}
      </div>
    </div>
  );
}
