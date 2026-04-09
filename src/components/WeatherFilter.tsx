import { getZoneWeathers, weatherNamesTw } from '@/data/weather-data';
import WeatherIcon from '@/components/WeatherIcon';
import { cn } from '@/lib/utils';

interface WeatherFilterProps {
  zone: string;
  selectedWeathers: Set<string>;
  onToggleWeather: (weather: string) => void;
}

export default function WeatherFilter({ zone, selectedWeathers, onToggleWeather }: WeatherFilterProps) {
  const weathers = getZoneWeathers(zone);

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">篩選天氣（點擊選擇）</p>
      <div className="flex flex-wrap gap-1.5">
        {weathers.map((w) => {
          const tw = weatherNamesTw[w] ?? w;
          return (
            <button
              key={w}
              onClick={() => onToggleWeather(w)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-md border transition-colors cursor-pointer',
                selectedWeathers.has(w)
                  ? 'bg-secondary border-primary text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
            >
              <WeatherIcon weatherEn={w} weatherTw={tw} size={18} />
              {tw}
            </button>
          );
        })}
      </div>
    </div>
  );
}
