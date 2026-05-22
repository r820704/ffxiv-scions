import { useState, useCallback, useEffect } from 'react';
import { NM_TRACKER_PINNED_KEY } from '@/types/nm-tracker';

function readStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(NM_TRACKER_PINNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(value: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NM_TRACKER_PINNED_KEY, JSON.stringify(value));
  } catch {
    // silent fail for MVP
  }
}

export function useNmTrackerPinned() {
  const [pinned, setPinned] = useState<string[]>(readStorage);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === NM_TRACKER_PINNED_KEY) setPinned(readStorage());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((nmId: string) => {
    setPinned(prev => {
      const next = prev.includes(nmId) ? prev.filter(id => id !== nmId) : [...prev, nmId];
      writeStorage(next);
      return next;
    });
  }, []);

  const isPinned = useCallback((nmId: string) => pinned.includes(nmId), [pinned]);

  return { pinned, toggle, isPinned };
}
