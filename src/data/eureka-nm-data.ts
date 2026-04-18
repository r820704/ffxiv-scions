import type { EurekaZone } from './weather-data';

export interface EurekaNm {
  id: string;
  nameTw: string;
  nameEn: string;
  zone: EurekaZone;
  level: number;
  trigger: {
    weather?: string[];
    timeOfDay?: 'day' | 'night';
    note?: string;
  };
}

// Representative weather-conditional Eureka NMs.
// TC names: cross-checked against thewakingsands/ffxiv-datamining-tc BNpcName.csv.
export const eurekaNms: EurekaNm[] = [
  {
    id: 'pazuzu',
    nameTw: '帕祖祖',
    nameEn: 'Pazuzu',
    zone: 'Eureka Anemos',
    level: 20,
    trigger: { weather: ['Gales'], note: '需擊殺前置 風沙鳥人' },
  },
  {
    id: 'caym',
    nameTw: '蓋因',
    nameEn: 'Caym',
    zone: 'Eureka Anemos',
    level: 19,
    trigger: { weather: ['Fair Skies'] },
  },
  {
    id: 'louhi',
    nameTw: '婁希',
    nameEn: 'Louhi',
    zone: 'Eureka Pagos',
    level: 35,
    trigger: { weather: ['Blizzards'] },
  },
  {
    id: 'cassie',
    nameTw: '複製魔花凱西',
    nameEn: 'Cassie',
    zone: 'Eureka Pagos',
    level: 27,
    trigger: { weather: ['Fog'] },
  },
  {
    id: 'penthesilea',
    nameTw: '彭忒西勒亞',
    nameEn: 'Penthesilea',
    zone: 'Eureka Pyros',
    level: 50,
    trigger: { weather: ['Heat Waves'] },
  },
  {
    id: 'skoll',
    nameTw: '斯庫爾',
    nameEn: 'Skoll',
    zone: 'Eureka Pyros',
    level: 35,
    trigger: { weather: ['Blizzards'] },
  },
  {
    id: 'tristitia',
    nameTw: '傷悲光靈魟',
    nameEn: 'Tristitia',
    zone: 'Eureka Hydatos',
    level: 60,
    trigger: { weather: ['Fair Skies'], note: '擊殺 水神艾勒什基伽勒 後開放' },
  },
  {
    id: 'provenance-watcher',
    nameTw: '起源守望者',
    nameEn: 'Provenance Watcher',
    zone: 'Eureka Hydatos',
    level: 60,
    trigger: { weather: ['Fair Skies'] },
  },
];

export function getNmsForZoneAndWeather(zone: EurekaZone, weather: string): EurekaNm[] {
  return eurekaNms.filter((nm) => {
    if (nm.zone !== zone) return false;
    if (!nm.trigger.weather || nm.trigger.weather.length === 0) return false;
    return nm.trigger.weather.includes(weather);
  });
}
