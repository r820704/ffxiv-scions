import { useMemo } from 'react';
import { costBetween, costBetweenInSequence } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import {
  ARMOR_SET_IDS,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  EUREKA_STAGES,
} from '../../types/eureka-gear';
import type { EurekaInventoryV5, EurekaStage, MaterialCost } from '../../types/eureka-gear';

const TOP_N = 5;
const MIRROR_CHAIN_IDS = new Set(
  EUREKA_CHAINS.filter((c) => c.mirrorsChainId).map((c) => c.chainId),
);

export type NextEdgeShortageProps = {
  inventory: EurekaInventoryV5;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
};

const MATERIAL_ICON_MODULES = import.meta.glob('../../assets/material-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const MATERIAL_ICONS: Record<number, string> = Object.fromEntries(
  Object.entries(MATERIAL_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/(\d+)\.png$/);
    return [match ? Number(match[1]) : 0, url];
  }),
);

/**
 * Aggregate the cost of the *immediate next edge* for every chain that has a
 * target set. A chain at stage 5 with target stage 8 only contributes the cost
 * of edge 5→6 here, not the full 5→8 chain. This answers persona B4: "我下一
 * 階段最需要哪幾個素材?"
 */
function aggregateNextEdge(inv: EurekaInventoryV5): Map<number, number> {
  const totals = new Map<number, number>();

  const addCost = (mats: MaterialCost[]) => {
    for (const m of mats) totals.set(m.materialId, (totals.get(m.materialId) ?? 0) + m.quantity);
  };

  // Weapons: next edge in EUREKA_STAGES.
  for (const [chainId, slot] of Object.entries(inv.weapons)) {
    if (MIRROR_CHAIN_IDS.has(chainId)) continue;
    if (!slot.targetStage) continue;
    const fromIdx = EUREKA_STAGES.indexOf(slot.currentStage);
    const toIdx = EUREKA_STAGES.indexOf(slot.targetStage);
    if (toIdx <= fromIdx) continue;
    const next: EurekaStage | undefined = EUREKA_STAGES[fromIdx + 1];
    if (!next) continue;
    addCost(costBetween(slot.currentStage, next, STAGE_UPGRADE_COSTS));
  }

  // Anemos armor: next edge in anemos sequence per slot.
  for (const [, jobPieces] of Object.entries(inv.armor.anemos)) {
    for (const slotName of ARMOR_SLOTS) {
      const p = jobPieces?.[slotName];
      if (!p?.targetStage) continue;
      const seq = ARMOR_STAGES_BY_TRACK.anemos;
      const fromIdx = seq.indexOf(p.currentStage);
      const toIdx = seq.indexOf(p.targetStage);
      if (toIdx <= fromIdx) continue;
      const next = seq[fromIdx + 1];
      if (!next) continue;
      addCost(costBetweenInSequence(p.currentStage, next, seq, ANEMOS_ARMOR_COSTS, slotName));
    }
  }

  // Elemental armor: same idea on elemental sequence.
  for (const setId of ARMOR_SET_IDS) {
    const setData = inv.armor.elemental[setId] ?? {};
    for (const slotName of ARMOR_SLOTS) {
      const p = setData[slotName];
      if (!p?.targetStage) continue;
      const seq = ARMOR_STAGES_BY_TRACK.elemental;
      const fromIdx = seq.indexOf(p.currentStage);
      const toIdx = seq.indexOf(p.targetStage);
      if (toIdx <= fromIdx) continue;
      const next = seq[fromIdx + 1];
      if (!next) continue;
      addCost(costBetweenInSequence(p.currentStage, next, seq, ELEMENTAL_ARMOR_COSTS, slotName));
    }
  }

  return totals;
}

export function NextEdgeShortage({ inventory, materialsMap }: NextEdgeShortageProps) {
  const top = useMemo(() => {
    const totals = aggregateNextEdge(inventory);
    const rows = Array.from(totals, ([materialId, totalNeeded]) => {
      const have = inventory.materials[materialId] ?? 0;
      return { materialId, totalNeeded, have, shortage: Math.max(0, totalNeeded - have) };
    });
    // Only highlight materials we actually still need (shortage > 0).
    return rows
      .filter((r) => r.shortage > 0)
      .sort((a, b) => b.shortage - a.shortage)
      .slice(0, TOP_N);
  }, [inventory]);

  if (top.length === 0) return null;

  return (
    <section
      aria-label="下一階段最缺素材"
      className="bg-amber-950/30 border border-amber-700/40 rounded p-3 mb-3"
    >
      <h3 className="text-sm font-bold text-amber-300 mb-2">⚡ 下一階段最缺（前 {top.length} 名）</h3>
      <ul className="space-y-1">
        {top.map(({ materialId, shortage, totalNeeded, have }) => {
          const meta = materialsMap[materialId];
          const icon = MATERIAL_ICONS[meta?.icon ?? 0];
          return (
            <li key={materialId} className="flex items-center gap-2 text-xs">
              {icon && <img src={icon} alt={meta?.nameTC ?? ''} className="w-5 h-5" loading="lazy" />}
              <span className="text-gray-200 flex-1 truncate">{meta?.nameTC ?? `#${materialId}`}</span>
              <span className="text-amber-300 font-semibold">缺 {shortage}</span>
              <span className="text-gray-500 text-[10px]">（{have}/{totalNeeded}）</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
