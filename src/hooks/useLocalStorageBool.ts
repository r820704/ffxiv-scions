import { useCallback, useState } from 'react';

export function useLocalStorageBool(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  const [value, setValueState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const raw = window.localStorage.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return defaultValue;
  });

  const setValue = useCallback(
    (next: boolean) => {
      setValueState(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, String(next));
      }
    },
    [key],
  );

  return [value, setValue];
}
