import { useCallback, useState } from 'react';
import type { JobId } from '../data/eureka-armor-sets';

const STORAGE_KEY = 'eureka-gear-main-jobs';

function load(): JobId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is JobId => typeof x === 'string');
  } catch {
    return [];
  }
}

export function useMainJobs() {
  const [mainJobs, setMainJobsState] = useState<JobId[]>(load);

  const setMainJobs = useCallback((next: JobId[]) => {
    setMainJobsState(next);
    if (typeof window !== 'undefined') {
      if (next.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    }
  }, []);

  return { mainJobs, setMainJobs };
}
