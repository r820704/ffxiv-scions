import { useState, useCallback } from 'react';
import { zoneNamesTw } from './data/weather-data';
import ZoneSelector from './components/ZoneSelector';
import WeatherTimeline from './components/WeatherTimeline';
import WeatherFilter from './components/WeatherFilter';
import styles from './styles/App.module.css';

export default function App() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedWeathers, setSelectedWeathers] = useState<Set<string>>(new Set());

  const handleSelectZone = useCallback((zone: string) => {
    setSelectedZone(zone);
    setSelectedWeathers(new Set());
  }, []);

  const handleToggleWeather = useCallback((weather: string) => {
    setSelectedWeathers((prev) => {
      const next = new Set(prev);
      if (next.has(weather)) {
        next.delete(weather);
      } else {
        next.add(weather);
      }
      return next;
    });
  }, []);

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>FFXIV 天氣查詢工具</h1>
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <ZoneSelector selectedZone={selectedZone} onSelectZone={handleSelectZone} />
        </div>
        <div className={styles.main}>
          {selectedZone ? (
            <>
              <h2 className={styles.zoneTitle}>
                {zoneNamesTw[selectedZone] ?? selectedZone}
              </h2>
              <WeatherFilter
                zone={selectedZone}
                selectedWeathers={selectedWeathers}
                onToggleWeather={handleToggleWeather}
              />
              <WeatherTimeline zone={selectedZone} selectedWeathers={selectedWeathers} />
            </>
          ) : (
            <div className={styles.noSelection}>
              ← 請從左側選擇一個地區
              <span className={styles.noSelectionHint}>選擇後可查看天氣預報與篩選符合條件的時段</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
