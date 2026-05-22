import { useState, useCallback, useEffect } from 'react';
import { NM_TRACKER_RECORDS_KEY, type NmRecord } from '@/types/nm-tracker';

type Records = Record<string, NmRecord>;

function readStorage(): Records {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(NM_TRACKER_RECORDS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Records;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(value: Records): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NM_TRACKER_RECORDS_KEY, JSON.stringify(value));
  } catch {
    // quota errors — silent fail for MVP
  }
}

export function useNmTrackerRecords() {
  const [records, setRecords] = useState<Records>(readStorage);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === NM_TRACKER_RECORDS_KEY) {
        setRecords(readStorage());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPop = useCallback((nmId: string) => {
    setRecords(prev => {
      const next = { ...prev, [nmId]: { popAt: Date.now() } };
      writeStorage(next);
      return next;
    });
  }, []);

  const setCustom = useCallback((nmId: string, popAt: number) => {
    setRecords(prev => {
      const next = { ...prev, [nmId]: { popAt } };
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback((nmId: string) => {
    setRecords(prev => {
      const next = { ...prev };
      delete next[nmId];
      writeStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecords({});
    writeStorage({});
  }, []);

  return { records, setPop, setCustom, clear, clearAll };
}
