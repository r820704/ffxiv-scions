import { EUREKA_ZONES, getZoneWeathers, weatherNamesTw } from '@/data/weather-data';
import { getNmTriggeringWeathers, NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';
import { useLocalStorageBool } from '@/hooks/useLocalStorageBool';
import WeatherIcon from '@/components/WeatherIcon';
import { Tooltip } from '@/components/ui/Tooltip';

interface WeatherFilterBarProps {
  selected: Set<string>;
  onToggle: (weather: string) => void;
  onClearAll?: () => void;
  onJumpToNow?: () => void;
}

export default function WeatherFilterBar({
  selected,
  onToggle,
  onClearAll,
  onJumpToNow,
}: WeatherFilterBarProps) {
  const [generalExpanded, setGeneralExpanded] = useLocalStorageBool(
    'eureka-weather-filter-general-expanded',
    false,
  );

  const allWeathers = new Set<string>();
  for (const z of EUREKA_ZONES) {
    for (const w of getZoneWeathers(z)) allWeathers.add(w);
  }
  const sortedAll = [...allWeathers].sort();
  const nmTriggering = new Set(getNmTriggeringWeathers());
  const nmTriggers = sortedAll.filter((w) => nmTriggering.has(w));
  const generals = sortedAll.filter((w) => !nmTriggering.has(w));
  const hasSelection = selected.size > 0;

  const renderWeatherChip = (w: string) => {
    const isOn = selected.has(w);
    const tw = weatherNamesTw[w] ?? w;
    return (
      <button
        key={w}
        onClick={() => onToggle(w)}
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors cursor-pointer ${
          isOn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        <WeatherIcon weatherEn={w} weatherTw={tw} size={14} />
        <span>{tw}</span>
      </button>
    );
  };

  const renderNightChip = () => {
    const isOn = selected.has(NIGHT_FILTER_KEY);
    return (
      <Tooltip key={NIGHT_FILTER_KEY} label="夜間 NM（每日 ET 18:00–6:00 不依天氣出現）">
        <button
          onClick={() => onToggle(NIGHT_FILTER_KEY)}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
            isOn
              ? 'bg-night text-night-foreground border-night/60'
              : 'bg-muted text-muted-foreground border-night/40 hover:bg-muted/80'
          }`}
        >
          <span>🌙</span>
          <span>夜間</span>
        </button>
      </Tooltip>
    );
  };

  return (
    <div className="bg-secondary rounded-lg p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-1">觸發 NM：</span>
        {nmTriggers.map(renderWeatherChip)}
        {renderNightChip()}
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
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setGeneralExpanded(!generalExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{generalExpanded ? '▾' : '▸'}</span>
          <span>一般天氣 ({generals.length})</span>
        </button>
        {generalExpanded && generals.map(renderWeatherChip)}
      </div>
    </div>
  );
}
