import type { EurekaStage, MaterialCost, StageUpgradeCost, EurekaChain, GearFilterState, ChainProgress, ArmorSetId, ArmorSlot, ArmorSlotState, EurekaInventoryV4, SlotProgress } from '../types/eureka-gear';
import { EUREKA_STAGES } from '../types/eureka-gear';
import { EUREKA_CHAINS } from '../data/eureka-chains';
import { ARMOR_SET_FOR_JOB } from '../data/eureka-armor-sets';

export function getNextStage(stage: EurekaStage): EurekaStage | null {
  const idx = EUREKA_STAGES.indexOf(stage);
  if (idx < 0 || idx >= EUREKA_STAGES.length - 1) return null;
  return EUREKA_STAGES[idx + 1] ?? null;
}

export function findCost(
  stage: EurekaStage,
  costs: StageUpgradeCost[],
): StageUpgradeCost | null {
  const to = getNextStage(stage);
  if (!to) return null;
  return costs.find((c) => c.from === stage && c.to === to) ?? null;
}

export function hasEnoughMaterials(
  stage: EurekaStage,
  inventory: Record<number, number>,
  costs: StageUpgradeCost[],
): boolean {
  const cost = findCost(stage, costs);
  if (!cost) return false;
  return cost.materials.every((m) => (inventory[m.materialId] ?? 0) >= m.quantity);
}

export function deductMaterials(
  inventory: Record<number, number>,
  cost: MaterialCost[],
): Record<number, number> {
  const next = { ...inventory };
  for (const m of cost) {
    const cur = next[m.materialId] ?? 0;
    next[m.materialId] = Math.max(0, cur - m.quantity);
  }
  return next;
}

export function filterChains(
  chains: EurekaChain[],
  filter: GearFilterState,
  progress: ChainProgress,
  inventory: Record<number, number>,
  costs: StageUpgradeCost[],
): EurekaChain[] {
  const q = filter.search.trim().toLowerCase();
  return chains.filter((c) => {
    if (q && !c.displayName.toLowerCase().includes(q) && !c.chainId.toLowerCase().includes(q)) return false;
    if (filter.jobs.size > 0 && !filter.jobs.has(c.job)) return false;
    const cur = progress[c.chainId] ?? 'antiquated';
    if (filter.stages.size > 0 && !filter.stages.has(cur)) return false;
    if (filter.onlyCompleted && cur !== 'physeos') return false;
    if (filter.onlyUpgradable) {
      if (cur === 'physeos') return false;
      if (!hasEnoughMaterials(cur, inventory, costs)) return false;
    }
    return true;
  });
}

export function costBetween(
  from: EurekaStage,
  to: EurekaStage,
  costs: StageUpgradeCost[],
): MaterialCost[] {
  return costBetweenInSequence(from, to, EUREKA_STAGES, costs);
}

/**
 * Like `costBetween` but walks a custom stage sequence (used for armor tracks
 * whose stages are a non-contiguous subset of EUREKA_STAGES). When `slot` is
 * provided, cost entries with a `slots` restriction are filtered to match;
 * unrestricted entries always apply.
 */
export function costBetweenInSequence(
  from: EurekaStage,
  to: EurekaStage,
  sequence: readonly EurekaStage[],
  costs: StageUpgradeCost[],
  slot?: ArmorSlot,
): MaterialCost[] {
  const fromIdx = sequence.indexOf(from);
  const toIdx = sequence.indexOf(to);
  if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) return [];

  const totals = new Map<number, number>();
  for (let i = fromIdx; i < toIdx; i++) {
    const edges = costs.filter((c) => c.from === sequence[i] && c.to === sequence[i + 1]);
    const edge = edges.find((c) => {
      if (!c.slots) return true; // unrestricted
      return slot ? c.slots.includes(slot) : false;
    });
    if (!edge) continue;
    for (const m of edge.materials) {
      totals.set(m.materialId, (totals.get(m.materialId) ?? 0) + m.quantity);
    }
  }
  return Array.from(totals, ([materialId, quantity]) => ({ materialId, quantity }));
}

export type JobProgress = {
  weapons: { chainId: string; progress: SlotProgress }[];
  armor: {
    set: ArmorSetId;
    pieces: Partial<Record<ArmorSlot, ArmorSlotState>>;
  };
};

type JobId = keyof typeof ARMOR_SET_FOR_JOB;

export function getJobProgress(job: JobId, inv: EurekaInventoryV4): JobProgress {
  const weapons = EUREKA_CHAINS
    .filter((c) => c.job === job)
    .map((c) => ({
      chainId: c.chainId,
      progress: inv.weapons[c.chainId] ?? { currentStage: 'antiquated' as const },
    }));
  const set = ARMOR_SET_FOR_JOB[job];
  return {
    weapons,
    armor: { set, pieces: inv.armor[set] ?? {} },
  };
}
