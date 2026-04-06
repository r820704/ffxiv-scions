import { useMemo } from 'react';
import type { WeatherForecast } from '../utils/weather-engine';
import { generateForecasts } from '../utils/weather-engine';
import { formatLocalTime, toEorzeaTime, formatEorzeaTime } from '../utils/eorzea-time';
import styles from '../styles/App.module.css';

interface WeatherTimelineProps {
  zone: string;
}

export default function WeatherTimeline({ zone }: WeatherTimelineProps) {
  const now = useMemo(() => Date.now(), []);
  const forecasts: WeatherForecast[] = useMemo(
    () => generateForecasts(zone, 30, now),
    [zone, now],
  );

  return (
    <div>
      <div className={styles.sectionTitle}>天氣時間軸</div>
      <div className={styles.timeline}>
        {forecasts.map((f, i) => {
          const isCurrent = i === 0;
          const et = toEorzeaTime(f.startTime);
          return (
            <div
              key={f.startTime}
              className={`${styles.weatherCell} ${isCurrent ? styles.weatherCellCurrent : ''}`}
            >
              <div>{f.weatherTw}</div>
              <div className={styles.weatherCellTime}>
                {formatLocalTime(f.startTime)}
              </div>
              <div className={styles.weatherCellTime}>
                ET {formatEorzeaTime(et)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
