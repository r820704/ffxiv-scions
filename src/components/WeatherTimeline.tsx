import { useMemo } from 'react';
import type { WeatherForecast } from '@/utils/weather-engine';
import { generateForecasts, findWeatherMatches } from '@/utils/weather-engine';
import {
  formatLocalClock,
  formatLocalDateKey,
  formatLocalDateLabel,
  toEorzeaTime,
  formatEorzeaTime,
  WEATHER_PERIOD_MS,
} from '@/utils/eorzea-time';
import { getWeatherColor } from '@/utils/weather-colors';
import WeatherIcon from '@/components/WeatherIcon';
import { cn } from '@/lib/utils';

interface WeatherTimelineProps {
  zone: string;
  selectedWeathers: Set<string>;
}

interface DateGroup {
  key: string;
  label: string;
  items: WeatherForecast[];
}

const DEFAULT_FORECAST_COUNT = 30;
const FILTERED_MATCH_COUNT = 30;

function groupByLocalDate(forecasts: WeatherForecast[], now: number): DateGroup[] {
  const groups: DateGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const f of forecasts) {
    const key = formatLocalDateKey(f.startTime);
    let group: DateGroup;
    const idx = indexByKey.get(key);
    if (idx === undefined) {
      group = {
        key,
        label: formatLocalDateLabel(f.startTime, now),
        items: [],
      };
      indexByKey.set(key, groups.length);
      groups.push(group);
    } else {
      group = groups[idx]!;
    }
    group.items.push(f);
  }
  return groups;
}

export default function WeatherTimeline({ zone, selectedWeathers }: WeatherTimelineProps) {
  const now = useMemo(() => Date.now(), []);
  const isFiltered = selectedWeathers.size > 0;

  const forecasts: WeatherForecast[] = useMemo(
    () =>
      isFiltered
        ? findWeatherMatches(zone, selectedWeathers, FILTERED_MATCH_COUNT, now)
        : generateForecasts(zone, DEFAULT_FORECAST_COUNT, now),
    [zone, selectedWeathers, isFiltered, now],
  );
  const groups = useMemo(() => groupByLocalDate(forecasts, now), [forecasts, now]);
  const currentStart = useMemo(() => {
    const all = generateForecasts(zone, 1, now);
    return all[0]?.startTime;
  }, [zone, now]);

  const title = isFiltered
    ? `天氣預報（符合條件 ${forecasts.length} 筆）`
    : '天氣預報';

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      {forecasts.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">沒有符合條件的時段</div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm py-1 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                {group.items.map((f) => {
                  const isCurrent = f.startTime === currentStart;
                  const endTime = f.startTime + WEATHER_PERIOD_MS;
                  const etStart = toEorzeaTime(f.startTime);
                  const etEnd = toEorzeaTime(endTime);
                  const color = getWeatherColor(f.weatherTw);
                  return (
                    <li
                      key={f.startTime}
                      className={cn(
                        'grid items-center gap-2 px-2 py-1.5 rounded-md text-sm border-l-2',
                        'grid-cols-[24px_1fr_auto_auto_3rem]',
                        isCurrent ? 'bg-secondary/60 font-semibold' : ''
                      )}
                      style={{ borderLeftColor: color }}
                    >
                      <WeatherIcon weatherEn={f.weather} weatherTw={f.weatherTw} />
                      <span className="text-foreground">{f.weatherTw}</span>
                      <span className="text-secondary-foreground text-xs tabular-nums">
                        {formatLocalClock(f.startTime)}–{formatLocalClock(endTime)}
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        ET {formatEorzeaTime(etStart)}–{formatEorzeaTime(etEnd)}
                      </span>
                      <span className="justify-self-end">
                        {isCurrent && (
                          <span className="bg-primary text-primary-foreground text-[0.65rem] px-2 py-0.5 rounded-full">
                            目前
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
