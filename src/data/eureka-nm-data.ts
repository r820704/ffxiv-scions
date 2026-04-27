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

// Eureka NMs across all 4 zones (Anemos / Pagos / Pyros / Hydatos).
// Sources:
//   - Spawn weather conditions: snorux/EurekaHelper (XIV/Zones/*.cs, weather1 field)
//   - Time-of-day conditions for night-only NMs: original research, ffxiv-eureka.com tracker
//   - TC names: thewakingsands/ffxiv-datamining-tc BNpcName.csv (matched by phonetic / Chinese readings)
// NMs without `trigger` are 常駐 (unconditional): they may spawn at any weather/time
// once chain conditions are met. They do NOT appear in cell badges (see getActiveNms).
export const eurekaNms: EurekaNm[] = [
  // ===== Anemos (Lv 1-20) =====
  { id: 'sabotender-corrido', nameTw: '寇里多仙人掌怪', nameEn: 'Sabotender Corrido', zone: 'Eureka Anemos', level: 1, aliases: ['Sabo'] },
  { id: 'lord-of-anemos', nameTw: '常風領主', nameEn: 'the Lord of Anemos', zone: 'Eureka Anemos', level: 2, aliases: ['Lord'] },
  { id: 'teles', nameTw: '忒勒斯', nameEn: 'Teles', zone: 'Eureka Anemos', level: 3 },
  { id: 'emperor-of-anemos', nameTw: '常風皇帝', nameEn: 'the Emperor of Anemos', zone: 'Eureka Anemos', level: 4, aliases: ['Emperor'] },
  { id: 'callisto', nameTw: '卡利斯托', nameEn: 'Callisto', zone: 'Eureka Anemos', level: 5 },
  { id: 'number', nameTw: '群偶', nameEn: 'Number', zone: 'Eureka Anemos', level: 6 },
  { id: 'jahannam', nameTw: '哲罕南', nameEn: 'Jahannam', zone: 'Eureka Anemos', level: 7, aliases: ['Jaha'] },
  { id: 'amemet', nameTw: '阿米特', nameEn: 'Amemet', zone: 'Eureka Anemos', level: 8 },
  { id: 'caym', nameTw: '蓋因', nameEn: 'Caym', zone: 'Eureka Anemos', level: 9 },
  { id: 'bombadeel', nameTw: '龐巴德', nameEn: 'Bombadeel', zone: 'Eureka Anemos', level: 10, aliases: ['Bomba'], trigger: { timeOfDay: 'night' } },
  { id: 'serket', nameTw: '塞爾凱特', nameEn: 'Serket', zone: 'Eureka Anemos', level: 11 },
  { id: 'judgmental-julika', nameTw: '武斷魔花茱莉卡', nameEn: 'Judgmental Julika', zone: 'Eureka Anemos', level: 12, aliases: ['Julika'] },
  { id: 'white-rider', nameTw: '白騎士', nameEn: 'the White Rider', zone: 'Eureka Anemos', level: 13, aliases: ['Rider'], trigger: { timeOfDay: 'night' } },
  { id: 'polyphemus', nameTw: '波呂斐摩斯', nameEn: 'Polyphemus', zone: 'Eureka Anemos', level: 14, aliases: ['Poly'] },
  { id: 'simurghs-strider', nameTw: '闊步西牟鳥', nameEn: "Simurgh's Strider", zone: 'Eureka Anemos', level: 15, aliases: ['Strider'] },
  { id: 'king-hazmat', nameTw: '極其危險物質', nameEn: 'King Hazmat', zone: 'Eureka Anemos', level: 16, aliases: ['Hazmat'] },
  { id: 'fafnir', nameTw: '法夫納', nameEn: 'Fafnir', zone: 'Eureka Anemos', level: 17, trigger: { timeOfDay: 'night' } },
  { id: 'amarok', nameTw: '阿瑪洛克', nameEn: 'Amarok', zone: 'Eureka Anemos', level: 18 },
  { id: 'lamashtu', nameTw: '拉瑪什圖', nameEn: 'Lamashtu', zone: 'Eureka Anemos', level: 19, trigger: { timeOfDay: 'night' } },
  { id: 'pazuzu', nameTw: '帕祖祖', nameEn: 'Pazuzu', zone: 'Eureka Anemos', level: 20, aliases: ['Paz'], trigger: { weather: ['Gales'], timeOfDay: 'night' } },

  // ===== Pagos (Lv 20-35) =====
  { id: 'snow-queen', nameTw: '雪之女王', nameEn: 'the Snow Queen', zone: 'Eureka Pagos', level: 20, aliases: ['Queen'] },
  { id: 'taxim', nameTw: '塔克西姆', nameEn: 'Taxim', zone: 'Eureka Pagos', level: 22, trigger: { timeOfDay: 'night' } },
  { id: 'ash-dragon', nameTw: '灰燼龍', nameEn: 'Ash Dragon', zone: 'Eureka Pagos', level: 23, aliases: ['Dragon'] },
  { id: 'glavoid', nameTw: 'Glavoid', nameEn: 'Glavoid', zone: 'Eureka Pagos', level: 24 },
  { id: 'anapos', nameTw: '安娜波', nameEn: 'Anapos', zone: 'Eureka Pagos', level: 25 },
  { id: 'hakutaku', nameTw: '白澤', nameEn: 'Hakutaku', zone: 'Eureka Pagos', level: 26, aliases: ['Haku'] },
  { id: 'king-igloo', nameTw: '雪屋王', nameEn: 'King Igloo', zone: 'Eureka Pagos', level: 27, aliases: ['Igloo'] },
  { id: 'asag', nameTw: '阿薩格', nameEn: 'Asag', zone: 'Eureka Pagos', level: 28 },
  { id: 'surabhi', nameTw: '蘇羅毗', nameEn: 'Surabhi', zone: 'Eureka Pagos', level: 29 },
  { id: 'king-arthro', nameTw: '亞瑟羅王', nameEn: 'King Arthro', zone: 'Eureka Pagos', level: 30, aliases: ['Arthro'], trigger: { weather: ['Fog'] } },
  { id: 'mindertaur-eldertaur', nameTw: '牛頭魔長老／看守', nameEn: 'Mindertaur/Eldertaur', zone: 'Eureka Pagos', level: 31, aliases: ['Brothers'] },
  { id: 'holy-cow', nameTw: '優雷卡聖牛', nameEn: 'Holy Cow', zone: 'Eureka Pagos', level: 32 },
  { id: 'hadhayosh', nameTw: '哈達約什', nameEn: 'Hadhayosh', zone: 'Eureka Pagos', level: 33, aliases: ['Behe'], trigger: { weather: ['Thunder'] } },
  { id: 'horus', nameTw: '荷魯斯', nameEn: 'Horus', zone: 'Eureka Pagos', level: 34, trigger: { weather: ['Heat Waves'] } },
  { id: 'arch-angra-mainyu', nameTw: '總領安格拉·曼紐', nameEn: 'Arch Angra Mainyu', zone: 'Eureka Pagos', level: 35, aliases: ['Mainyu'] },
  { id: 'copycat-cassie', nameTw: '複製魔花凱西', nameEn: 'Copycat Cassie', zone: 'Eureka Pagos', level: 36, aliases: ['Cassie', 'CC'], trigger: { weather: ['Blizzards'] } },
  { id: 'louhi', nameTw: '婁希', nameEn: 'Louhi', zone: 'Eureka Pagos', level: 37, trigger: { timeOfDay: 'night' } },

  // ===== Pyros (Lv 35-50) =====
  { id: 'leucosia', nameTw: '琉科西亞', nameEn: 'Leucosia', zone: 'Eureka Pyros', level: 38, trigger: { timeOfDay: 'night' } },
  { id: 'flauros', nameTw: '佛勞洛斯', nameEn: 'Flauros', zone: 'Eureka Pyros', level: 39 },
  { id: 'sophist', nameTw: '詭辯者', nameEn: 'the Sophist', zone: 'Eureka Pyros', level: 40, aliases: ['Sophist'] },
  { id: 'graffiacane', nameTw: '格拉菲亞卡內', nameEn: 'Graffiacane', zone: 'Eureka Pyros', level: 41, aliases: ['Doll'] },
  { id: 'askalaphos', nameTw: '阿斯卡拉福斯', nameEn: 'Askalaphos', zone: 'Eureka Pyros', level: 42, aliases: ['Owl'], trigger: { weather: ['Umbral Wind'] } },
  { id: 'grand-duke-batym', nameTw: '巴欽大公爵', nameEn: 'Grand Duke Batym', zone: 'Eureka Pyros', level: 43, aliases: ['Batym'], trigger: { timeOfDay: 'night' } },
  { id: 'aetolus', nameTw: '艾托洛斯', nameEn: 'Aetolus', zone: 'Eureka Pyros', level: 44 },
  { id: 'lesath', nameTw: '來薩特', nameEn: 'Lesath', zone: 'Eureka Pyros', level: 45 },
  { id: 'eldthurs', nameTw: '火巨人艾爾德塞斯', nameEn: 'Eldthurs', zone: 'Eureka Pyros', level: 46 },
  { id: 'iris', nameTw: '伊麗絲', nameEn: 'Iris', zone: 'Eureka Pyros', level: 47 },
  { id: 'lamebrix-strikebocks', nameTw: '傭兵雷姆普里克斯', nameEn: 'Lamebrix Strikebocks', zone: 'Eureka Pyros', level: 48, aliases: ['Lamebrix'] },
  { id: 'dux', nameTw: '閃電督軍', nameEn: 'Dux', zone: 'Eureka Pyros', level: 49, trigger: { weather: ['Thunder'] } },
  { id: 'lumber-jack', nameTw: '樵夫傑科', nameEn: 'Lumber Jack', zone: 'Eureka Pyros', level: 50, aliases: ['Jack'] },
  { id: 'glaukopis', nameTw: '明眸', nameEn: 'Glaukopis', zone: 'Eureka Pyros', level: 51 },
  { id: 'ying-yang', nameTw: '陰·陽', nameEn: 'Ying-Yang', zone: 'Eureka Pyros', level: 52, aliases: ['YY'] },
  { id: 'skoll', nameTw: '斯庫爾', nameEn: 'Skoll', zone: 'Eureka Pyros', level: 53, trigger: { weather: ['Blizzards'] } },
  { id: 'penthesilea', nameTw: '彭忒西勒亞', nameEn: 'Penthesilea', zone: 'Eureka Pyros', level: 54, aliases: ['Penny'], trigger: { weather: ['Heat Waves'] } },

  // ===== Hydatos (Lv 50-60) =====
  { id: 'khalamari', nameTw: '卡拉墨魚', nameEn: 'Khalamari', zone: 'Eureka Hydatos', level: 55 },
  { id: 'stegodon', nameTw: '劍齒象', nameEn: 'Stegodon', zone: 'Eureka Hydatos', level: 56 },
  { id: 'molech', nameTw: '摩洛', nameEn: 'Molech', zone: 'Eureka Hydatos', level: 57 },
  { id: 'piasa', nameTw: '皮艾薩邪鳥', nameEn: 'Piasa', zone: 'Eureka Hydatos', level: 58 },
  { id: 'frostmane', nameTw: '霜鬃獵魔', nameEn: 'Frostmane', zone: 'Eureka Hydatos', level: 59 },
  { id: 'daphne', nameTw: '達佛涅', nameEn: 'Daphne', zone: 'Eureka Hydatos', level: 60 },
  { id: 'king-goldemar', nameTw: '戈爾德馬爾王', nameEn: 'King Goldemar', zone: 'Eureka Hydatos', level: 61, aliases: ['Golde'], trigger: { timeOfDay: 'night' } },
  { id: 'leuke', nameTw: '琉刻', nameEn: 'Leuke', zone: 'Eureka Hydatos', level: 62 },
  { id: 'barong', nameTw: '巴龍', nameEn: 'Barong', zone: 'Eureka Hydatos', level: 63 },
  { id: 'ceto', nameTw: '刻托', nameEn: 'Ceto', zone: 'Eureka Hydatos', level: 64 },
  { id: 'provenance-watcher', nameTw: '起源守望者', nameEn: 'Provenance Watcher', zone: 'Eureka Hydatos', level: 65, aliases: ['PW'] },
  { id: 'ovni', nameTw: '未確認飛行物體', nameEn: 'Ovni', zone: 'Eureka Hydatos', level: 65, aliases: ['UFO'] },
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
