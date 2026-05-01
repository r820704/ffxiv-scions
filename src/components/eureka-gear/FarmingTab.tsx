import { useMemo, useState } from 'react';
import { ZoneGroup } from './ZoneGroup';
import { NextEdgeShortage } from './NextEdgeShortage';
import { costBetween, costBetweenInSequence } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';
import {
  ARMOR_SET_IDS,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  EUREKA_STAGES,
  ZONE_OF_STAGE,
} from '../../types/eureka-gear';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import type {
  ArmorSlot,
  EurekaInventoryV5,
  EurekaStage,
  EurekaZone,
  MaterialCost,
  SlotProgress,
} from '../../types/eureka-gear';

const MIRROR_CHAIN_IDS = new Set(
  EUREKA_CHAINS.filter((c) => c.mirrorsChainId).map((c) => c.chainId),
);

const WEAPON_ENDPOINT: EurekaStage = EUREKA_STAGES[EUREKA_STAGES.length - 1]!;
const ANEMOS_ENDPOINT: EurekaStage = ARMOR_STAGES_BY_TRACK.anemos[ARMOR_STAGES_BY_TRACK.anemos.length - 1]!;
const ELEMENTAL_ENDPOINT: EurekaStage = ARMOR_STAGES_BY_TRACK.elemental[ARMOR_STAGES_BY_TRACK.elemental.length - 1]!;

export type FarmingTabProps = {
  inventory: EurekaInventoryV5;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
};

type AggregatedMaterial = { materialId: number; totalNeeded: number; shortage: number };

type ZoneAgg = Record<EurekaZone, Map<number, number>>;

type AggOpts = { expandAll: boolean };

function addMaterialsToZone(agg: ZoneAgg, zone: EurekaZone, materials: MaterialCost[]) {
  for (const m of materials) {
    agg[zone].set(m.materialId, (agg[zone].get(m.materialId) ?? 0) + m.quantity);
  }
}

function aggregateWeaponCosts(inv: EurekaInventoryV5, agg: ZoneAgg, opts: AggOpts) {
  for (const [chainId, slot] of Object.entries(inv.weapons) as [string, SlotProgress][]) {
    if (MIRROR_CHAIN_IDS.has(chainId)) continue;
    const target: EurekaStage | undefined = opts.expandAll
      ? WEAPON_ENDPOINT
      : slot.targetStage;
    if (!target) continue;
    const fromIdx = EUREKA_STAGES.indexOf(slot.currentStage);
    const toIdx = EUREKA_STAGES.indexOf(target);
    if (toIdx <= fromIdx) continue;
    for (let i = fromIdx; i < toIdx; i++) {
      const from = EUREKA_STAGES[i];
      const to = EUREKA_STAGES[i + 1];
      if (!from || !to) continue;
      const zone = ZONE_OF_STAGE[to];
      if (!zone) continue;
      addMaterialsToZone(agg, zone, costBetween(from, to, STAGE_UPGRADE_COSTS));
    }
  }
}

function aggregateArmorCosts(inv: EurekaInventoryV5, agg: ZoneAgg, opts: AggOpts) {
  // Anemos armor: per-job
  for (const [_job, jobPieces] of Object.entries(inv.armor.anemos)) {
    for (const slot of ARMOR_SLOTS) {
      const p = jobPieces?.[slot];
      if (!p) continue;
      const target: EurekaStage | undefined = opts.expandAll ? ANEMOS_ENDPOINT : p.targetStage;
      if (!target) continue;
      walkAndAggregate(p.currentStage, target, ARMOR_STAGES_BY_TRACK.anemos, ANEMOS_ARMOR_COSTS, slot, agg);
    }
  }
  // Elemental armor: per-role
  for (const setId of ARMOR_SET_IDS) {
    const setData = inv.armor.elemental[setId] ?? {};
    for (const slot of ARMOR_SLOTS) {
      const p = setData[slot];
      if (!p) continue;
      const target: EurekaStage | undefined = opts.expandAll ? ELEMENTAL_ENDPOINT : p.targetStage;
      if (!target) continue;
      walkAndAggregate(p.currentStage, target, ARMOR_STAGES_BY_TRACK.elemental, ELEMENTAL_ARMOR_COSTS, slot, agg);
    }
  }
}

