export type Zone = string;
export type WeatherName = string;

export type WeatherRateEntry = WeatherName | number;

export interface ZoneGroup {
  label: string;
  zones: Zone[];
}
