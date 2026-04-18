import { useState, useCallback } from 'react';

const STORAGE_KEY = 'eureka-recent-skills';
const MAX_ENTRIES = 8;

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function persist(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore (quota / private mode)
  }
}

export function useRecentSkills() {
  const [recentIds, setRecentIds] = useState<string[]>(loadInitial);

  const pushRecent = useCallback((skillId: string) => {
    setRecentIds((prev) => {
      const deduped = prev.filter((id) => id !== skillId);
      const next = [skillId, ...deduped].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    persist([]);
    setRecentIds([]);
  }, []);

  return { recentIds, pushRecent, clearRecent };
}
