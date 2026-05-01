import { useCallback, useState } from 'react';
import type { AnyJobId } from '../data/eureka-armor-sets';

const STORAGE_KEY = 'eureka-gear-main-jobs';
const ACTIVE_KEY = 'eureka-gear-main-jobs-active';

function load(): AnyJobId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is AnyJobId => typeof x === 'string');
  } catch {
    return [];
  }
}

function loadActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ACTIVE_KEY) === '1';
}

export function useMainJobs() {
  const [mainJobs, setMainJobsState] = useState<AnyJobId[]>(load);
  const [mainJobsActive, setMainJobsActiveState] = useState<boolean>(loadActive);

  const setMainJobs = useCallback((next: AnyJobId[]) => {
    setMainJobsState(next);
    if (typeof window !== 'undefined') {
      if (next.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    }
  }, []);

  const setMainJobsActive = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setMainJobsActiveState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      if (typeof window !== 'undefined') {
        if (value) localStorage.setItem(ACTIVE_KEY, '1');
        else localStorage.removeItem(ACTIVE_KEY);
      }
      return value;
    });
  }, []);

  return { mainJobs, setMainJobs, mainJobsActive, setMainJobsActive };
}
