import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

export function useLocalStorageBool(
  key: string,
  defaultValue: boolean,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [value, setValueState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const raw = window.localStorage.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return defaultValue;
  });

  const setValue = useCallback<Dispatch<SetStateAction<boolean>>>(
    (next) => {
      setValueState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: boolean) => boolean)(prev) : next;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, String(resolved));
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue];
}
