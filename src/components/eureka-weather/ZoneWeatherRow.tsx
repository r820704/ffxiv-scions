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
import { eurekaNms, getActiveNmsAt, NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';
import WeatherIcon from '@/components/WeatherIcon';
import NmTooltip from './NmTooltip';

interface ZoneWeatherRowProps {
  zone: EurekaZone;
  selectedWeathers: Set<string>;
  now: number;
  forecastCount?: number;
  loadMoreStep?: number;
  onLoadMore?: () => void;
  scrollRef?: (el: HTMLDivElement | null) => void;
  onScroll?: (scrollLeft: number) => void;
  onOpenDetail?: (nmId: string) => void;
  onOpenList?: (zone: EurekaZone) => void;
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
  loadMoreStep,
  onLoadMore,
  scrollRef,
  onScroll,
  onOpenDetail,
  onOpenList,
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

  useEffect(() => {
    const stride = 68; // matches scrollToCell stride in EurekaWeatherPage
    const apply = () => {
      const hash = window.location.hash;
      const match = hash.match(/[?&]focus=([^:&]+):(\d+)/);
      if (!match) return;
      const focusZone = decodeURIComponent(match[1] ?? '');
      const idx = parseInt(match[2] ?? '0', 10);
      if (focusZone !== zone) return;
      const el = localRef.current;
      if (!el) return;
      el.scrollTo({ left: Math.max(0, idx * stride - stride), behavior: 'smooth' });
      const cell = el.querySelector<HTMLElement>(`[data-cell-index="${idx}"]`);
      if (cell) {
        cell.classList.add('ring-2', 'ring-amber-400');
        const timeoutId = window.setTimeout(() => {
          cell.classList.remove('ring-2', 'ring-amber-400');
        }, 2000);
        return () => window.clearTimeout(timeoutId);
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [zone]);

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
        {onOpenList && (
          <button
            type="button"
            aria-label="開啟全部 NM 列表"
            onClick={() => onOpenList(zone)}
            className="text-xs px-2 py-0.5 rounded border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
          >
            <span aria-hidden="true">📋</span> 全部 NM ({eurekaNms.filter((n) => n.zone === zone).length})
          </button>
        )}
      </div>
      {showInfoLine && (
        <div className="text-xs text-amber-300 mt-0.5">
          {lastLabel}
          {lastLabel && rightLabel && ' ・ '}
          {rightLabel}
        </div>
      )}
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
          // Split NMs into weather-triggered (red badge) vs night-only (🌙 corner).
          // Pazuzu-like NMs (weather + night) count as weather-triggered.
          const hasWeatherNm = nms.some((n) => n.trigger?.weather && n.trigger.weather.length > 0);
          const hasNightOnlyNm = nms.some(
            (n) => !n.trigger?.weather && n.trigger?.timeOfDay === 'night',
          );
          const bgClass = getPeriodBgClass(getPeriodKind(f.startTime));
          const nowOffsetPct = isCurrent
            ? Math.max(0, Math.min(100, ((now - f.startTime) / WEATHER_PERIOD_MS) * 100))
            : null;
          return (
            <NmTooltip key={f.startTime} nms={nms} onOpenDetail={onOpenDetail}>
              <div
                data-period-cell
                data-cell-index={idx}
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
                {hasWeatherNm && (
                  <div className="absolute top-0.5 right-0.5 px-1 rounded bg-red-600 text-white text-[8px] font-bold leading-[10px] shadow-[0_0_6px_rgba(220,38,38,0.6)]">
                    NM
                  </div>
                )}
                {hasNightOnlyNm && !hasWeatherNm && (
                  <div
                    data-night-nm-indicator
                    className="absolute top-0.5 right-0.5 text-[10px] leading-none"
                    title="此時段有夜間 NM"
                  >
                    🌙
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
        {onLoadMore && loadMoreStep && loadMoreStep > 0 && (
          <button
            type="button"
            data-load-more-cell
            onClick={onLoadMore}
            className="flex-shrink-0 w-16 rounded p-1 text-center text-[10px] border border-dashed border-border/50 bg-muted/30 text-muted-foreground hover:border-primary hover:text-primary hover:bg-muted/60 transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
          >
            <span className="text-base leading-none">＋</span>
            <span>{loadMoreStep}</span>
            <span className="text-[9px]">載入</span>
          </button>
        )}
      </div>
    </div>
  );
}
