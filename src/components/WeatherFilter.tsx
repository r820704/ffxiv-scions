import { getZoneWeathers, weatherNamesTw } from '../data/weather-data';
import styles from '../styles/App.module.css';

interface WeatherFilterProps {
  zone: string;
  selectedWeathers: Set<string>;
  onToggleWeather: (weather: string) => void;
}

export default function WeatherFilter({ zone, selectedWeathers, onToggleWeather }: WeatherFilterProps) {
  const weathers = getZoneWeathers(zone);

  return (
    <div className={styles.filterSection}>
      <div className={styles.filterTitle}>篩選天氣（點擊選擇）</div>
      <div className={styles.filterChips}>
        {weathers.map((w) => (
          <button
            key={w}
            className={`${styles.chip} ${selectedWeathers.has(w) ? styles.chipActive : ''}`}
            onClick={() => onToggleWeather(w)}
          >
            {weatherNamesTw[w] ?? w}
          </button>
        ))}
      </div>
    </div>
  );
}
