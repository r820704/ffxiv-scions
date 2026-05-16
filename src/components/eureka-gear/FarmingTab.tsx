import { useMemo, useState } from 'react';
import { ZoneGroup } from './ZoneGroup';
// NextEdgeShortage card is removed from the layout (the current hint wasn't
// giving players enough actionable info). Component + tests preserved in
// ./NextEdgeShortage.tsx for a future redesign.
import { Tooltip } from '../ui/Tooltip';
import { useLocalStorageBool } from '@/hooks/useLocalStorageBool';
import { costBetweenInSequence, notesBetweenInSequence } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';
import {
  ARMOR_SET_IDS,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  EUREKA_STAGES,
  MATERIAL_ZONE,
  STAGE_ITEM_LEVELS,
  STAGE_TC_LABEL,
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
  fromIl: number;
  toIl: number;
};

type AggregatedMaterial = { materialId: number; totalNeeded: number; shortage: number };

type ZoneAgg = Record<EurekaZone, Map<number, number>>;

type AggOpts = { expandAll: boolean };

/**
 * Bucket each material into its source zone (where players farm it).
 * Materials without a known zone are skipped — keeps the farming list honest.
 */
function addMaterials(agg: ZoneAgg, materials: MaterialCost[]) {
  for (const m of materials) {
    const zone = MATERIAL_ZONE[m.materialId];
    if (!zone) continue;
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
    // currentStage undefined（尚未取得舊化）視為 antiquated 起算成本
    const effectiveFrom: EurekaStage = slot.currentStage ?? 'antiquated';
    addMaterials(agg, costBetweenInSequence(effectiveFrom, target, EUREKA_STAGES, STAGE_UPGRADE_COSTS));
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
      const effectiveFrom: EurekaStage = p.currentStage ?? 'antiquated';
      addMaterials(agg, costBetweenInSequence(effectiveFrom, target, ARMOR_STAGES_BY_TRACK.anemos, ANEMOS_ARMOR_COSTS, slot));
    }
  }
  // Elemental armor: per-role.
  // currentStage undefined → start from 'antiquated' so the antiquated→elemental
  // edge (40 Pyros Crystal) gets included. costBetweenInSequence handles the
  // from-not-in-sequence case by prepending it transparently.
  for (const setId of ARMOR_SET_IDS) {
    const setData = inv.armor.elemental[setId] ?? {};
    for (const slot of ARMOR_SLOTS) {
      const p = setData[slot];
      if (!p) continue;
      const target: EurekaStage | undefined = opts.expandAll ? ELEMENTAL_ENDPOINT : p.targetStage;
      if (!target) continue;
      const effectiveFrom: EurekaStage = p.currentStage ?? 'antiquated';
      addMaterials(agg, costBetweenInSequence(effectiveFrom, target, ARMOR_STAGES_BY_TRACK.elemental, ELEMENTAL_ARMOR_COSTS, slot));
    }
  }
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
    const effectiveFrom: EurekaStage = slot.currentStage ?? 'antiquated';
    const fromIdx = EUREKA_STAGES.indexOf(effectiveFrom);
    const toIdx = EUREKA_STAGES.indexOf(target);
    if (toIdx <= fromIdx) continue;
    const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
    if (!chain) continue;
    // currentStage undefined → fromName 顯示「未開始」（跟 DetailTab 一致）；
    // fromIl 仍以 antiquated 給數值，方便 UI 顯示「→ iL355」的對比。
    const fromName = slot.currentStage === undefined
      ? '未開始'
      : (weaponInfoAt(weapons, chainId, effectiveFrom)?.tcName ?? STAGE_TC_LABEL[effectiveFrom]);
    const toName = weaponInfoAt(weapons, chainId, target)?.tcName ?? STAGE_TC_LABEL[target];
    out.weapons.push({
      key: `weapon:${chainId}`,
      label: chain.displayName,
      fromName,
      toName,
      fromIl: STAGE_ITEM_LEVELS[effectiveFrom],
      toIl: STAGE_ITEM_LEVELS[target],
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
      const effectiveFrom: EurekaStage = p.currentStage ?? 'antiquated';
      const fromIdx = seq.indexOf(effectiveFrom);
      const toIdx = seq.indexOf(target);
      if (toIdx <= fromIdx) continue;
      const fromName = p.currentStage === undefined
        ? '未開始'
        : (getAnemosArmorName(job, slot, effectiveFrom) ?? STAGE_TC_LABEL[effectiveFrom]);
      const toName = getAnemosArmorName(job, slot, target) ?? STAGE_TC_LABEL[target];
      out.anemos.push({
        key: `anemos:${job}:${slot}`,
        label: `${jobName} · ${SLOT_TC[slot]}`,
        fromName,
        toName,
        fromIl: STAGE_ITEM_LEVELS[effectiveFrom],
        toIl: STAGE_ITEM_LEVELS[target],
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
      const effectiveFrom: EurekaStage = p.currentStage ?? 'elemental';
      const fromIdx = seq.indexOf(effectiveFrom);
      const toIdx = seq.indexOf(target);
      if (toIdx <= fromIdx) continue;
      const fromName = p.currentStage === undefined
        ? '未開始'
        : (getElementalArmorName(setId, slot, effectiveFrom) ?? STAGE_TC_LABEL[effectiveFrom]);
      const toName = getElementalArmorName(setId, slot, target) ?? STAGE_TC_LABEL[target];
      out.elemental.push({
        key: `elemental:${setId}:${slot}`,
        label: `[${SET_SHORT_LABEL[setId]}] ${SLOT_TC[slot]}`,
        fromName,
        toName,
        fromIl: STAGE_ITEM_LEVELS[effectiveFrom],
        toIl: STAGE_ITEM_LEVELS[target],
      });
    }
  }

  return out;
}

type PrereqEntry =
  | { kind: 'item'; key: string; name: string; obtainMethod: string }
  | { kind: 'condition'; key: string; text: string };

/**
 * Collects 前置條件 for chains whose currentStage is undefined and have a target.
 *
 * Two kinds of entries:
 * - `item` (📜) — a physical prereq item (e.g. 舊化的XX, obtained from AF quest)
 * - `condition` (📋) — a non-item gate sourced from cost-edge `notes` along
 *   the planned upgrade path (e.g. "需收集 50 個文理技能圖鑑", "需解鎖 56 個…")
 *
 * Condition rows are walked per chain so they only appear when the relevant
 * edges will actually be traversed (e.g. someone already at `elemental` won't
 * see the antiquated→elemental entry condition).
 */
function computePrereqItems(inv: EurekaInventoryV5, weapons: EurekaWeapon[]): PrereqEntry[] {
  const out: PrereqEntry[] = [];
  const AF_METHOD = '完成70級職業任務或從失物管理人兌換取得';

  // Weapons: include primary + mirror chains' antiquated items
  for (const [chainId, slot] of Object.entries(inv.weapons) as [string, SlotProgress][]) {
    if (MIRROR_CHAIN_IDS.has(chainId)) continue;
    if (slot.currentStage !== undefined) continue;
    if (!slot.targetStage) continue;
    const primaryAnt = weaponInfoAt(weapons, chainId, 'antiquated');
    if (primaryAnt) {
      out.push({ kind: 'item', key: `weapon-prereq:${chainId}`, name: primaryAnt.tcName, obtainMethod: AF_METHOD });
    }
    const mirrors = EUREKA_CHAINS.filter((c) => c.mirrorsChainId === chainId);
    for (const mc of mirrors) {
      const mAnt = weaponInfoAt(weapons, mc.chainId, 'antiquated');
      if (mAnt) {
        out.push({ kind: 'item', key: `weapon-prereq:${mc.chainId}`, name: mAnt.tcName, obtainMethod: AF_METHOD });
      }
    }
  }

  // Anemos armor: antiquated AF set piece per slot
  for (const [job, jobPieces] of Object.entries(inv.armor.anemos)) {
    if (!jobPieces) continue;
    for (const slotName of ARMOR_SLOTS) {
      const p = jobPieces[slotName];
      if (!p) continue;
      if (p.currentStage !== undefined) continue;
      if (!p.targetStage) continue;
      const name = getAnemosArmorName(job, slotName, 'antiquated') ?? STAGE_TC_LABEL['antiquated'];
      out.push({ kind: 'item', key: `anemos-prereq:${job}:${slotName}`, name, obtainMethod: AF_METHOD });
    }
  }

  // Condition rows: walk every chain with a target, collect edge notes along
  // the planned path. Dedup happens later via the shared `seen` set.
  const addConditions = (notes: string[]) => {
    for (const n of notes) {
      out.push({ kind: 'condition', key: `cond:${n}`, text: n });
    }
  };
  for (const [chainId, slot] of Object.entries(inv.weapons) as [string, SlotProgress][]) {
    if (MIRROR_CHAIN_IDS.has(chainId)) continue;
    if (!slot.targetStage) continue;
    const from: EurekaStage = slot.currentStage ?? 'antiquated';
    addConditions(notesBetweenInSequence(from, slot.targetStage, EUREKA_STAGES, STAGE_UPGRADE_COSTS));
  }
  for (const [_job, jobPieces] of Object.entries(inv.armor.anemos)) {
    if (!jobPieces) continue;
    for (const slotName of ARMOR_SLOTS) {
      const p = jobPieces[slotName];
      if (!p?.targetStage) continue;
      const from: EurekaStage = p.currentStage ?? 'antiquated';
      addConditions(notesBetweenInSequence(from, p.targetStage, ARMOR_STAGES_BY_TRACK.anemos, ANEMOS_ARMOR_COSTS, slotName));
    }
  }
  for (const setId of ARMOR_SET_IDS) {
    const setData = inv.armor.elemental[setId] ?? {};
    for (const slotName of ARMOR_SLOTS) {
      const p = setData[slotName];
      if (!p?.targetStage) continue;
      const from: EurekaStage = p.currentStage ?? 'antiquated';
      addConditions(notesBetweenInSequence(from, p.targetStage, ARMOR_STAGES_BY_TRACK.elemental, ELEMENTAL_ARMOR_COSTS, slotName));
    }
  }

  // De-duplicate: item rows by (name, obtainMethod); condition rows by text.
  const seen = new Set<string>();
  return out.filter((e) => {
    const k = e.kind === 'item' ? `item::${e.name}::${e.obtainMethod}` : `cond::${e.text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
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
              <span className="text-gray-400">{e.fromName} (iL {e.fromIl})</span>
              <span className="text-yellow-400">→</span>
              <span className="text-yellow-200">{e.toName} (iL {e.toIl})</span>
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

function PrereqList({ items }: { items: PrereqEntry[] }) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;
  return (
    <div className="mb-3 rounded border border-gray-700 bg-gray-900/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-3 py-2 text-left flex items-center gap-2 text-sm hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-gray-500 text-xs">{open ? '▼' : '▶'}</span>
        <span className="text-yellow-400 font-semibold">📜 前置條件</span>
        <span className="text-xs text-gray-500">（{items.length} 項）</span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1 text-xs">
          {items.map((it) => (
            it.kind === 'item' ? (
              <li key={it.key} className="flex items-baseline gap-2 text-gray-300">
                <span aria-hidden="true" className="shrink-0">📜</span>
                <span className="font-medium">{it.name}</span>
                <span className="text-gray-500">× 1</span>
                <span className="text-gray-400 text-[11px]">（{it.obtainMethod}）</span>
              </li>
            ) : (
              <li key={it.key} className="flex items-baseline gap-2 text-gray-300">
                <span aria-hidden="true" className="shrink-0">📋</span>
                <span>{it.text}</span>
              </li>
            )
          ))}
        </ul>
      )}
    </div>
  );
}

export function FarmingTab({ inventory, weapons, materialsMap }: FarmingTabProps) {
  const [showAll, setShowAll] = useLocalStorageBool('eureka-gear-farming-expand-all', false);
  const zoneAgg = useMemo(
    () => aggregateMaterialsByZone(inventory, { expandAll: showAll }),
    [inventory, showAll],
  );
  const activeTargets = useMemo(
    () => computeActiveTargets(inventory, weapons, showAll),
    [inventory, weapons, showAll],
  );
  const prereqItems = useMemo(
    () => computePrereqItems(inventory, weapons),
    [inventory, weapons],
  );
  const hasAny = Object.values(zoneAgg).some((m) => m.size > 0) || prereqItems.length > 0;

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
      <PrereqList items={prereqItems} />
      <ActiveTargetsList entries={activeTargets} />
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