function walkAndAggregate(
  from: EurekaStage,
  to: EurekaStage,
  sequence: EurekaStage[],
  costs: typeof ANEMOS_ARMOR_COSTS,
  slot: ArmorSlot,
  agg: ZoneAgg,
) {
  const fromIdx = sequence.indexOf(from);
  const toIdx = sequence.indexOf(to);
  if (toIdx <= fromIdx) return;
  for (let i = fromIdx; i < toIdx; i++) {
    const f = sequence[i];
    const t = sequence[i + 1];
    if (!f || !t) continue;
    const zone = zoneForArmorEdge(t);
    if (!zone) continue;
    addMaterialsToZone(agg, zone, costBetweenInSequence(f, t, sequence, costs, slot));
  }
}

function zoneForArmorEdge(to: EurekaStage): EurekaZone | null {
  // Anemos track stays in anemos zone. Elemental stages (elemental / +1 / +2)
  // map via ZONE_OF_STAGE (elemental→pyros zone, which is where Pyros Crystal
  // drops; Hydatos Crystal drops in Hydatos zone; Fragment from BA in hydatos).
  const zone = ZONE_OF_STAGE[to];
  if (zone) return zone;
  return 'hydatos'; // fallback (physeos etc. — Eureka Fragment from BA)
}

function aggregateMaterialsByZone(inv: EurekaInventoryV5, opts: AggOpts): ZoneAgg {
  const zoneAgg: ZoneAgg = {
    anemos: new Map(),
    pagos: new Map(),
    pyros: new Map(),
    hydatos: new Map(),
  };
  aggregateWeaponCosts(inv, zoneAgg, opts);
  aggregateArmorCosts(inv, zoneAgg, opts);
  return zoneAgg;
}

// referenced only to keep ArmorSlot type-import alive under strict unused checks
const _ArmorSlotHint: ArmorSlot = 'head';
void _ArmorSlotHint;

export function FarmingTab({ inventory, materialsMap }: FarmingTabProps) {
  const [showAll, setShowAll] = useState<boolean>(false);
  const zoneAgg = useMemo(
    () => aggregateMaterialsByZone(inventory, { expandAll: showAll }),
    [inventory, showAll],
  );
  const hasAny = Object.values(zoneAgg).some((m) => m.size > 0);

  const toggle = (
    <div className="flex items-center gap-2 mb-3">
      <label className="text-xs text-gray-300 flex items-center gap-1">
        <input
          type="checkbox"
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        />
        展開所有目標（顯示完整鏈到終點所需）
      </label>
    </div>
  );

  if (!hasAny) {
    const emptyMessage = showAll
      ? '所有目標已達成 — 沒有需要的升級素材。'
      : '沒有設定 target 的升級目標。去「職業詳情」tab 選個想達成的階段就會出現素材需求。';
    return (
      <div>
        {toggle}
        <div className="text-gray-500 text-sm italic py-6 text-center">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const zones: EurekaZone[] = ['anemos', 'pagos', 'pyros', 'hydatos'];

  return (
    <div>
      {toggle}
      <NextEdgeShortage inventory={inventory} materialsMap={materialsMap} />
      <div className="space-y-3">
        {zones.map((zone) => {
          const items: AggregatedMaterial[] = Array.from(zoneAgg[zone]).map(
            ([materialId, totalNeeded]) => {
              const have = inventory.materials[materialId] ?? 0;
              return { materialId, totalNeeded, shortage: Math.max(0, totalNeeded - have) };
            },
          );
          if (items.length === 0) return null;
          return (
            <ZoneGroup key={zone} zone={zone} items={items} materialsMap={materialsMap} />
          );
        })}
      </div>
    </div>
  );
}
