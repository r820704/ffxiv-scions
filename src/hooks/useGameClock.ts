import { useEffect, useState } from 'react';
import { toEorzeaTime, formatEorzeaTime } from '@/utils/eorzea-time';
import { isDayTime, getNextTransition } from '@/utils/game-day-night';

export function useGameClock() {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const eorzeaTime = toEorzeaTime(now);
  return {
    now,
    eorzeaTime,
    eorzeaClock: formatEorzeaTime(eorzeaTime),
    isDay: isDayTime(eorzeaTime),
    msUntilTransition: getNextTransition(now),
  };
}
