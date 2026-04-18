import { useState, useCallback } from 'react';

export type CalcMode = 'album' | 'slots';

const STORAGE_KEY = 'eureka-calc-mode';

function loadMode(): CalcMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'album' || raw === 'slots') return raw;
    return 'album';
  } catch {
    return 'album';
  }
}

export function useCalcMode() {
  const [calcMode, setCalcModeState] = useState<CalcMode>(loadMode);

  const setCalcMode = useCallback((mode: CalcMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    setCalcModeState(mode);
  }, []);

  return { calcMode, setCalcMode };
}
