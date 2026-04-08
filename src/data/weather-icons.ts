// Weather → in-game icon mapping.
// Icons are bundled at build time from src/assets/weather-icons/, originally
// extracted from FFXIV via XIVAPI (file path 0/i/060000/0602XX.png).
// Vite resolves these imports to hashed asset URLs in the final bundle.

import icon060201 from '../assets/weather-icons/060201.png';
import icon060202 from '../assets/weather-icons/060202.png';
import icon060203 from '../assets/weather-icons/060203.png';
import icon060204 from '../assets/weather-icons/060204.png';
import icon060205 from '../assets/weather-icons/060205.png';
import icon060206 from '../assets/weather-icons/060206.png';
import icon060207 from '../assets/weather-icons/060207.png';
import icon060208 from '../assets/weather-icons/060208.png';
import icon060209 from '../assets/weather-icons/060209.png';
import icon060210 from '../assets/weather-icons/060210.png';
import icon060211 from '../assets/weather-icons/060211.png';
import icon060214 from '../assets/weather-icons/060214.png';
import icon060215 from '../assets/weather-icons/060215.png';
import icon060216 from '../assets/weather-icons/060216.png';
import icon060218 from '../assets/weather-icons/060218.png';
import icon060219 from '../assets/weather-icons/060219.png';
import icon060220 from '../assets/weather-icons/060220.png';
import icon060222 from '../assets/weather-icons/060222.png';
import icon060223 from '../assets/weather-icons/060223.png';
import icon060238 from '../assets/weather-icons/060238.png';
import icon060239 from '../assets/weather-icons/060239.png';

const WEATHER_ICONS: Record<string, string> = {
  'Clear Skies': icon060201,
  'Fair Skies': icon060202,
  'Clouds': icon060203,
  'Fog': icon060204,
  'Wind': icon060205,
  'Gales': icon060206,
  'Rain': icon060207,
  'Showers': icon060208,
  'Thunder': icon060209,
  'Thunderstorms': icon060210,
  'Dust Storms': icon060211,
  'Heat Waves': icon060214,
  'Snow': icon060215,
  'Blizzards': icon060216,
  'Gloom': icon060218,
  'Umbral Wind': icon060219,
  'Umbral Static': icon060220,
  'Moon Dust': icon060222,
  'Astromagnetic Storms': icon060223,
  'Atmospheric Phantasms': icon060238,
  'Illusory Disturbances': icon060239,
};

export function getWeatherIconUrl(weatherEn: string): string | undefined {
  return WEATHER_ICONS[weatherEn];
}
