import { ARMOR_SET_IDS } from '../types/eureka-gear';
import type { EurekaInventoryV3 } from '../types/eureka-gear';

export function emptyInventoryV3(): EurekaInventoryV3 {
  const armor = {} as EurekaInventoryV3['armor'];
  for (const id of ARMOR_SET_IDS) armor[id] = {};
  return { schemaVersion: 3, weapons: {}, armor, materials: {} };
}

export function migrateInventory(raw: string | null): EurekaInventoryV3 {
  if (!raw) return emptyInventoryV3();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyInventoryV3();
  }

  if (typeof parsed !== 'object' || parsed === null) return emptyInventoryV3();
  const obj = parsed as Record<string, unknown>;

  // already v3
  if (obj.schemaVersion === 3) {
    const v3 = obj as EurekaInventoryV3;
    const armor = { ...v3.armor };
    for (const id of ARMOR_SET_IDS) armor[id] = armor[id] ?? {};
    return { ...v3, armor };
  }

  // v2 shape: { materials, chains: { [chainId]: { stage } } }
  const result = emptyInventoryV3();
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
