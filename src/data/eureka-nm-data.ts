import type { EurekaZone } from './weather-data';
import { weatherNamesTw } from './weather-data';
import { WEATHER_PERIOD_MS, toEorzeaTime } from '@/utils/eorzea-time';
import { isDayTime } from '@/utils/game-day-night';

export interface EurekaNm {
  id: string;
  nameTw: string;
  nameEn: string;
  zone: EurekaZone;
  level: number;
  // Absent = unconditional ("常駐") NM that may spawn at any weather/time.
  // Such NMs do not appear in cell badges (see getActiveNms).
  trigger?: {
    weather?: string[];
    timeOfDay?: 'day' | 'night';
  };
  // Community / shorthand names players use when searching.
  // e.g. ['Cassie', '奶妹凱西', 'CC']
  aliases?: string[];
}

// Weather- and/or time-triggered Eureka NMs.
// Spawn conditions cross-checked against ffxiv-eureka.com tracker 2.7.5.
// TC names looked up in thewakingsands/ffxiv-datamining-tc BNpcName.csv by EN row id.
export const eurekaNms: EurekaNm[] = [
  // Anemos
  {
    id: 'bombadeel',
    nameTw: '龐巴德',
    nameEn: 'Bombadeel',
    zone: 'Eureka Anemos',
    level: 10,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'white-rider',
    nameTw: '白騎士',
    nameEn: 'the White Rider',
    zone: 'Eureka Anemos',
    level: 13,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'fafnir',
    nameTw: '法夫納',
    nameEn: 'Fafnir',
    zone: 'Eureka Anemos',
    level: 17,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'lamashtu',
    nameTw: '拉瑪什圖',
    nameEn: 'Lamashtu',
    zone: 'Eureka Anemos',
    level: 19,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'pazuzu',
    nameTw: '帕祖祖',
    nameEn: 'Pazuzu',
    zone: 'Eureka Anemos',
    level: 20,
    trigger: { weather: ['Gales'], timeOfDay: 'night' },
  },
  // Pagos
  {
    id: 'taxim',
    nameTw: '塔克西姆',
    nameEn: 'Taxim',
    zone: 'Eureka Pagos',
    level: 21,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'king-arthro',
    nameTw: '亞瑟羅王',
    nameEn: 'King Arthro',
    zone: 'Eureka Pagos',
    level: 29,
    trigger: { weather: ['Fog'] },
  },
  {
    id: 'hadhayosh',
    nameTw: '哈達約什',
    nameEn: 'Hadhayosh',
    zone: 'Eureka Pagos',
    level: 32,
    trigger: { weather: ['Thunder'] },
  },
  {
    id: 'horus',
    nameTw: '荷魯斯',
    nameEn: 'Horus',
    zone: 'Eureka Pagos',
    level: 33,
    trigger: { weather: ['Heat Waves'] },
  },
  {
    id: 'copycat-cassie',
    nameTw: '複製魔花凱西',
    nameEn: 'Copycat Cassie',
    zone: 'Eureka Pagos',
    level: 35,
    trigger: { weather: ['Blizzards'] },
  },
  {
    id: 'louhi',
    nameTw: '婁希',
    nameEn: 'Louhi',
    zone: 'Eureka Pagos',
    level: 35,
    trigger: { timeOfDay: 'night' },
  },
  // Pyros
  {
    id: 'leucosia',
    nameTw: '琉科西亞',
    nameEn: 'Leucosia',
    zone: 'Eureka Pyros',
    level: 35,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'askalaphos',
    nameTw: '阿斯卡拉福斯',
    nameEn: 'Askalaphos',
    zone: 'Eureka Pyros',
    level: 39,
    trigger: { weather: ['Umbral Wind'] },
  },
  {
    id: 'grand-duke-batym',
    nameTw: '巴欽大公爵',
    nameEn: 'Grand Duke Batym',
    zone: 'Eureka Pyros',
    level: 40,
    trigger: { timeOfDay: 'night' },
  },
  {
    id: 'dux',
    nameTw: '閃電督軍',
    nameEn: 'Dux',
    zone: 'Eureka Pyros',
    level: 46,
    trigger: { weather: ['Thunder'] },
  },
  {
    id: 'skoll',
    nameTw: '斯庫爾',
    nameEn: 'Skoll',
    zone: 'Eureka Pyros',
    level: 50,
    trigger: { weather: ['Blizzards'] },
  },
  {
    id: 'penthesilea',
    nameTw: '彭忒西勒亞',
    nameEn: 'Penthesilea',
    zone: 'Eureka Pyros',
    level: 50,
    trigger: { weather: ['Heat Waves'] },
  },
  // Hydatos
  {
    id: 'king-goldemar',
    nameTw: '戈爾德馬爾王',
    nameEn: 'King Goldemar',
    zone: 'Eureka Hydatos',
    level: 56,
    trigger: { timeOfDay: 'night' },
  },
];

export function getActiveNms(
  zone: EurekaZone,
  weather: string,
  isDay: boolean,
): EurekaNm[] {
  return eurekaNms.filter((nm) => {
    if (nm.zone !== zone) return false;
    if (!nm.trigger) return false; // unconditional NMs never appear in cell badges
    const { weather: ws, timeOfDay } = nm.trigger;
    if (!ws && !timeOfDay) return false;
    if (ws && !ws.includes(weather)) return false;
    if (timeOfDay === 'day' && !isDay) return false;
    if (timeOfDay === 'night' && isDay) return false;
    return true;
  });
}

// For the "current" cell (idx 0), pass realNow so day/night is decided by the
// player's actual ET clock instead of the period midpoint. Without realNow,
// behaviour matches getActiveNms with the midpoint heuristic — appropriate for
// future cells where there is no real "now".
// Sentinel string used in `selected` Set<string> to represent the "night-only"
// pseudo-filter chip. It is never a real weather name, so existing weather
// matching logic ignores it; ZoneWeatherRow checks for it explicitly.
export const NIGHT_FILTER_KEY = '__night__';

export function getNmTriggeringWeathers(): string[] {
  const set = new Set<string>();
  for (const nm of eurekaNms) {
    if (nm.trigger?.weather) {
      for (const w of nm.trigger.weather) set.add(w);
    }
  }
  return [...set].sort();
}

export function getActiveNmsAt(
  zone: EurekaZone,
  weather: string,
  periodStart: number,
  realNow?: number,
): EurekaNm[] {
  const reference = realNow ?? periodStart + WEATHER_PERIOD_MS / 2;
  const isDay = isDayTime(toEorzeaTime(reference));
  return getActiveNms(zone, weather, isDay);
}

export function formatNmTrigger(nm: EurekaNm): string {
  if (!nm.trigger) return '常駐';
  const parts: string[] = [];
  const ws = nm.trigger.weather;
  if (ws && ws.length > 0) {
    parts.push(ws.map((w) => weatherNamesTw[w] ?? w).join('/'));
  }
  if (nm.trigger.timeOfDay === 'night') parts.push('夜間');
  if (nm.trigger.timeOfDay === 'day') parts.push('白天');
  return parts.join('+') || '常駐';
}
