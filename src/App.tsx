import { useState, useCallback } from 'react';
import { zoneNamesTw } from './data/weather-data';
import ZoneSelector from './components/ZoneSelector';
import WeatherTimeline from './components/WeatherTimeline';
import WeatherFilter from './components/WeatherFilter';
import MatchList from './components/MatchList';
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
              <div className={styles.sectionTitle}>
                {zoneNamesTw[selectedZone] ?? selectedZone}
              </div>
              <WeatherFilter
                zone={selectedZone}
                selectedWeathers={selectedWeathers}
                onToggleWeather={handleToggleWeather}
              />
              <WeatherTimeline zone={selectedZone} />
              <MatchList zone={selectedZone} targetWeathers={selectedWeathers} />
            </>
          ) : (
            <div className={styles.noSelection}>← 請選擇一個地區</div>
          )}
        </div>
      </div>
    </div>
  );
}
