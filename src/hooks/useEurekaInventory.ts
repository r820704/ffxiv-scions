import { useCallback, useEffect, useState } from 'react';
import type {
  ArmorSetId,
  ArmorSlot,
  ArmorTrack,
  EurekaInventoryV4,
  EurekaStage,
  MaterialCost,
  StageUpgradeCost,
} from '../types/eureka-gear';
import { ARMOR_STAGES_BY_TRACK } from '../types/eureka-gear';
import { emptyInventoryV4, migrateInventory } from '../utils/eureka-gear-migrate';
import { STAGE_UPGRADE_COSTS } from '../data/eureka-stage-costs';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../data/eureka-armor-costs';
import { EUREKA_CHAINS } from '../data/eureka-chains';
import {
  costBetween,
  costBetweenInSequence,
  deductMaterials,
  hasEnoughMaterials,
} from '../utils/eurekaGear';

/** Returns primary chainId + any mirror chainIds that should sync with it. */
function getSyncedChainIds(chainId: string): string[] {
  const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
  const primaryId = chain?.mirrorsChainId ?? chainId;
  const mirrors = EUREKA_CHAINS.filter((c) => c.mirrorsChainId === primaryId).map((c) => c.chainId);
  return [primaryId, ...mirrors];
}

const KEY_V4 = 'eureka-inventory-v4';
const KEY_V3 = 'eureka-inventory-v3';
const KEY_V2 = 'eureka-inventory-v2';

export type ChainRef =
  | { kind: 'weapon'; chainId: string }
  | { kind: 'armor'; set: ArmorSetId; slot: ArmorSlot; track: ArmorTrack };

export type UpgradeOutcome = {
  from: EurekaStage;
  to: EurekaStage;
  materials: MaterialCost[];
  hadEnough: boolean;
};

function loadInitial(): EurekaInventoryV4 {
  if (typeof window === 'undefined') return emptyInventoryV4();
  try {
    const v4Raw = localStorage.getItem(KEY_V4);
    if (v4Raw) return migrateInventory(v4Raw);
    const v3Raw = localStorage.getItem(KEY_V3);
    if (v3Raw) {
      const migrated = migrateInventory(v3Raw);
      localStorage.setItem(KEY_V4, JSON.stringify(migrated));
      localStorage.removeItem(KEY_V3);
      return migrated;
    }
    const v2Raw = localStorage.getItem(KEY_V2);
    if (v2Raw) {
      const migrated = migrateInventory(v2Raw);
      localStorage.setItem(KEY_V4, JSON.stringify(migrated));
      localStorage.removeItem(KEY_V2);
      return migrated;
    }
  } catch {
    // ignore, fallback to empty
  }
  return emptyInventoryV4();
}

function costsForTrack(track: ArmorTrack): StageUpgradeCost[] {
  return track === 'anemos' ? ANEMOS_ARMOR_COSTS : ELEMENTAL_ARMOR_COSTS;
}

function getSlotFromRef(inv: EurekaInventoryV4, ref: ChainRef) {
  if (ref.kind === 'weapon') {
    const chain = EUREKA_CHAINS.find((c) => c.chainId === ref.chainId);
    const primaryId = chain?.mirrorsChainId ?? ref.chainId;
    return inv.weapons[primaryId];
  }
  return inv.armor[ref.set][ref.slot]?.[ref.track];
}

function setSlotInInventory(
  inv: EurekaInventoryV4,
  ref: ChainRef,
  update: (prev: { currentStage: EurekaStage; targetStage?: EurekaStage } | undefined) => { currentStage: EurekaStage; targetStage?: EurekaStage },
): EurekaInventoryV4 {
  if (ref.kind === 'weapon') {
    const chainIds = getSyncedChainIds(ref.chainId);
    let weapons = inv.weapons;
    for (const id of chainIds) {
      weapons = { ...weapons, [id]: update(weapons[id]) };
    }
    return { ...inv, weapons };
  }
  const prevSlot = inv.armor[ref.set][ref.slot] ?? {};
  const prevTrack = prevSlot[ref.track];
  return {
    ...inv,
    armor: {
      ...inv.armor,
      [ref.set]: {
        ...inv.armor[ref.set],
        [ref.slot]: { ...prevSlot, [ref.track]: update(prevTrack) },
      },
    },
  };
}

function costsForRef(ref: ChainRef, slot?: ArmorSlot, from?: EurekaStage, to?: EurekaStage): MaterialCost[] {
  if (!from || !to || from === to) return [];
  if (ref.kind === 'weapon') {
    return costBetween(from, to, STAGE_UPGRADE_COSTS);
  }
  const costs = costsForTrack(ref.track);
  const sequence = ARMOR_STAGES_BY_TRACK[ref.track];
  return costBetweenInSequence(from, to, sequence, costs, slot);
}

export function useEurekaInventory() {
  const [inventory, setInventory] = useState<EurekaInventoryV4>(loadInitial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY_V4, JSON.stringify(inventory));
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
      const slot = getSlotFromRef(inventory, ref);
      if (slot?.targetStage) {
        const from = slot.currentStage;
        const to = slot.targetStage;
        if (from !== to) {
          const armorSlot = ref.kind === 'armor' ? ref.slot : undefined;
          const materials = costsForRef(ref, armorSlot, from, to);
          const hadEnough = materials.every(
            (m) => (inventory.materials[m.materialId] ?? 0) >= m.quantity,
          );
          outcome = { from, to, materials, hadEnough };
        }
      }

      setInventory((prev) => {
        const s = getSlotFromRef(prev, ref);
        if (!s?.targetStage) return prev;
        const from = s.currentStage;
        const to = s.targetStage;
        if (from === to) return prev;
        const armorSlot = ref.kind === 'armor' ? ref.slot : undefined;
        const materials = costsForRef(ref, armorSlot, from, to);
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
    setInventory(emptyInventoryV4());
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
