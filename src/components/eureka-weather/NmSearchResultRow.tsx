import { useMemo } from 'react';
import type { EurekaZone } from '@/data/weather-data';
import { zoneNamesTw } from '@/data/weather-data';
import { formatNmTrigger, NIGHT_FILTER_KEY, type EurekaNm } from '@/data/eureka-nm-data';
import { getNextHits } from '@/utils/weather-summary';
import { EUREKA_ZONES } from '@/data/weather-data';
import { preloadEurekaMap } from '@/utils/preload-eureka-map';

interface NmSearchResultRowProps {
  nm: EurekaNm;
  now: number;
  forecastCount: number;
  onScrollToCell: (zone: EurekaZone, cellIndex: number) => void;
  onOpenDetail?: (nmId: string) => void;
}

function formatRel(ms: number): string {
  if (ms <= 0) return '現在';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小時${m % 60}分後`;
  return `${m}分後`;
}

// Pick the primary filter id used to compute next windows for a conditional NM.
// Weather > timeOfDay (most NMs are weather-locked; players generally search for weather first).
function getPrimaryFilterId(nm: EurekaNm): string | null {
  if (!nm.trigger) return null;
  if (nm.trigger.weather && nm.trigger.weather.length > 0) return nm.trigger.weather[0]!;
  if (nm.trigger.timeOfDay === 'night') return NIGHT_FILTER_KEY;
  return null;
}

export default function NmSearchResultRow({
  nm,
  now,
  forecastCount,
  onScrollToCell,
  onOpenDetail,
}: NmSearchResultRowProps) {
  const primaryFilter = getPrimaryFilterId(nm);
  const hits = useMemo(() => {
    if (!primaryFilter) return [];
    return getNextHits(primaryFilter, EUREKA_ZONES, now, forecastCount, 3)
      .filter((h) => h.zone === nm.zone);
  }, [primaryFilter, now, forecastCount, nm.zone]);

  const isUnconditional = !nm.trigger;

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
      <div className="flex items-baseline gap-2 flex-wrap">
        {onOpenDetail ? (
          <button
            type="button"
            onMouseEnter={() => preloadEurekaMap(nm.zone)}
            onFocus={() => preloadEurekaMap(nm.zone)}
            onClick={() => onOpenDetail(nm.id)}
            className="text-sm font-semibold text-foreground underline-offset-2 hover:underline hover:text-primary cursor-pointer text-left"
          >
            {nm.nameTw}
          </button>
        ) : (
          <span className="text-sm font-semibold text-foreground">{nm.nameTw}</span>
        )}
        <span className="text-xs text-muted-foreground">{nm.nameEn}</span>
        <span className="text-xs text-muted-foreground">Lv.{nm.level}</span>
        <span className="ml-auto text-xs text-amber-300/80">
          {(zoneNamesTw[nm.zone] ?? nm.zone).replace('優雷卡', '')}
        </span>
      </div>

      {isUnconditional ? (
        <div className="text-xs text-muted-foreground">
          <span className="inline-block px-1.5 py-0.5 rounded bg-muted/50 mr-2">常駐</span>
          無條件、隨時可刷
        </div>
      ) : (
        <>
          <div className="text-xs text-amber-300/80">條件：{formatNmTrigger(nm)}</div>
          {hits.length === 0 ? (
            <div className="text-xs text-muted-foreground/70">
              該地圖前 {forecastCount} 期內無此條件
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {hits.map((h) => (
                <button
                  key={h.cellIndex}
                  type="button"
                  onClick={() => onScrollToCell(h.zone, h.cellIndex)}
                  className="text-xs px-2 py-0.5 rounded border border-border/50 hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                >
                  {formatRel(h.startTime - now)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
