import type { EurekaZone } from '@/data/weather-data';

// Persisted record per NM. Missing entry = 未追蹤 (never been recorded).
export interface NmRecord {
  popAt: number;  // Unix ms of NM pop time
}

// localStorage keys (single source of truth)
export const NM_TRACKER_RECORDS_KEY = 'eureka-nm-tracker-records';
export const NM_TRACKER_PINNED_KEY = 'eureka-nm-tracker-pinned';
export const NM_TRACKER_LAST_TAB_KEY = 'eureka-nm-tracker-last-tab';
export const NM_TRACKER_NOTIFICATION_ENABLED_KEY = 'eureka-nm-tracker-notification-enabled';

// 2-hour CD per ffxiv-eureka.com convention.
export const NM_CD_MS = 2 * 60 * 60 * 1000;

// 5-minute "預備窗" threshold.
export const NM_SOON_THRESHOLD_MS = 5 * 60 * 1000;

// Row state machine output
export type NmRowState = 'green' | 'amber' | 'neutral';

// Condition status for chips / cells
export type ConditionStatus = 'met' | 'soon' | 'idle';

// Tab key: zone or 'custom'
export type NmTabKey = EurekaZone | 'custom';

export function isNmTabKey(value: unknown): value is NmTabKey {
  return value === 'Eureka Anemos' || value === 'Eureka Pagos'
      || value === 'Eureka Pyros' || value === 'Eureka Hydatos'
      || value === 'custom';
}

// URL search param ↔ NmTabKey mapping
const URL_TO_TAB: Record<string, NmTabKey> = {
  anemos: 'Eureka Anemos',
  pagos: 'Eureka Pagos',
  pyros: 'Eureka Pyros',
  hydatos: 'Eureka Hydatos',
  custom: 'custom',
};

const TAB_TO_URL: Record<NmTabKey, string> = {
  'Eureka Anemos': 'anemos',
  'Eureka Pagos': 'pagos',
  'Eureka Pyros': 'pyros',
  'Eureka Hydatos': 'hydatos',
  'custom': 'custom',
};

export function parseTabFromUrl(raw: string | null): NmTabKey | null {
  if (raw && URL_TO_TAB[raw]) return URL_TO_TAB[raw];
  return null;
}

export function tabToUrl(tab: NmTabKey): string {
  return TAB_TO_URL[tab];
}
