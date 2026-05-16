import { useState, useCallback } from 'react';

const STORAGE_KEY = 'eureka-recent-searches';
const MAX_ENTRIES = 5;
const MIN_LENGTH = 2;

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string' && x.length >= MIN_LENGTH)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function persist(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore (quota / private mode)
  }
}

/**
 * Tracks recent search keywords for a text input. Persists to localStorage.
 * Caller invokes `pushRecent(query)` when the search is "committed" (e.g. on
 * blur). Empty / too-short queries are silently ignored.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>(loadInitial);

  const pushRecent = useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_LENGTH) return;
    setRecents((prev) => {
      const deduped = prev.filter((q) => q !== trimmed);
      const next = [trimmed, ...deduped].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((query: string) => {
    setRecents((prev) => {
      const next = prev.filter((q) => q !== query);
      persist(next);
      return next;
    });
  }, []);

  return { recents, pushRecent, removeRecent };
}
