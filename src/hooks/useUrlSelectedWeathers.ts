import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';

const URL_NIGHT_TOKEN = 'night';

function urlTokenToInternal(token: string): string {
  return token === URL_NIGHT_TOKEN ? NIGHT_FILTER_KEY : token;
}

function internalToUrlToken(value: string): string {
  return value === NIGHT_FILTER_KEY ? URL_NIGHT_TOKEN : value;
}

export function useUrlSelectedWeathers(): [
  Set<string>,
  (next: Set<string>) => void,
] {
  const [params, setParams] = useSearchParams();

  const selected = useMemo(() => {
    const w = params.get('w');
    if (!w) return new Set<string>();
    return new Set(w.split(',').filter(Boolean).map(urlTokenToInternal));
  }, [params]);

  const setSelected = useCallback(
    (next: Set<string>) => {
      const newParams = new URLSearchParams(params);
      if (next.size === 0) {
        newParams.delete('w');
      } else {
        newParams.set('w', [...next].map(internalToUrlToken).join(','));
      }
      setParams(newParams, { replace: true });
    },
    [params, setParams],
  );

  return [selected, setSelected];
}
