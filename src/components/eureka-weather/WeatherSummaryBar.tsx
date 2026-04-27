import { useMemo } from 'react';
import { EUREKA_ZONES, weatherNamesTw, zoneNamesTw, type EurekaZone } from '@/data/weather-data';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';
import { getNextHits } from '@/utils/weather-summary';
import WeatherIcon from '@/components/WeatherIcon';

interface WeatherSummaryBarProps {
  selected: Set<string>;
  now: number;
  forecastCount: number;
  onScrollToCell: (zone: EurekaZone, cellIndex: number) => void;
}

function formatRel(ms: number): string {
  if (ms <= 0) return '現在';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小時${m % 60}分後`;
  return `${m}分後`;
}

function getFilterLabel(filterId: string): string {
  if (filterId === NIGHT_FILTER_KEY) return '🌙 夜間';
  return weatherNamesTw[filterId] ?? filterId;
}

export default function WeatherSummaryBar({
  selected,
  now,
  forecastCount,
  onScrollToCell,
}: WeatherSummaryBarProps) {
  const rows = useMemo(() => {
    return [...selected].map((filterId) => ({
      filterId,
      hits: getNextHits(filterId, EUREKA_ZONES, now, forecastCount, 3),
    }));
  }, [selected, now, forecastCount]);

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 bg-secondary/50 rounded-lg p-2 text-xs">
      {rows.map(({ filterId, hits }) => {
        const label = getFilterLabel(filterId);
        const isNight = filterId === NIGHT_FILTER_KEY;
        const missingCount = EUREKA_ZONES.filter(
          (z) => !hits.some((h) => h.zone === z),
        ).length;

        return (
          <div key={filterId} className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-amber-300/90 min-w-[64px]">
              {!isNight && (
                <WeatherIcon
                  weatherEn={filterId}
                  weatherTw={label}
                  size={14}
                />
              )}
              <span>{label}</span>
            </span>
            {hits.length === 0 ? (
              <span className="text-muted-foreground/70">
                4 張地圖無此{isNight ? '時段' : '天氣'}
              </span>
            ) : (
              <>
                {hits.map((h) => (
                  <button
                    key={`${h.zone}-${h.cellIndex}`}
                    type="button"
                    onClick={() => onScrollToCell(h.zone, h.cellIndex)}
                    className="px-2 py-0.5 rounded border border-border/50 hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                  >
                    {zoneNamesTw[h.zone].replace('優雷卡', '')} · {formatRel(h.startTime - now)}
                  </button>
                ))}
                {missingCount > 0 && (
                  <span className="text-muted-foreground/60">
                    （{missingCount} 張地圖無此{isNight ? '時段' : '天氣'}）
                  </span>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
