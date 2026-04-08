import { useMemo } from 'react';
import type { WeatherForecast } from '../utils/weather-engine';
import { generateForecasts, findWeatherMatches } from '../utils/weather-engine';
import {
  formatLocalClock,
  formatLocalDateKey,
  formatLocalDateLabel,
  toEorzeaTime,
  formatEorzeaTime,
  WEATHER_PERIOD_MS,
} from '../utils/eorzea-time';
import { getWeatherColor } from '../utils/weather-colors';
import WeatherIcon from './WeatherIcon';
import styles from '../styles/App.module.css';

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
    // Highlight only the current actual period — not just the first item
    // (the first item could be far in the future when filtering).
    const all = generateForecasts(zone, 1, now);
    return all[0]?.startTime;
  }, [zone, now]);

  const title = isFiltered
    ? `天氣預報（符合條件 ${forecasts.length} 筆）`
    : '天氣預報';

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {forecasts.length === 0 ? (
        <div className={styles.emptyMatches}>沒有符合條件的時段</div>
      ) : (
        <div className={styles.timelineList}>
          {groups.map((group) => (
            <div key={group.key} className={styles.timelineGroup}>
              <div className={styles.timelineGroupLabel}>{group.label}</div>
              <ul className={styles.timelineItems}>
                {group.items.map((f) => {
                  const isCurrent = f.startTime === currentStart;
                  const endTime = f.startTime + WEATHER_PERIOD_MS;
                  const etStart = toEorzeaTime(f.startTime);
                  const etEnd = toEorzeaTime(endTime);
                  const color = getWeatherColor(f.weatherTw);
                  return (
                    <li
                      key={f.startTime}
                      className={`${styles.timelineRow} ${isCurrent ? styles.timelineRowCurrent : ''}`}
                      style={{ borderLeftColor: color }}
                    >
                      <WeatherIcon weatherEn={f.weather} weatherTw={f.weatherTw} />
                      <span className={styles.weatherName}>{f.weatherTw}</span>
                      <span className={styles.timeRange}>
                        {formatLocalClock(f.startTime)}–{formatLocalClock(endTime)}
                      </span>
                      <span className={styles.etRange}>
                        ET {formatEorzeaTime(etStart)}–{formatEorzeaTime(etEnd)}
                      </span>
                      {isCurrent && <span className={styles.currentBadge}>目前</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
