import { EUREKA_ZONES, getZoneWeathers, weatherNamesTw } from '@/data/weather-data';
import WeatherIcon from '@/components/WeatherIcon';

interface WeatherFilterBarProps {
  selected: Set<string>;
  onToggle: (weather: string) => void;
}

export default function WeatherFilterBar({ selected, onToggle }: WeatherFilterBarProps) {
  const all = new Set<string>();
  for (const z of EUREKA_ZONES) {
    for (const w of getZoneWeathers(z)) all.add(w);
  }
  const sortedWeathers = [...all].sort();

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-secondary rounded-lg p-3">
      <span className="text-xs text-muted-foreground mr-1">天氣篩選</span>
      {sortedWeathers.map((w) => {
        const isOn = selected.has(w);
        const tw = weatherNamesTw[w] ?? w;
        return (
          <button
            key={w}
            onClick={() => onToggle(w)}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors cursor-pointer ${
              isOn
                ? 'bg-amber-600 text-amber-50'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <WeatherIcon weatherEn={w} weatherTw={tw} size={14} />
            <span>{tw}</span>
          </button>
        );
      })}
    </div>
  );
}
