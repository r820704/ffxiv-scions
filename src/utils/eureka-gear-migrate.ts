import { ARMOR_SET_IDS } from '../types/eureka-gear';
import type {
  ArmorSlot,
  EurekaInventoryV3,
  EurekaInventoryV4,
  EurekaInventoryV5,
} from '../types/eureka-gear';

/**
 * Removes any elemental armor slot where currentStage is 'antiquated' (invalid stage
 * for the elemental track — likely leftover from a v4 migration edge case).
 */
function cleanElementalAntiquated(inv: EurekaInventoryV5): EurekaInventoryV5 {
  const elemental = { ...inv.armor.elemental } as typeof inv.armor.elemental;
  for (const setId of Object.keys(elemental) as (keyof typeof elemental)[]) {
    const slots = elemental[setId];
    if (!slots) continue;
    const cleaned = { ...slots };
    for (const slot of Object.keys(cleaned) as ArmorSlot[]) {
      if (cleaned[slot]?.currentStage === 'antiquated') {
        delete cleaned[slot];
      }
    }
    elemental[setId] = cleaned;
  }
  return { ...inv, armor: { ...inv.armor, elemental } };
}

export function emptyInventoryV5(): EurekaInventoryV5 {
  const elemental = {} as EurekaInventoryV5['armor']['elemental'];
  for (const id of ARMOR_SET_IDS) elemental[id] = {};
  return {
    schemaVersion: 5,
    weapons: {},
    armor: { anemos: {}, elemental },
    materials: {},
  };
}

// Back-compat aliases — previously returned v3/v4. Now returns v5.
export function emptyInventoryV4(): EurekaInventoryV5 {
  return emptyInventoryV5();
}
export function emptyInventoryV3(): EurekaInventoryV5 {
  return emptyInventoryV5();
}

/**
 * Migrate a serialized inventory (v2, v3, v4, or v5) into v5 shape.
 *
 * - v2: { materials, chains } → move chains→weapons, armor empty
 * - v3: single-track armor per slot → promoted elemental if present, anemos dropped
 *       (v3 didn't separate tracks, and anemos is now per-job not per-role, so
 *       old v3 armor data cannot be safely remapped — conservatively discarded)
 * - v4: armor.{set}.{slot}.{anemos|elemental} → v5 keeps only elemental;
 *       anemos data is dropped (v4 grouped anemos by role, but anemos is
 *       per-job in reality, and we can't recover which job it belonged to)
 * - v5: pass through with defensive fills
 */
export function migrateInventory(raw: string | null): EurekaInventoryV5 {
  return cleanElementalAntiquated(migrateInventoryRaw(raw));
}

function migrateInventoryRaw(raw: string | null): EurekaInventoryV5 {
  if (!raw) return emptyInventoryV5();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyInventoryV5();
  }

  if (typeof parsed !== 'object' || parsed === null) return emptyInventoryV5();
  const obj = parsed as Record<string, unknown>;

  // already v5
  if (obj.schemaVersion === 5) {
    const v5 = obj as EurekaInventoryV5;
    const elemental = { ...v5.armor.elemental };
    for (const id of ARMOR_SET_IDS) elemental[id] = elemental[id] ?? {};
    return {
      ...v5,
      armor: {
        anemos: v5.armor.anemos ?? {},
        elemental,
      },
    };
  }

  // v4 → v5: keep elemental, drop anemos (can't determine per-job mapping from per-role)
  if (obj.schemaVersion === 4) {
    const v4 = obj as EurekaInventoryV4;
    const result = emptyInventoryV5();
    result.weapons = { ...v4.weapons };
    result.materials = { ...v4.materials };
    for (const id of ARMOR_SET_IDS) {
      const slots = v4.armor[id] ?? {};
      for (const [slot, state] of Object.entries(slots)) {
        if (!state?.elemental) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result.armor.elemental[id] as Record<string, unknown>)[slot] = state.elemental;
      }
    }
    return result;
  }

  // v3 → v5: drop armor entirely (single-track armor can't be safely migrated)
  if (obj.schemaVersion === 3) {
    const v3 = obj as EurekaInventoryV3;
    const result = emptyInventoryV5();
    result.weapons = { ...v3.weapons };
    result.materials = { ...v3.materials };
    return result;
  }

  // v2 shape: { materials, chains: { [chainId]: { stage } } }
  const result = emptyInventoryV5();
  if (typeof obj.materials === 'object' && obj.materials !== null) {
    result.materials = obj.materials as Record<number, number>;
  }
  if (typeof obj.chains === 'object' && obj.chains !== null) {
    const chains = obj.chains as Record<string, { stage?: string }>;
    for (const [chainId, val] of Object.entries(chains)) {
      if (val && typeof val.stage === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.weapons[chainId] = { currentStage: val.stage as any };
      }
    }
  }
  return result;
}
