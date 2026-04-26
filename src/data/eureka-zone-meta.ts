import type { EurekaZone } from './weather-data';

export interface ZoneMeta {
  levelMin: number;
  levelMax: number;
}

export const ZONE_META: Record<EurekaZone, ZoneMeta> = {
  'Eureka Anemos': { levelMin: 1, levelMax: 20 },
  'Eureka Pagos': { levelMin: 20, levelMax: 35 },
  'Eureka Pyros': { levelMin: 35, levelMax: 50 },
  'Eureka Hydatos': { levelMin: 50, levelMax: 60 },
};

export function getZoneLevelLabel(zone: EurekaZone): string {
  const meta = ZONE_META[zone];
  return `Lv ${meta.levelMin}–${meta.levelMax}`;
}
