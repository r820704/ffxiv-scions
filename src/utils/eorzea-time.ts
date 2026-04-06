// 1 Eorzea hour = 175 real seconds
const EORZEA_HOUR_MS = 175 * 1000;

// 1 weather period = 8 Eorzea hours = 1400 real seconds
export const WEATHER_PERIOD_MS = 8 * EORZEA_HOUR_MS;

// Eorzea time multiplier: 3600/175 ≈ 20.571
const EORZEA_MULTIPLIER = 3600 / 175;

export interface EorzeaTime {
  hours: number;
  minutes: number;
}

export function toEorzeaTime(timestamp: number): EorzeaTime {
  const eorzeaMs = timestamp * EORZEA_MULTIPLIER;
  const totalSeconds = Math.floor(eorzeaMs / 1000);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  return { hours, minutes };
}

export function formatEorzeaTime(et: EorzeaTime): string {
  return `${String(et.hours).padStart(2, '0')}:${String(et.minutes).padStart(2, '0')}`;
}

// Get the start timestamp of the weather period containing the given timestamp
export function getWeatherPeriodStart(timestamp: number): number {
  return Math.floor(timestamp / WEATHER_PERIOD_MS) * WEATHER_PERIOD_MS;
}

export function formatLocalTime(timestamp: number): string {
  const d = new Date(timestamp);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}
