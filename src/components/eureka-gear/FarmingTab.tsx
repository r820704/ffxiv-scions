import { useMemo, useState } from 'react';
import { ZoneGroup } from './ZoneGroup';
import { NextEdgeShortage } from './NextEdgeShortage';
import { Tooltip } from '../ui/Tooltip';
import { costBetween, costBetweenInSequence } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';
import {
  ARMOR_SET_IDS,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  EUREKA_STAGES,
  STAGE_TC_LABEL,
  ZONE_OF_STAGE,
} from '../../types/eureka-gear';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import { JOB_TC_NAME, type JobId } from '../../data/eureka-armor-sets';
import { getAnemosArmorName, getElementalArmorName } from '../../data/eureka-armor-names';
import type {
  ArmorSetId,
  ArmorSlot,
  EurekaInventoryV5,
  EurekaStage,
  EurekaWeapon,
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
  weapons: EurekaWeapon[];
  materialsMap: Record<number, { nameTC: string; icon: number }>;
};

const SLOT_TC: Record<ArmorSlot, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

const SET_SHORT_LABEL: Record<ArmorSetId, string> = {
  fending: '坦克',
  maiming: '近戰（槍/鐮）',
  striking: '近戰（拳/刀）',
  scouting: '近戰（敏捷）',
  aiming: '遠程',
  healing: '治療',
  casting: '法師',
};

