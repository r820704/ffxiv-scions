import { getZoneWeathers, weatherNamesTw } from '../data/weather-data';
import WeatherIcon from './WeatherIcon';
import styles from '../styles/App.module.css';

interface WeatherFilterProps {
  zone: string;
  selectedWeathers: Set<string>;
  onToggleWeather: (weather: string) => void;
}

export default function WeatherFilter({ zone, selectedWeathers, onToggleWeather }: WeatherFilterProps) {
  const weathers = getZoneWeathers(zone);

  return (
    <section className={styles.card}>
      <div className={styles.filterTitle}>篩選天氣（點擊選擇）</div>
      <div className={styles.filterChips}>
        {weathers.map((w) => {
          const tw = weatherNamesTw[w] ?? w;
          return (
            <button
              key={w}
              className={`${styles.chip} ${selectedWeathers.has(w) ? styles.chipActive : ''}`}
              onClick={() => onToggleWeather(w)}
            >
              <WeatherIcon weatherEn={w} weatherTw={tw} size={18} />
              {tw}
            </button>
          );
        })}
      </div>
    </section>
  );
}
