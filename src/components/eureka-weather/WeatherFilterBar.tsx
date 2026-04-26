import { EUREKA_ZONES, getZoneWeathers, weatherNamesTw } from '@/data/weather-data';
import WeatherIcon from '@/components/WeatherIcon';

interface WeatherFilterBarProps {
  selected: Set<string>;
  onToggle: (weather: string) => void;
  onClearAll?: () => void;
  onJumpToNow?: () => void;
}

export default function WeatherFilterBar({ selected, onToggle, onClearAll, onJumpToNow }: WeatherFilterBarProps) {
  const all = new Set<string>();
  for (const z of EUREKA_ZONES) {
    for (const w of getZoneWeathers(z)) all.add(w);
  }
  const sortedWeathers = [...all].sort();
  const hasSelection = selected.size > 0;

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
      <div className="ml-auto flex items-center gap-1.5">
        {onJumpToNow && (
          <button
            type="button"
            onClick={onJumpToNow}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-border/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer animate-in fade-in"
          >
            <span>↺</span>
            <span>回到現在</span>
          </button>
        )}
        {hasSelection && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-border/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            <span>✕</span>
            <span>清除全部 ({selected.size})</span>
          </button>
        )}
      </div>
    </div>
  );
}
