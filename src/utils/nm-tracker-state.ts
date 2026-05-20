import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRowState, ConditionStatus } from '@/types/nm-tracker';
import { NM_CD_MS, NM_SOON_THRESHOLD_MS } from '@/types/nm-tracker';

export interface StateCtx {
  isNight: boolean;
  isWeather: (w: string) => boolean;
  minutesToWeather: (w: string) => number;
}

interface NmCondition {
  weather?: string[];
  timeOfDay?: 'day' | 'night';
}

// — primitives —

export function cdRemainMs(popAt: number | undefined, now: number): number | null {
  if (popAt == null) return null;
  return Math.max(0, popAt + NM_CD_MS - now);
}

export function isCdReady(popAt: number | undefined, now: number): boolean {
  if (popAt == null) return true;
  return now >= popAt + NM_CD_MS;
}

function matchesCondition(cond: NmCondition, ctx: StateCtx): boolean {
  if (cond.timeOfDay === 'night' && !ctx.isNight) return false;
  if (cond.timeOfDay === 'day' && ctx.isNight) return false;
  if (cond.weather && cond.weather.length > 0) {
    if (!cond.weather.some(w => ctx.isWeather(w))) return false;
  }
  return true;
}

export function isMobConditionMet(nm: EurekaNm, ctx: StateCtx): boolean {
  const mob = nm.trigger?.mob;
  if (!mob) return true;
  return matchesCondition(mob, ctx);
}

export function isNmConditionMet(nm: EurekaNm, ctx: StateCtx): boolean {
  const nmCond = nm.trigger?.nm;
  if (!nmCond) return true;
  return matchesCondition(nmCond, ctx);
}

export function isNmConditionSoon(nm: EurekaNm, ctx: StateCtx): boolean {
  const nmCond = nm.trigger?.nm;
  if (!nmCond) return false;
  if (nmCond.weather && nmCond.weather.length > 0) {
    const minToAny = Math.min(...nmCond.weather.map(w => ctx.minutesToWeather(w)));
    return minToAny > 0 && minToAny <= NM_SOON_THRESHOLD_MS / 60_000;
  }
  return false;
}

// — public state machine —

export function computeConditionStatus(cond: NmCondition, ctx: StateCtx): ConditionStatus {
  if (matchesCondition(cond, ctx)) return 'met';
  if (cond.weather && cond.weather.length > 0) {
    const minToAny = Math.min(...cond.weather.map(w => ctx.minutesToWeather(w)));
    const thresholdMin = NM_SOON_THRESHOLD_MS / 60_000;
    if (minToAny > 0 && minToAny <= thresholdMin) return 'soon';
    if (Number.isFinite(minToAny) && minToAny > thresholdMin) return 'distant';
  }
  return 'idle';
}

export function computeRowState(
  nm: EurekaNm,
  record: { popAt: number | undefined },
  now: number,
  ctx?: StateCtx,
): NmRowState {
  const isUnconditional = nm.trigger == null;
  const cdReady = isCdReady(record.popAt, now);
  const wasTracked = record.popAt != null;

  if (isUnconditional) {
    return (wasTracked && cdReady) ? 'green' : 'neutral';
  }
  if (!ctx) return 'neutral';
  if (!cdReady) return 'neutral';
  if (isMobConditionMet(nm, ctx) && isNmConditionMet(nm, ctx)) return 'green';
  if (isMobConditionMet(nm, ctx) && isNmConditionSoon(nm, ctx)) return 'amber';
  return 'neutral';
}
