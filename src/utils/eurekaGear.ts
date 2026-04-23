import type { EurekaStage, MaterialCost, StageUpgradeCost, EurekaChain, GearFilterState, ChainProgress } from '../types/eureka-gear';
import { EUREKA_STAGES } from '../types/eureka-gear';

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
  const fromIdx = EUREKA_STAGES.indexOf(from);
  const toIdx = EUREKA_STAGES.indexOf(to);
  if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) return [];

  const totals = new Map<number, number>();
  for (let i = fromIdx; i < toIdx; i++) {
    const edge = costs.find(
      (c) => c.from === EUREKA_STAGES[i] && c.to === EUREKA_STAGES[i + 1],
    );
    if (!edge) continue;
    for (const m of edge.materials) {
      totals.set(m.materialId, (totals.get(m.materialId) ?? 0) + m.quantity);
    }
  }
  return Array.from(totals, ([materialId, quantity]) => ({ materialId, quantity }));
}
