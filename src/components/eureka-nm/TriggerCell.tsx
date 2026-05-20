import type { EurekaNm } from '@/data/eureka-nm-data';
import { nmSpawnInfo } from '@/data/eureka-nm-spawn-data';
import { weatherNamesTw } from '@/data/weather-data';
import { Check, Hourglass } from 'lucide-react';
import WeatherIcon from '@/components/WeatherIcon';
import { computeConditionStatus } from '@/utils/nm-tracker-state';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';
import { isDayTime } from '@/utils/game-day-night';
import { toEorzeaTime } from '@/utils/eorzea-time';
import type { ConditionStatus } from '@/types/nm-tracker';

interface NmCondition {
  weather?: string[];
  timeOfDay?: 'day' | 'night';
}

interface Props { nm: EurekaNm; now: number; }

function weatherIcon(w: string): JSX.Element {
  const tw = weatherNamesTw[w] ?? w;
  return <WeatherIcon weatherEn={w} weatherTw={tw} size={12} />;
}

function weatherLabel(weathers: string[] | undefined): string {
  if (!weathers || weathers.length === 0) return '';
  return weathers.map(w => weatherNamesTw[w] ?? w).join('/');
}

function statusIcon(s: ConditionStatus): JSX.Element | null {
  if (s === 'met') return <Check className="inline h-3 w-3 text-success" aria-label="符合" />;
  if (s === 'soon') return <Hourglass className="inline h-3 w-3 text-warning" aria-label="即將" />;
  return null;
}

function ConditionSegment({ cond, status, prefix, mobName }: {
  cond: NmCondition;
  status: ConditionStatus;
  prefix?: string;
  mobName?: string;
}) {
  const weatherTw = weatherLabel(cond.weather);
  return (
    <>
      {/* Desktop: full text + icons */}
      <span className="hidden md:inline-flex items-center gap-0.5 text-xs">
        {mobName && <span>{mobName}・</span>}
        {prefix && <span>{prefix}</span>}
        {cond.timeOfDay === 'night' && (
          <span className="inline-flex items-center gap-0.5">
            <span aria-hidden="true">🌙</span>
            <span>夜間</span>
          </span>
        )}
        {cond.timeOfDay === 'day' && (
          <span className="inline-flex items-center gap-0.5">
            <span aria-hidden="true">☀</span>
            <span>白天</span>
          </span>
        )}
        {cond.weather?.map(w => (
          <span key={w} className="inline-flex items-center gap-0.5">
            {weatherIcon(w)}
          </span>
        ))}
        {weatherTw && <span>{weatherTw}</span>}
        {statusIcon(status)}
      </span>
      {/* Mobile: emoji + full TC label */}
      <span className="md:hidden inline-flex items-center gap-0.5 text-xs">
        {cond.timeOfDay === 'night' && (
          <span className="inline-flex items-center gap-0.5">
            <span aria-hidden="true">🌙</span>
            <span>夜間</span>
          </span>
        )}
        {cond.timeOfDay === 'day' && (
          <span className="inline-flex items-center gap-0.5">
            <span aria-hidden="true">☀</span>
            <span>白天</span>
          </span>
        )}
        {cond.weather?.map(w => <span key={`m-${w}`}>{weatherIcon(w)}</span>)}
        {statusIcon(status)}
      </span>
    </>
  );
}

export function TriggerCell({ nm, now }: Props) {
  const mob = nm.trigger?.mob;
  const nmCond = nm.trigger?.nm;

  if (!mob && !nmCond) {
    return <span className="text-xs text-muted-foreground">常駐</span>;
  }

  const ctx = {
    isNight: !isDayTime(toEorzeaTime(now)),
    isWeather: (w: string) => isWeatherActive(nm.zone, w, now),
    minutesToWeather: (w: string) => msUntilWeather(nm.zone, w, now) / 60_000,
  };

  // Get mob name(s) from nmSpawnInfo
  const mobSpawns = nmSpawnInfo[nm.id]?.trigger ?? [];
  const mobName = mobSpawns.length > 0 ? mobSpawns.map(m => m.nameTw).join('/') : undefined;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {mob && (
        <ConditionSegment
          cond={mob}
          status={computeConditionStatus(mob, ctx)}
          mobName={mobName}
        />
      )}
      {mob && nmCond && <span className="text-muted-foreground">｜</span>}
      {nmCond && (
        <ConditionSegment
          cond={nmCond}
          status={computeConditionStatus(nmCond, ctx)}
          prefix="NM需"
        />
      )}
    </div>
  );
}
