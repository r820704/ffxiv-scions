import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Persist a JSON-serializable value to localStorage. Re-reads when `key` changes,
 * so callers can scope state by an external value (e.g. selectedJob) without an
 * explicit reset effect.
 *
 * Returns a tuple matching `useState`'s setter signature, including functional
 * updates: `setValue((prev) => ...)`.
 */
export function useLocalStorageJson<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return defaultValue;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
    // defaultValue intentionally excluded — callers may pass a fresh literal
    // each render; only the key drives re-reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [value, setValueState] = useState<T>(read);

  // Re-read when key changes (e.g. user switches to a different scope).
  useEffect(() => {
    setValueState(read());
  }, [read]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      setValueState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue];
}
