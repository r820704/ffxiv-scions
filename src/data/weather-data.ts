import type { WeatherRateEntry } from '../types/weather';

// Eureka-only weather rate tables (from SaintCoinach / asvel/ffxiv-weather)
export const weatherRates: Record<string, WeatherRateEntry[]> = {
  'Eureka Anemos': ['Fair Skies', 30, 'Gales', 60, 'Showers', 90, 'Snow'],
  'Eureka Pagos': ['Fair Skies', 10, 'Fog', 28, 'Heat Waves', 46, 'Snow', 64, 'Thunder', 82, 'Blizzards'],
  'Eureka Pyros': ['Fair Skies', 10, 'Heat Waves', 28, 'Thunder', 46, 'Blizzards', 64, 'Umbral Wind', 82, 'Snow'],
  'Eureka Hydatos': ['Fair Skies', 12, 'Showers', 34, 'Gloom', 56, 'Thunderstorms', 78, 'Snow'],
};

// Weathers that appear across the 4 Eureka zones
export const weatherNamesTw: Record<string, string> = {
  'Fair Skies': '晴朗',
  'Gales': '強風',
  'Showers': '暴雨',
  'Snow': '小雪',
  'Fog': '薄霧',
  'Heat Waves': '熱浪',
  'Thunder': '打雷',
  'Blizzards': '暴雪',
  'Umbral Wind': '靈風',
  'Gloom': '妖霧',
  'Thunderstorms': '雷雨',
};

export const zoneNamesTw: Record<string, string> = {
  'Eureka Anemos': '優雷卡常風之地',
  'Eureka Pagos': '優雷卡恆冰之地',
  'Eureka Pyros': '優雷卡湧火之地',
  'Eureka Hydatos': '優雷卡豐水之地',
};

export const zoneShortNamesTw: Record<string, string> = {
  'Eureka Anemos': '常風之地',
  'Eureka Pagos': '恆冰之地',
  'Eureka Pyros': '湧火之地',
  'Eureka Hydatos': '豐水之地',
};

export const EUREKA_ZONES = ['Eureka Anemos', 'Eureka Pagos', 'Eureka Pyros', 'Eureka Hydatos'] as const;
export type EurekaZone = typeof EUREKA_ZONES[number];

export function getZoneWeathers(zone: string): string[] {
  const rates = weatherRates[zone];
  if (!rates) return [];
  return [...new Set(rates.filter((v): v is string => typeof v === 'string'))];
}
