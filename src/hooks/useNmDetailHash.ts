import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eurekaNms } from '@/data/eureka-nm-data';

const KNOWN_NM_IDS = new Set(eurekaNms.map((n) => n.id));

export function useNmDetailHash(): [
  string | null,
  (id: string | null) => void,
] {
  const [params, setParams] = useSearchParams();

  const nmId = useMemo(() => {
    const raw = params.get('nm');
    if (!raw) return null;
    if (!KNOWN_NM_IDS.has(raw)) return null;
    return raw;
  }, [params]);

  const setNmId = useCallback(
    (id: string | null) => {
      const newParams = new URLSearchParams(params);
      if (id === null) {
        newParams.delete('nm');
      } else {
        newParams.set('nm', id);
      }
      setParams(newParams, { replace: true });
    },
    [params, setParams],
  );

  return [nmId, setNmId];
}
