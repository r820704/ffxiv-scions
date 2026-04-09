import { useState } from 'react';
import { getWeatherIconUrl } from '@/data/weather-icons';
import { getWeatherColor } from '@/utils/weather-colors';

interface WeatherIconProps {
  weatherEn: string;
  weatherTw: string;
  size?: number;
}

export default function WeatherIcon({ weatherEn, weatherTw, size = 24 }: WeatherIconProps) {
  const url = getWeatherIconUrl(weatherEn);
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <span
        className="inline-block w-3 h-3 rounded-full shrink-0"
        style={{ background: getWeatherColor(weatherTw) }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      className="inline-block shrink-0"
      src={url}
      alt={weatherTw}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
