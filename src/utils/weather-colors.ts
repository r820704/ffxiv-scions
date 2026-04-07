// Weather color mapping for visual identification.
// Keys are TC weather names (matches values in weatherNamesTw).

const WEATHER_COLOR_MAP: Record<string, string> = {
  碧空: '#ffd166',
  晴朗: '#ffd166',
  陰雲: '#adb5bd',
  薄霧: '#adb5bd',
  小雨: '#4cc9f0',
  暴雨: '#4cc9f0',
  打雷: '#b5179e',
  雷雨: '#b5179e',
  微風: '#90e0ef',
  強風: '#90e0ef',
  小雪: '#e0fbfc',
  暴雪: '#e0fbfc',
  揚沙: '#f4a261',
  熱浪: '#f4a261',
  妖霧: '#6f42c1',
};

const DEFAULT_WEATHER_COLOR = '#7a8ba8';

export function getWeatherColor(weatherTw: string): string {
  return WEATHER_COLOR_MAP[weatherTw] ?? DEFAULT_WEATHER_COLOR;
}
