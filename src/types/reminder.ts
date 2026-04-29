import type { EurekaZone } from '@/data/weather-data';

export type ReminderSource = 'm9-zone-hit' | 'm10-search' | 'm1-popover';

export interface Reminder {
  id: string;
  zone: EurekaZone;
  weather: string;          // English weather key, e.g. 'Gales'
  targetMs: number;         // Unix ms — cell start time
  recurring: boolean;
  source: ReminderSource;
  nmName?: string;          // optional, only for m10/m1 sources
  createdAt: number;
}

export const REMINDER_LEAD_MS = 90_000;
export const REMINDER_SOFT_CAP = 50;
export const REMINDER_STORAGE_KEY = 'eureka-weather-reminders';
export const REMINDER_PERMISSION_ASKED_KEY = 'eureka-weather-permission-asked';
export const REMINDER_BROADCAST_NAME = 'eureka-weather-reminders-bc';
