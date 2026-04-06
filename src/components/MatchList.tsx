import { useMemo } from 'react';
import { findWeatherMatches } from '../utils/weather-engine';
import { formatLocalTime, toEorzeaTime, formatEorzeaTime } from '../utils/eorzea-time';
import styles from '../styles/App.module.css';

interface MatchListProps {
  zone: string;
  targetWeathers: Set<string>;
}

export default function MatchList({ zone, targetWeathers }: MatchListProps) {
  const now = useMemo(() => Date.now(), []);
  const matches = useMemo(
    () => findWeatherMatches(zone, targetWeathers, 50, now),
    [zone, targetWeathers, now],
  );

  if (targetWeathers.size === 0) {
    return null;
  }

  return (
    <div>
      <div className={styles.sectionTitle}>
        匹配結果（{matches.length} 筆）
      </div>
      <table className={styles.matchTable}>
        <thead>
          <tr>
            <th>本地時間</th>
            <th>ET 時間</th>
            <th>天氣</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => {
            const et = toEorzeaTime(m.startTime);
            return (
              <tr key={m.startTime}>
                <td>{formatLocalTime(m.startTime)}</td>
                <td>{formatEorzeaTime(et)}</td>
                <td>{m.weatherTw}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
