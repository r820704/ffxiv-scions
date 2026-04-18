import { toEorzeaTime, type EorzeaTime } from './eorzea-time';

const EORZEA_HOUR_MS = 175 * 1000;

export function isDayTime(et: EorzeaTime): boolean {
  return et.hours >= 6 && et.hours < 18;
}

export function getNextTransition(timestamp: number): number {
  const et = toEorzeaTime(timestamp);
  const currentHour = et.hours;
  const currentMin = et.minutes;
  const targetHour = isDayTime(et) ? 18 : (currentHour >= 18 ? 6 + 24 : 6);
  const hoursUntil = targetHour - currentHour;
  const minutesUntil = hoursUntil * 60 - currentMin;
  return Math.round(minutesUntil * (EORZEA_HOUR_MS / 60));
}
