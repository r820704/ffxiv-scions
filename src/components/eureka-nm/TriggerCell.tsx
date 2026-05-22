import type { EurekaNm } from '@/data/eureka-nm-data';
import { nmSpawnInfo } from '@/data/eureka-nm-spawn-data';
import { weatherNamesTw } from '@/data/weather-data';
import { Check, Hourglass, Clock } from 'lucide-react';
import WeatherIcon from '@/components/WeatherIcon';
import { computeConditionStatus } from '@/utils/nm-tracker-state';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';
import { currentRunRemaining } from '@/utils/weather-engine';
import { isDayTime, getNextTransition } from '@/utils/game-day-night';
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
  return <WeatherIcon weatherEn={w} weatherTw={tw} size={18} />;
}

function weatherLabel(weathers: string[] | undefined): string {
  if (!weathers || weathers.length === 0) return '';
  return weathers.map(w => weatherNamesTw[w] ?? w).join('/');
}

function statusIcon(s: ConditionStatus): JSX.Element | null {
  if (s === 'met') return <Check className="inline align-middle translate-y-px h-3.5 w-3.5 text-success" aria-label="符合" />;
  if (s === 'soon') return <Hourglass className="inline align-middle translate-y-px h-3.5 w-3.5 text-warning" aria-label="即將" />;
  if (s === 'distant') return <Clock className="inline align-middle translate-y-px h-3.5 w-3.5 text-sky-500" aria-label="等待中" />;
  return null;
}

/**
 * Format a millisecond duration as Chinese time string with a prefix:
 *   - < 60 min:  "再 5分30秒" / "剩 5分30秒"   (seconds precision)
 *   - >= 60 min: "再 1小時5分" / "剩 1小時5分" (drop seconds)
 * Returns '' for non-finite or non-positive inputs.
 */
export function formatRemain(ms: number, prefix: '再' | '剩'): string {
  if (!Number.isFinite(ms) || ms <= 0) return '';
  const totalSec = Math.floor(ms / 1000);
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin < 60) {
    const sec = totalSec % 60;
    return `${prefix} ${totalMin}分${String(sec).padStart(2, '0')}秒`;
  }
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${prefix} ${h}小時${m}分`;
}

function ctxOf(nm: EurekaNm, now: number) {
  return {
    isNight: !isDayTime(toEorzeaTime(now)),
    isWeather: (w: string) => isWeatherActive(nm.zone, w, now),
    minutesToWeather: (w: string) => msUntilWeather(nm.zone, w, now) / 60_000,
    msToTransition: getNextTransition(now),
  };
}

function conditionCountdown(
  cond: { weather?: string[]; timeOfDay?: 'day' | 'night' },
  nm: EurekaNm,
  now: number,
  status: ConditionStatus,
): string {
  // met: how long the current window will still last → 「剩」
  if (status === 'met') {
    if (cond.weather && cond.weather.length > 0) {
      // Find which of the listed weathers is currently active and ask how long it runs
      for (const w of cond.weather) {
        if (isWeatherActive(nm.zone, w, now)) {
          const ms = currentRunRemaining(nm.zone, w, now);
          if (ms != null) return formatRemain(ms, '剩');
        }
      }
      return '';
    }
    if (cond.timeOfDay) {
      const ms = getNextTransition(now);  // ms until current day/night flips
      return formatRemain(ms, '剩');
    }
    return '';
  }
  // not met: how long until the next occurrence opens → 「再」
  if (cond.weather && cond.weather.length > 0) {
    const firstWeather = cond.weather[0]!;
    const ms = msUntilWeather(nm.zone, firstWeather, now);
    return formatRemain(ms, '再');
  }
  if (cond.timeOfDay) {
    const ms = getNextTransition(now);
    return formatRemain(ms, '再');
  }
  return '';
}

/**
 * Desktop "觸發怪" column: mob name + condition (day/night + weather) + status icon
 * + countdown to next occurrence (when not currently met).
 * Renders "—" when this NM has no mob condition.
 */
export function MobConditionCell({ nm, now }: Props) {
  const mob = nm.trigger?.mob;
  const mobSpawns = nmSpawnInfo[nm.id]?.trigger ?? [];
  const mobName = mobSpawns.length > 0 ? mobSpawns.map(m => m.nameTw).join('/') : undefined;

  // Every NM has a trigger mob in spawn data; fall back to "—" only when we
  // genuinely have no mob info at all.
  if (!mobName) return <span className="text-xs text-muted-foreground">{EMPTY_LABEL}</span>;

  // No special trigger condition (no day/night, no weather): show mob name only.
  if (!mob) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs whitespace-nowrap">
        <span>{mobName}</span>
      </span>
    );
  }

  const ctx = ctxOf(nm, now);
  const status = computeConditionStatus(mob, ctx);
  const wTw = weatherLabel(mob.weather);
  const countdown = conditionCountdown(mob, nm, now, status);

  return (
    <span className="inline-flex items-center gap-0.5 text-xs whitespace-nowrap">
      <span>{mobName}・</span>
      {mob.timeOfDay === 'night' && (
        <>
          <span aria-hidden="true" className="text-sm leading-none">🌙</span>
          <span>夜間</span>
        </>
      )}
      {mob.timeOfDay === 'day' && (
        <>
          <span aria-hidden="true" className="text-sm leading-none">☀</span>
          <span>白天</span>
        </>
      )}
      {mob.weather?.map(w => <span key={w}>{weatherIcon(w)}</span>)}
      {wTw && <span>{wTw}</span>}
      {statusIcon(status)}
      {countdown && <span className="text-muted-foreground"> {countdown}</span>}
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
  const countdown = conditionCountdown(nmCond, nm, now, status);

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
 * Mobile-only merged condition cell. Layout mirrors the bipartite mobile header
 * (「觸發怪｜NM條件」): left slot = 觸發怪 condition, right slot = NM condition.
 * When neither side has a condition, falls back to a single「—」.
 * Otherwise both slots render and the empty side shows「—」 as a placeholder
 * so users can tell which side a single-condition icon refers to.
 */
export function MergedConditionCellMobile({ nm, now }: Props) {
  const mob = nm.trigger?.mob;
  const nmCond = nm.trigger?.nm;

  if (!mob && !nmCond) {
    return <span className="block text-center text-xs text-muted-foreground">{EMPTY_LABEL}</span>;
  }

  const ctx = ctxOf(nm, now);

  function renderSegment(cond: NmCondition | undefined): JSX.Element {
    if (!cond) {
      return <span className="text-muted-foreground">{EMPTY_LABEL}</span>;
    }
    const status = computeConditionStatus(cond, ctx);
    return (
      <span className="inline-flex items-center gap-0.5">
        {cond.timeOfDay === 'night' && <span aria-label="夜間" className="text-sm leading-none">🌙</span>}
        {cond.timeOfDay === 'day' && <span aria-label="白天" className="text-sm leading-none">☀</span>}
        {cond.weather?.map(w => <span key={`m-${w}`}>{weatherIcon(w)}</span>)}
        {statusIcon(status)}
      </span>
    );
  }

  return (
    <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-xs">
      <span className="justify-self-center">{renderSegment(mob)}</span>
      <span className="text-muted-foreground">｜</span>
      <span className="justify-self-center">{renderSegment(nmCond)}</span>
    </span>
  );
}
