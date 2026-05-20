import type { EurekaNm } from '@/data/eureka-nm-data';
import { nmSpawnInfo } from '@/data/eureka-nm-spawn-data';
import { weatherNamesTw } from '@/data/weather-data';
import { Check, Hourglass, Clock } from 'lucide-react';
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

const EMPTY_LABEL = '—';

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
  if (s === 'distant') return <Clock className="inline h-3 w-3 text-muted-foreground" aria-label="等待中" />;
  return null;
}

function formatMinutes(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '';
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${m % 60}m`;
}

function ctxOf(nm: EurekaNm, now: number) {
  return {
    isNight: !isDayTime(toEorzeaTime(now)),
    isWeather: (w: string) => isWeatherActive(nm.zone, w, now),
    minutesToWeather: (w: string) => msUntilWeather(nm.zone, w, now) / 60_000,
  };
}

/**
 * Desktop "觸發怪" column: mob name + condition (day/night + weather) + status icon.
 * Renders "—" when this NM has no mob condition.
 */
export function MobConditionCell({ nm, now }: Props) {
  const mob = nm.trigger?.mob;
  if (!mob) return <span className="text-xs text-muted-foreground">{EMPTY_LABEL}</span>;

  const ctx = ctxOf(nm, now);
  const status = computeConditionStatus(mob, ctx);
  const mobSpawns = nmSpawnInfo[nm.id]?.trigger ?? [];
  const mobName = mobSpawns.length > 0 ? mobSpawns.map(m => m.nameTw).join('/') : undefined;
  const wTw = weatherLabel(mob.weather);

  return (
    <span className="inline-flex items-center gap-0.5 text-xs whitespace-nowrap">
      {mobName && <span>{mobName}・</span>}
      {mob.timeOfDay === 'night' && (
        <>
          <span aria-hidden="true">🌙</span>
          <span>夜間</span>
        </>
      )}
      {mob.timeOfDay === 'day' && (
        <>
          <span aria-hidden="true">☀</span>
          <span>白天</span>
        </>
      )}
      {mob.weather?.map(w => <span key={w}>{weatherIcon(w)}</span>)}
      {wTw && <span>{wTw}</span>}
      {statusIcon(status)}
    </span>
  );
}

/**
 * Desktop "NM 條件" column: NM weather/time condition + status icon + countdown
 * to the next occurrence (only shown when not currently active).
 * Renders "—" when this NM has no own condition.
 */
export function NmConditionCell({ nm, now }: Props) {
  const nmCond = nm.trigger?.nm;
  if (!nmCond) return <span className="text-xs text-muted-foreground">{EMPTY_LABEL}</span>;

  const ctx = ctxOf(nm, now);
  const status = computeConditionStatus(nmCond, ctx);
  const wTw = weatherLabel(nmCond.weather);

  // Countdown to next occurrence of the first weather option (only when not currently active)
  let countdown = '';
  if (nmCond.weather && nmCond.weather.length > 0 && status !== 'met') {
    const firstWeather = nmCond.weather[0]!;
    const ms = msUntilWeather(nm.zone, firstWeather, now);
    countdown = formatMinutes(ms);
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs whitespace-nowrap">
      {nmCond.timeOfDay === 'night' && (
        <>
          <span aria-hidden="true">🌙</span>
          <span>夜間</span>
        </>
      )}
      {nmCond.timeOfDay === 'day' && (
        <>
          <span aria-hidden="true">☀</span>
          <span>白天</span>
        </>
      )}
      {nmCond.weather?.map(w => <span key={w}>{weatherIcon(w)}</span>)}
      {wTw && <span>{wTw}</span>}
      {statusIcon(status)}
      {countdown && <span className="text-muted-foreground"> {countdown}</span>}
    </span>
  );
}

/**
 * Mobile-only merged condition cell: icons-only for both mob and NM segments,
 * no countdown text (save horizontal space). Separated by ｜ when both exist.
 * 「—」 when neither condition exists.
 */
export function MergedConditionCellMobile({ nm, now }: Props) {
  const mob = nm.trigger?.mob;
  const nmCond = nm.trigger?.nm;

  if (!mob && !nmCond) {
    return <span className="text-xs text-muted-foreground">{EMPTY_LABEL}</span>;
  }

  const ctx = ctxOf(nm, now);

  function renderSegment(cond: NmCondition | undefined): JSX.Element | null {
    if (!cond) return null;
    const status = computeConditionStatus(cond, ctx);
    return (
      <span className="inline-flex items-center gap-0.5">
        {cond.timeOfDay === 'night' && <span aria-label="夜間">🌙</span>}
        {cond.timeOfDay === 'day' && <span aria-label="白天">☀</span>}
        {cond.weather?.map(w => <span key={`m-${w}`}>{weatherIcon(w)}</span>)}
        {statusIcon(status)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs">
      {renderSegment(mob)}
      {mob && nmCond && <span className="text-muted-foreground">｜</span>}
      {renderSegment(nmCond)}
    </span>
  );
}
