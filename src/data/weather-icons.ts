// Weather → in-game icon ID mapping.
// Icon IDs come from the FFXIV Weather sheet (XIVAPI), and the file path on
// XIVAPI follows the pattern `/i/060000/0602XX.png` where XX is the icon ID.
//
// Some weathers used by the game's CN server (e.g. Atmospheric Phantasms,
// Illusory Disturbances on South Horn) are not present in XIVAPI yet — they
// fall through to `undefined` and the UI falls back to the colored dot.

const ICON_BASE = 'https://xivapi.com/i/060000';

const WEATHER_ICON_IDS: Record<string, number> = {
  'Clear Skies': 60201,
  'Fair Skies': 60202,
  'Clouds': 60203,
  'Fog': 60204,
  'Wind': 60205,
  'Gales': 60206,
  'Rain': 60207,
  'Showers': 60208,
  'Thunder': 60209,
  'Thunderstorms': 60210,
  'Dust Storms': 60211,
  'Heat Waves': 60214,
  'Snow': 60215,
  'Blizzards': 60216,
  'Gloom': 60218,
  'Umbral Wind': 60219,
  'Umbral Static': 60220,
  'Moon Dust': 60222,
  'Astromagnetic Storms': 60223,
};

export function getWeatherIconUrl(weatherEn: string): string | undefined {
  const id = WEATHER_ICON_IDS[weatherEn];
  if (id === undefined) return undefined;
  return `${ICON_BASE}/${id.toString().padStart(6, '0')}.png`;
}
