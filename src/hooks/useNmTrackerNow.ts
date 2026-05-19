import { useEffect, useState } from 'react';

export function useNmTrackerNow(): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    let intervalId: number | undefined;
    let visible = typeof document !== 'undefined' ? !document.hidden : true;

    function tick() {
      setNow(Date.now());
    }
    function start() {
      if (intervalId !== undefined) return;
      tick();
      intervalId = window.setInterval(tick, 1000);
    }
    function stop() {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    }
    function onVisibility() {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    }

    if (visible) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return now;
}
