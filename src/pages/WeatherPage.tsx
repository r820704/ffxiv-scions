import { useState, useCallback } from 'react';
import { zoneNamesTw } from '@/data/weather-data';
import ZoneSelector from '@/components/ZoneSelector';
import WeatherTimeline from '@/components/WeatherTimeline';
import WeatherFilter from '@/components/WeatherFilter';

export default function WeatherPage() {
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
    <div>
      <h1 className="font-title text-2xl font-bold text-center text-primary mb-4">
        天氣查詢
      </h1>
      <ZoneSelector selectedZone={selectedZone} onSelectZone={handleSelectZone} />
      <div className="flex flex-col gap-4 mt-4">
        {selectedZone ? (
          <>
            <h2 className="text-xl font-semibold text-foreground">
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
          <div className="text-center text-muted-foreground mt-16">
            <p>↑ 請從上方選擇一個地區</p>
            <p className="text-sm mt-2">選擇後可查看天氣預報與篩選符合條件的時段</p>
          </div>
        )}
      </div>
    </div>
  );
}
