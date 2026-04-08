import { useState } from 'react';
import { getWeatherIconUrl } from '../data/weather-icons';
import { getWeatherColor } from '../utils/weather-colors';
import styles from '../styles/App.module.css';

interface WeatherIconProps {
  weatherEn: string;
  weatherTw: string;
  size?: number;
}

// Renders the in-game weather icon (served by XIVAPI). Falls back to a
// colored dot when the icon is unavailable or fails to load (e.g. unsupported
// weathers like Atmospheric Phantasms, or offline XIVAPI).
export default function WeatherIcon({ weatherEn, weatherTw, size = 24 }: WeatherIconProps) {
  const url = getWeatherIconUrl(weatherEn);
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <span
        className={styles.weatherDot}
        style={{ background: getWeatherColor(weatherTw) }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      className={styles.weatherIcon}
      src={url}
      alt={weatherTw}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