type TargetEntry = {
  key: string;
  label: string;
  fromName: string;
  toName: string;
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

function weaponInfoAt(weapons: EurekaWeapon[], chainId: string, stage: EurekaStage) {
  return weapons.find((w) => w.chainId === chainId && w.stage === stage);
}

function computeActiveTargets(
  inv: EurekaInventoryV5,
  weapons: EurekaWeapon[],
  expandAll: boolean,
): { weapons: TargetEntry[]; anemos: TargetEntry[]; elemental: TargetEntry[] } {
  const out = { weapons: [] as TargetEntry[], anemos: [] as TargetEntry[], elemental: [] as TargetEntry[] };

  // Weapons (skip mirrors — shield is rendered alongside main hand entry implicitly)
  for (const [chainId, slot] of Object.entries(inv.weapons) as [string, SlotProgress][]) {
    if (MIRROR_CHAIN_IDS.has(chainId)) continue;
    const target: EurekaStage | undefined = expandAll ? WEAPON_ENDPOINT : slot.targetStage;
    if (!target) continue;
    const fromIdx = EUREKA_STAGES.indexOf(slot.currentStage);
    const toIdx = EUREKA_STAGES.indexOf(target);
    if (toIdx <= fromIdx) continue;
    const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
    if (!chain) continue;
    const fromName = weaponInfoAt(weapons, chainId, slot.currentStage)?.tcName ?? STAGE_TC_LABEL[slot.currentStage];
    const toName = weaponInfoAt(weapons, chainId, target)?.tcName ?? STAGE_TC_LABEL[target];
    out.weapons.push({
      key: `weapon:${chainId}`,
      label: chain.displayName,
      fromName,
      toName,
    });
  }

  // Anemos armor (per-job)
  for (const [job, jobPieces] of Object.entries(inv.armor.anemos)) {
    if (!jobPieces) continue;
    const jobName = JOB_TC_NAME[job as JobId] ?? job;
    for (const slot of ARMOR_SLOTS) {
      const p = jobPieces[slot];
      if (!p) continue;
      const target: EurekaStage | undefined = expandAll ? ANEMOS_ENDPOINT : p.targetStage;
      if (!target) continue;
      const seq = ARMOR_STAGES_BY_TRACK.anemos;
      const fromIdx = seq.indexOf(p.currentStage);
      const toIdx = seq.indexOf(target);
      if (toIdx <= fromIdx) continue;
      const fromName = getAnemosArmorName(job, slot, p.currentStage) ?? STAGE_TC_LABEL[p.currentStage];
      const toName = getAnemosArmorName(job, slot, target) ?? STAGE_TC_LABEL[target];
      out.anemos.push({
        key: `anemos:${job}:${slot}`,
        label: `${jobName} · ${SLOT_TC[slot]}`,
        fromName,
        toName,
      });
    }
  }

  // Elemental armor (per-set)
  for (const setId of ARMOR_SET_IDS) {
    const setData = inv.armor.elemental[setId] ?? {};
    for (const slot of ARMOR_SLOTS) {
      const p = setData[slot];
      if (!p) continue;
      const target: EurekaStage | undefined = expandAll ? ELEMENTAL_ENDPOINT : p.targetStage;
      if (!target) continue;
      const seq = ARMOR_STAGES_BY_TRACK.elemental;
      const fromIdx = seq.indexOf(p.currentStage);
      const toIdx = seq.indexOf(target);
      if (toIdx <= fromIdx) continue;
      const fromName = getElementalArmorName(setId, slot, p.currentStage) ?? STAGE_TC_LABEL[p.currentStage];
      const toName = getElementalArmorName(setId, slot, target) ?? STAGE_TC_LABEL[target];
      out.elemental.push({
        key: `elemental:${setId}:${slot}`,
        label: `[${SET_SHORT_LABEL[setId]}] ${SLOT_TC[slot]}`,
        fromName,
        toName,
      });
    }
  }

  return out;
}

function ActiveTargetsList({ entries }: { entries: ReturnType<typeof computeActiveTargets> }) {
  const [open, setOpen] = useState(true);
  const total = entries.weapons.length + entries.anemos.length + entries.elemental.length;
  if (total === 0) return null;

  const renderGroup = (label: string, colorClass: string, items: TargetEntry[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-0.5">
        <div className={`text-[10px] font-bold ${colorClass}`}>
          {label}（{items.length}）
        </div>
        <ul className="space-y-0.5 pl-2 border-l border-gray-700">
          {items.map((e) => (
            <li key={e.key} className="text-xs text-gray-300 flex flex-wrap gap-x-2">
              <span className="text-gray-200 font-semibold shrink-0">{e.label}</span>
              <span className="text-gray-400">{e.fromName}</span>
              <span className="text-yellow-400">→</span>
              <span className="text-yellow-200">{e.toName}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className="mb-3 rounded border border-gray-700 bg-gray-900/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-3 py-2 flex items-center gap-2 text-sm text-gray-200 hover:bg-gray-800/40 transition-colors"
      >
        <span className="text-gray-500">{open ? '▼' : '▶'}</span>
        <span className="font-semibold">計算對象</span>
        <span className="text-gray-400 text-xs">（{total} 條升級鏈正在累計素材）</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {renderGroup('武器', 'text-yellow-400/90', entries.weapons)}
          {renderGroup('常風防具', 'text-green-400/90', entries.anemos)}
          {renderGroup('元素防具', 'text-cyan-400/90', entries.elemental)}
        </div>
      )}
    </section>
  );
}

export function FarmingTab({ inventory, weapons, materialsMap }: FarmingTabProps) {
  const [showAll, setShowAll] = useState<boolean>(false);
  const zoneAgg = useMemo(
    () => aggregateMaterialsByZone(inventory, { expandAll: showAll }),
    [inventory, showAll],
  );
  const activeTargets = useMemo(
    () => computeActiveTargets(inventory, weapons, showAll),
    [inventory, weapons, showAll],
  );
  const hasAny = Object.values(zoneAgg).some((m) => m.size > 0);

  const toggle = (
    <div className="flex items-center gap-2 mb-3">
      <label className="text-xs text-gray-300 flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        />
        計算完整路徑至終點
      </label>
      <Tooltip label="勾選後，對每條「已有進度」的鏈，不管你是否設了中途目標，一律計算從目前階段升至最終形態所需的全部素材。適合規劃長期所需總量。">
        <button
          type="button"
          aria-label="說明"
          className="w-4 h-4 rounded-full bg-gray-700 text-gray-300 text-[10px] leading-4 text-center hover:bg-gray-600 transition-colors"
        >
          ⓘ
        </button>
      </Tooltip>
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
      <ActiveTargetsList entries={activeTargets} />
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
