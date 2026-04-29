import type { Reminder } from '@/types/reminder';
import { weatherNamesTw, zoneNamesTw, type EurekaZone } from '@/data/weather-data';
import { generateForecasts } from './weather-engine';

const NEXT_OCCURRENCE_HORIZON = 600;

export function isNotificationSupported(): boolean {
  return typeof globalThis !== 'undefined' && 'Notification' in globalThis;
}

export function formatLocalHHMM(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function buildFocusHash(reminder: Reminder, cellBaseMs: number): string {
  const cellIndex = Math.max(
    0,
    Math.round((reminder.targetMs - cellBaseMs) / (8 * 175 * 1000)),
  );
  const focus = `focus=${reminder.zone}:${cellIndex}`;
  return `#/eureka-weather?${focus}`;
}

export interface BuiltNotification {
  title: string;
  body: string;
  tag: string;
}

export function buildNotification(
  reminder: Reminder,
  activeNms: readonly string[],
): BuiltNotification {
  const zoneTw = zoneNamesTw[reminder.zone] ?? reminder.zone;
  const weatherTw = weatherNamesTw[reminder.weather] ?? reminder.weather;
  const hhmm = formatLocalHHMM(reminder.targetMs);

  const title = reminder.nmName
    ? `${reminder.nmName} 即將出現`
    : `${weatherTw} · ${zoneTw}`;

  let body = `1 分鐘後開始（${hhmm}）`;
  if (!reminder.nmName && activeNms.length > 0) {
    const head = activeNms.slice(0, 2).join(' / ');
    const suffix = activeNms.length > 2 ? ` 等 ${activeNms.length} 隻` : '';
    body += ` · 可能 NM：${head}${suffix}`;
  }

  return { title, body, tag: reminder.id };
}

export function computeNextOccurrence(
  zone: EurekaZone,
  weather: string,
  fromMs: number,
): number | null {
  const forecasts = generateForecasts(zone, NEXT_OCCURRENCE_HORIZON, fromMs);
  for (const f of forecasts) {
    if (f.weather === weather && f.startTime > fromMs) {
      return f.startTime;
    }
  }
  return null;
}
