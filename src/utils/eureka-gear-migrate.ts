import { ARMOR_SET_IDS } from '../types/eureka-gear';
import type { EurekaInventoryV3, EurekaInventoryV4 } from '../types/eureka-gear';

export function emptyInventoryV4(): EurekaInventoryV4 {
  const armor = {} as EurekaInventoryV4['armor'];
  for (const id of ARMOR_SET_IDS) armor[id] = {};
  return { schemaVersion: 4, weapons: {}, armor, materials: {} };
}

// Back-compat export — previously returned v3. Now returns v4 (armor upgraded to track-aware).
export function emptyInventoryV3(): EurekaInventoryV4 {
  return emptyInventoryV4();
}

/**
 * Migrate a serialized inventory (v2, v3, or v4) into v4 shape.
 *
 * - v2: { materials, chains: { [chainId]: { stage } } } → move chains→weapons, armor empty
 * - v3: armor was single-track per slot. Upgrade to v4 by moving the existing
 *   SlotProgress into the `anemos` sub-track (pre-v4 UI only supported the
 *   legacy armor type; treating as anemos-track is the most conservative
 *   choice since armor wasn't actually user-editable in v3).
 * - v4: pass through, defensively fill missing armor set keys.
 */
export function migrateInventory(raw: string | null): EurekaInventoryV4 {
  if (!raw) return emptyInventoryV4();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyInventoryV4();
  }

  if (typeof parsed !== 'object' || parsed === null) return emptyInventoryV4();
  const obj = parsed as Record<string, unknown>;

  // already v4
  if (obj.schemaVersion === 4) {
    const v4 = obj as EurekaInventoryV4;
    const armor = { ...v4.armor };
    for (const id of ARMOR_SET_IDS) armor[id] = armor[id] ?? {};
    return { ...v4, armor };
  }

  // v3 → v4: promote single-track armor to anemos sub-track
  if (obj.schemaVersion === 3) {
    const v3 = obj as EurekaInventoryV3;
    const result = emptyInventoryV4();
    result.weapons = { ...v3.weapons };
    result.materials = { ...v3.materials };
    for (const id of ARMOR_SET_IDS) {
      const slots = v3.armor[id] ?? {};
      for (const [slot, progress] of Object.entries(slots)) {
        if (!progress) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result.armor[id] as any)[slot] = { anemos: progress };
      }
    }
    return result;
  }

  // v2 shape: { materials, chains: { [chainId]: { stage } } }
  const result = emptyInventoryV4();
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
