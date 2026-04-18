import { useMemo } from 'react';
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
}

const FORECAST_COUNT = 8;

function formatRelMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function ZoneWeatherRow({ zone, selectedWeathers, now }: ZoneWeatherRowProps) {
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

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-semibold text-foreground">{zoneNamesTw[zone]}</span>
        {nextMatch && firstSelectedTw && (
          <span className="text-xs text-amber-300">
            下次{firstSelectedTw}：{formatRelMs(nextMatch.startTime - now)}
          </span>
        )}
      </div>
      <div className="flex gap-1 mt-2 overflow-x-auto">
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
