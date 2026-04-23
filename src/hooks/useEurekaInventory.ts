import { useCallback, useState } from 'react';
import type { GearInventoryState, EurekaStage, StageUpgradeCost, ChainProgress } from '../types/eureka-gear';
import { hasEnoughMaterials, deductMaterials, getNextStage, findCost } from '../utils/eurekaGear';

const KEY = 'eureka-inventory-v2';

function empty(): GearInventoryState {
  return { materials: {}, chainProgress: {}, updatedAt: '' };
}

function loadState(): GearInventoryState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw);
    return {
      materials: p.materials ?? {},
      chainProgress: p.chainProgress ?? {},
      updatedAt: p.updatedAt ?? '',
    };
  } catch {
    return empty();
  }
}

function save(s: GearInventoryState): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useEurekaInventory() {
  const [state, setState] = useState<GearInventoryState>(loadState);

  const setMaterial = useCallback((id: number, count: number) => {
    setState((prev) => {
      const next: GearInventoryState = {
        ...prev,
        materials: { ...prev.materials, [id]: Math.max(0, count) },
        updatedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const adjustMaterial = useCallback((id: number, delta: number) => {
    setState((prev) => {
      const cur = prev.materials[id] ?? 0;
      const next: GearInventoryState = {
        ...prev,
        materials: { ...prev.materials, [id]: Math.max(0, cur + delta) },
        updatedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const setChainStage = useCallback((chainId: string, stage: EurekaStage | null) => {
    setState((prev) => {
      const nextProgress: ChainProgress = { ...prev.chainProgress };
      if (stage === null) delete nextProgress[chainId];
      else nextProgress[chainId] = stage;
      const next: GearInventoryState = {
        ...prev,
        chainProgress: nextProgress,
        updatedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const upgradeChain = useCallback((chainId: string, costs: StageUpgradeCost[]) => {
    setState((prev) => {
      const cur = prev.chainProgress[chainId] ?? 'antiquated';
      if (!hasEnoughMaterials(cur, prev.materials, costs)) return prev;
      const to = getNextStage(cur);
      if (!to) return prev;
      const costEntry = findCost(cur, costs);
      if (!costEntry) return prev;
      const next: GearInventoryState = {
        materials: deductMaterials(prev.materials, costEntry.materials),
        chainProgress: { ...prev.chainProgress, [chainId]: to },
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
    chainProgress: state.chainProgress,
    setMaterial,
    adjustMaterial,
    setChainStage,
    upgradeChain,
    clearAll,
  };
}
