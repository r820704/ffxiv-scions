// Weather → in-game icon mapping (Eureka weathers only).
// Icons are bundled at build time from src/assets/weather-icons/, originally
// extracted from FFXIV via XIVAPI (file path 0/i/060000/0602XX.png).

import icon060202 from '../assets/weather-icons/060202.png';
import icon060204 from '../assets/weather-icons/060204.png';
import icon060206 from '../assets/weather-icons/060206.png';
import icon060208 from '../assets/weather-icons/060208.png';
import icon060209 from '../assets/weather-icons/060209.png';
import icon060210 from '../assets/weather-icons/060210.png';
import icon060214 from '../assets/weather-icons/060214.png';
import icon060215 from '../assets/weather-icons/060215.png';
import icon060216 from '../assets/weather-icons/060216.png';
import icon060218 from '../assets/weather-icons/060218.png';
import icon060219 from '../assets/weather-icons/060219.png';

const WEATHER_ICONS: Record<string, string> = {
  'Fair Skies': icon060202,
  'Fog': icon060204,
  'Gales': icon060206,
  'Showers': icon060208,
  'Thunder': icon060209,
  'Thunderstorms': icon060210,
  'Heat Waves': icon060214,
  'Snow': icon060215,
  'Blizzards': icon060216,
  'Gloom': icon060218,
  'Umbral Wind': icon060219,
};

export function getWeatherIconUrl(weatherEn: string): string | undefined {
  return WEATHER_ICONS[weatherEn];
}
