import { useEffect, useState } from 'react';
import type { EurekaGearItem, EurekaMaterial } from '@/types/eureka-gear';

const GEAR_URL = `${import.meta.env.BASE_URL}data/eureka-gear.json`;
const MATERIALS_URL = `${import.meta.env.BASE_URL}data/eureka-materials.json`;

export interface EurekaGearData {
  gear: EurekaGearItem[];
  materials: EurekaMaterial[];
  loading: boolean;
  error: Error | null;
}

export function useEurekaGearData(): EurekaGearData {
  const [gear, setGear] = useState<EurekaGearItem[]>([]);
  const [materials, setMaterials] = useState<EurekaMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [gRes, mRes] = await Promise.all([fetch(GEAR_URL), fetch(MATERIALS_URL)]);
        if (!gRes.ok) throw new Error(`gear fetch: ${gRes.status}`);
        if (!mRes.ok) throw new Error(`materials fetch: ${mRes.status}`);
        const [g, m] = await Promise.all([gRes.json(), mRes.json()]);
        if (cancelled) return;
        setGear(g);
        setMaterials(m);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { gear, materials, loading, error };
}
