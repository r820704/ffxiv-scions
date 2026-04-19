import { useEffect, useState } from 'react';
import type { EurekaWeapon, EurekaMaterial } from '../types/eureka-gear';

interface State {
  weapons: EurekaWeapon[];
  materials: EurekaMaterial[];
  loading: boolean;
  error: string | null;
}

export function useEurekaWeaponsData(): State {
  const [state, setState] = useState<State>({
    weapons: [], materials: [], loading: true, error: null,
  });

  useEffect(() => {
    let cancel = false;
    const base = import.meta.env.BASE_URL ?? '/';
    (async () => {
      try {
        const [w, m] = await Promise.all([
          fetch(`${base}data/eureka-weapons.json`).then((r) => r.json()),
          fetch(`${base}data/eureka-materials.json`).then((r) => r.json()),
        ]);
        if (!cancel) setState({ weapons: w, materials: m, loading: false, error: null });
      } catch (e) {
        if (!cancel) setState((s) => ({ ...s, loading: false, error: String(e) }));
      }
    })();
    return () => { cancel = true; };
  }, []);

  return state;
}
