import { useCallback, useState } from 'react';
import type { EurekaInventoryState } from '@/types/eureka-gear';

const KEY = 'eureka-gear-inventory-v1';

function loadState(): EurekaInventoryState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      materials: parsed.materials ?? {},
      ownedGear: parsed.ownedGear ?? {},
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch {
    return empty();
  }
}

function empty(): EurekaInventoryState {
  return { materials: {}, ownedGear: {}, updatedAt: '' };
}

function save(state: EurekaInventoryState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function useEurekaInventory() {
  const [state, setState] = useState<EurekaInventoryState>(loadState);

  const setMaterial = useCallback((materialId: number, count: number) => {
    setState((prev) => {
      const next = {
        ...prev,
        materials: { ...prev.materials, [materialId]: Math.max(0, count) },
        updatedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const adjustMaterial = useCallback((materialId: number, delta: number) => {
    setState((prev) => {
      const cur = prev.materials[materialId] ?? 0;
      const next = {
        ...prev,
        materials: { ...prev.materials, [materialId]: Math.max(0, cur + delta) },
        updatedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const setOwned = useCallback((itemId: number, owned: boolean) => {
    setState((prev) => {
      const nextOwned = { ...prev.ownedGear };
      if (owned) nextOwned[itemId] = true;
      else delete nextOwned[itemId];
      const next = {
        ...prev,
        ownedGear: nextOwned,
        updatedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const next = empty();
    save(next);
    setState(next);
  }, []);

  return {
    materials: state.materials,
    ownedGear: state.ownedGear,
    setMaterial,
    adjustMaterial,
    setOwned,
    clearAll,
  };
}
