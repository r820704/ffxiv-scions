import { useCallback, useEffect, useState } from 'react';
import type {
  ArmorSetId,
  ArmorSlot,
  EurekaInventoryV5,
  EurekaStage,
  MaterialCost,
  StageUpgradeCost,
} from '../types/eureka-gear';
import { ARMOR_STAGES_BY_TRACK } from '../types/eureka-gear';
import { emptyInventoryV5, migrateInventory } from '../utils/eureka-gear-migrate';
import { STAGE_UPGRADE_COSTS } from '../data/eureka-stage-costs';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../data/eureka-armor-costs';
import { EUREKA_CHAINS } from '../data/eureka-chains';
import type { JobId } from '../data/eureka-armor-sets';
import {
  costBetween,
  costBetweenInSequence,
  deductMaterials,
  hasEnoughMaterials,
} from '../utils/eurekaGear';

function getSyncedChainIds(chainId: string): string[] {
  const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
  const primaryId = chain?.mirrorsChainId ?? chainId;
  const mirrors = EUREKA_CHAINS.filter((c) => c.mirrorsChainId === primaryId).map((c) => c.chainId);
  return [primaryId, ...mirrors];
}

const KEY_V5 = 'eureka-inventory-v5';
const KEY_V4 = 'eureka-inventory-v4';
const KEY_V3 = 'eureka-inventory-v3';
const KEY_V2 = 'eureka-inventory-v2';

export type ChainRef =
  | { kind: 'weapon'; chainId: string }
  | { kind: 'armor-anemos'; job: JobId; slot: ArmorSlot }
  | { kind: 'armor-elemental'; set: ArmorSetId; slot: ArmorSlot };

export type UpgradeOutcome = {
  from: EurekaStage;
  to: EurekaStage;
  materials: MaterialCost[];
  hadEnough: boolean;
};

function loadInitial(): EurekaInventoryV5 {
  if (typeof window === 'undefined') return emptyInventoryV5();
  try {
    const v5Raw = localStorage.getItem(KEY_V5);
    if (v5Raw) return migrateInventory(v5Raw);
    for (const [key, legacyKey] of [[KEY_V4, KEY_V4], [KEY_V3, KEY_V3], [KEY_V2, KEY_V2]] as const) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const migrated = migrateInventory(raw);
        localStorage.setItem(KEY_V5, JSON.stringify(migrated));
        localStorage.removeItem(legacyKey);
        return migrated;
      }
    }
  } catch {
    // ignore
  }
  return emptyInventoryV5();
}

function costsForArmorKind(kind: 'armor-anemos' | 'armor-elemental'): StageUpgradeCost[] {
  return kind === 'armor-anemos' ? ANEMOS_ARMOR_COSTS : ELEMENTAL_ARMOR_COSTS;
}

function sequenceForArmorKind(kind: 'armor-anemos' | 'armor-elemental') {
  return kind === 'armor-anemos'
    ? ARMOR_STAGES_BY_TRACK.anemos
    : ARMOR_STAGES_BY_TRACK.elemental;
}

function getSlotFromRef(inv: EurekaInventoryV5, ref: ChainRef): { currentStage: EurekaStage; targetStage?: EurekaStage } | undefined {
  if (ref.kind === 'weapon') {
    const chain = EUREKA_CHAINS.find((c) => c.chainId === ref.chainId);
    const primaryId = chain?.mirrorsChainId ?? ref.chainId;
    return inv.weapons[primaryId];
  }
  if (ref.kind === 'armor-anemos') {
    return inv.armor.anemos[ref.job]?.[ref.slot];
  }
  return inv.armor.elemental[ref.set]?.[ref.slot];
}

function setSlotInInventory(
  inv: EurekaInventoryV5,
  ref: ChainRef,
  update: (prev: { currentStage: EurekaStage; targetStage?: EurekaStage } | undefined) => { currentStage: EurekaStage; targetStage?: EurekaStage },
): EurekaInventoryV5 {
  if (ref.kind === 'weapon') {
    const chainIds = getSyncedChainIds(ref.chainId);
    let weapons = inv.weapons;
    for (const id of chainIds) {
      weapons = { ...weapons, [id]: update(weapons[id]) };
    }
    return { ...inv, weapons };
  }
  if (ref.kind === 'armor-anemos') {
    const prevJob = inv.armor.anemos[ref.job] ?? {};
    return {
      ...inv,
      armor: {
        ...inv.armor,
        anemos: {
          ...inv.armor.anemos,
          [ref.job]: { ...prevJob, [ref.slot]: update(prevJob[ref.slot]) },
        },
      },
    };
  }
  // armor-elemental
  const prevSet = inv.armor.elemental[ref.set] ?? {};
  return {
    ...inv,
    armor: {
      ...inv.armor,
      elemental: {
        ...inv.armor.elemental,
        [ref.set]: { ...prevSet, [ref.slot]: update(prevSet[ref.slot]) },
      },
    },
  };
}

function costsForRef(ref: ChainRef, from?: EurekaStage, to?: EurekaStage): MaterialCost[] {
  if (!from || !to || from === to) return [];
  if (ref.kind === 'weapon') {
    return costBetween(from, to, STAGE_UPGRADE_COSTS);
  }
  const costs = costsForArmorKind(ref.kind);
  const sequence = sequenceForArmorKind(ref.kind);
  return costBetweenInSequence(from, to, sequence, costs, ref.slot);
}

export function useEurekaInventory() {
  const [inventory, setInventory] = useState<EurekaInventoryV5>(loadInitial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY_V5, JSON.stringify(inventory));
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
          const materials = costsForRef(ref, from, to);
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
        const materials = costsForRef(ref, from, to);
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
    setInventory(emptyInventoryV5());
  }, []);

  const clearChain = useCallback((ref: ChainRef) => {
    setInventory((prev) => {
      if (ref.kind === 'weapon') {
        const chainIds = getSyncedChainIds(ref.chainId);
        const weapons = { ...prev.weapons };
        for (const id of chainIds) delete weapons[id];
        return { ...prev, weapons };
      }
      if (ref.kind === 'armor-anemos') {
        const prevJob = { ...prev.armor.anemos[ref.job] };
        delete prevJob[ref.slot];
        return {
          ...prev,
          armor: {
            ...prev.armor,
            anemos: { ...prev.armor.anemos, [ref.job]: prevJob },
          },
        };
      }
      // armor-elemental
      const prevSet = { ...prev.armor.elemental[ref.set] };
      delete prevSet[ref.slot];
      return {
        ...prev,
        armor: {
          ...prev.armor,
          elemental: { ...prev.armor.elemental, [ref.set]: prevSet },
        },
      };
    });
  }, []);

  return {
    inventory,
    setMaterial,
    setCurrent,
    setTarget,
    performUpgrade,
    clearAll,
    clearChain,
    hasEnoughMaterials: (stage: EurekaStage) =>
      hasEnoughMaterials(stage, inventory.materials, STAGE_UPGRADE_COSTS),
  };
}
