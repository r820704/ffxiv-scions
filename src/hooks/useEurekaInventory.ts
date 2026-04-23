import { useCallback, useEffect, useState } from 'react';
import type {
  ArmorSetId,
  ArmorSlot,
  EurekaInventoryV3,
  EurekaStage,
  MaterialCost,
} from '../types/eureka-gear';
import { emptyInventoryV3, migrateInventory } from '../utils/eureka-gear-migrate';
import { STAGE_UPGRADE_COSTS } from '../data/eureka-stage-costs';
import {
  costBetween,
  deductMaterials,
  hasEnoughMaterials,
} from '../utils/eurekaGear';

const KEY_V3 = 'eureka-inventory-v3';
const KEY_V2 = 'eureka-inventory-v2';

export type ChainRef =
  | { kind: 'weapon'; chainId: string }
  | { kind: 'armor'; set: ArmorSetId; slot: ArmorSlot };

export type UpgradeOutcome = {
  from: EurekaStage;
  to: EurekaStage;
  materials: MaterialCost[];
  hadEnough: boolean;
};

function loadInitial(): EurekaInventoryV3 {
  if (typeof window === 'undefined') return emptyInventoryV3();
  try {
    const v3Raw = localStorage.getItem(KEY_V3);
    if (v3Raw) return migrateInventory(v3Raw);
    const v2Raw = localStorage.getItem(KEY_V2);
    if (v2Raw) {
      const migrated = migrateInventory(v2Raw);
      localStorage.setItem(KEY_V3, JSON.stringify(migrated));
      localStorage.removeItem(KEY_V2);
      return migrated;
    }
  } catch {
    // ignore, fallback to empty
  }
  return emptyInventoryV3();
}

function getSlotFromRef(inv: EurekaInventoryV3, ref: ChainRef) {
  if (ref.kind === 'weapon') return inv.weapons[ref.chainId];
  return inv.armor[ref.set][ref.slot];
}

function setSlotInInventory(
  inv: EurekaInventoryV3,
  ref: ChainRef,
  update: (prev: { currentStage: EurekaStage; targetStage?: EurekaStage } | undefined) => { currentStage: EurekaStage; targetStage?: EurekaStage },
): EurekaInventoryV3 {
  if (ref.kind === 'weapon') {
    return {
      ...inv,
      weapons: { ...inv.weapons, [ref.chainId]: update(inv.weapons[ref.chainId]) },
    };
  }
  const prev = inv.armor[ref.set][ref.slot];
  return {
    ...inv,
    armor: {
      ...inv.armor,
      [ref.set]: { ...inv.armor[ref.set], [ref.slot]: update(prev) },
    },
  };
}

export function useEurekaInventory() {
  const [inventory, setInventory] = useState<EurekaInventoryV3>(loadInitial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY_V3, JSON.stringify(inventory));
  }, [inventory]);

  const setMaterial = useCallback((materialId: number, qty: number) => {
    setInventory((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialId]: Math.max(0, qty) },
    }));
  }, []);

  const setCurrent = useCallback((ref: ChainRef, stage: EurekaStage) => {
    setInventory((prev) =>
      setSlotInInventory(prev, ref, () => ({ currentStage: stage })),
    );
  }, []);

  const setTarget = useCallback((ref: ChainRef, stage: EurekaStage | undefined) => {
    setInventory((prev) =>
      setSlotInInventory(prev, ref, (p) => ({
        currentStage: p?.currentStage ?? 'antiquated',
        targetStage: stage,
      })),
    );
  }, []);

  const performUpgrade = useCallback(
    (ref: ChainRef): UpgradeOutcome | null => {
      let outcome: UpgradeOutcome | null = null;
      // Compute outcome directly from current inventory state without reading from state setter
      const slot = getSlotFromRef(inventory, ref);
      if (slot?.targetStage) {
        const from = slot.currentStage;
        const to = slot.targetStage;
        if (from !== to) {
          const materials = costBetween(from, to, STAGE_UPGRADE_COSTS);
          const hadEnough = materials.every(
            (m) => (inventory.materials[m.materialId] ?? 0) >= m.quantity,
          );
          outcome = { from, to, materials, hadEnough };
        }
      }

      // Now apply the state update
      setInventory((prev) => {
        const slot = getSlotFromRef(prev, ref);
        if (!slot?.targetStage) return prev;
        const from = slot.currentStage;
        const to = slot.targetStage;
        if (from === to) return prev;
        const materials = costBetween(from, to, STAGE_UPGRADE_COSTS);
        const nextMaterials = deductMaterials(prev.materials, materials);
        return setSlotInInventory(
          { ...prev, materials: nextMaterials },
          ref,
          () => ({ currentStage: to }),
        );
      });
      return outcome;
    },
    [inventory],
  );

  const clearAll = useCallback(() => {
    setInventory(emptyInventoryV3());
  }, []);

  return {
    inventory,
    setMaterial,
    setCurrent,
    setTarget,
    performUpgrade,
    clearAll,
    hasEnoughMaterials: (stage: EurekaStage) =>
      hasEnoughMaterials(stage, inventory.materials, STAGE_UPGRADE_COSTS),
  };
}
