import { useMemo } from 'react';
import type { WeatherForecast } from '../utils/weather-engine';
import { generateForecasts } from '../utils/weather-engine';
import {
  formatLocalClock,
  formatLocalDateKey,
  formatLocalDateLabel,
  toEorzeaTime,
  formatEorzeaTime,
  WEATHER_PERIOD_MS,
} from '../utils/eorzea-time';
import { getWeatherColor } from '../utils/weather-colors';
import styles from '../styles/App.module.css';

interface WeatherTimelineProps {
  zone: string;
}

interface DateGroup {
  key: string;
  label: string;
  items: WeatherForecast[];
}

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

export default function WeatherTimeline({ zone }: WeatherTimelineProps) {
  const now = useMemo(() => Date.now(), []);
  const forecasts: WeatherForecast[] = useMemo(
    () => generateForecasts(zone, 30, now),
    [zone, now],
  );
  const groups = useMemo(() => groupByLocalDate(forecasts, now), [forecasts, now]);
  const currentStart = forecasts[0]?.startTime;

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>天氣預報</h2>
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
                    <span
                      className={styles.weatherDot}
                      style={{ background: color }}
                      aria-hidden="true"
                    />
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
    </section>
  );
}
