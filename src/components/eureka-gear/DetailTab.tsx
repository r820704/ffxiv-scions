import { useMemo, useState } from 'react';
import { StartChainDialog } from './StartChainDialog';
import { ChainStepper } from './ChainStepper';
import { PreviewPanel } from './PreviewPanel';
import { AccordionItem } from '../ui/Accordion';
import { getJobProgress } from '../../utils/eurekaGear';
import {
  ARMOR_SET_FOR_JOB,
  JOB_TC_NAME,
  JOBS_FOR_ARMOR_SET,
  isArmorSetShared,
  type JobId,
} from '../../data/eureka-armor-sets';
import { Tooltip } from '../ui/Tooltip';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';
import { getAnemosArmorName, getElementalArmorName } from '../../data/eureka-armor-names';
import type { ChainRef } from '../../hooks/useEurekaInventory';
import type {
  ArmorSetId,
  ArmorSlot,
  ArmorZoneGroupDef,
  EurekaInventoryV5,
  EurekaStage,
  EurekaWeapon,
} from '../../types/eureka-gear';
import {
  ANEMOS_ARMOR_ZONE_GROUPS,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  ELEMENTAL_ARMOR_ZONE_GROUPS,
  STAGE_TC_LABEL,
} from '../../types/eureka-gear';

const JOBS = Object.keys(ARMOR_SET_FOR_JOB);

const SLOT_TC: Record<ArmorSlot, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

const JOB_ICON_MODULES = import.meta.glob('../../assets/job-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const JOB_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(JOB_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/([A-Z]+)\.png$/);
    return [match ? match[1] : '', url];
  }),
);

export type DetailTabProps = {
  inventory: EurekaInventoryV5;
  selectedJob: string;
  weapons: EurekaWeapon[];
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSelectJob: (job: string) => void;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
  onStartChain: (ref: ChainRef) => void;
};

function weaponInfoAt(weapons: EurekaWeapon[], chainId: string, stage: EurekaStage) {
  return weapons.find((w) => w.chainId === chainId && w.stage === stage);
}

function SharedJobIcons({ set }: { set: ArmorSetId }) {
  const jobs = JOBS_FOR_ARMOR_SET[set] ?? [];
  if (jobs.length <= 1) return null;
  return (
    <span className="inline-flex items-center gap-1 ml-2">
      <span className="text-xs text-muted-foreground mr-1">共用</span>
      {jobs.map((j) => {
        const tcName = JOB_TC_NAME[j] ?? j;
        const icon = JOB_ICONS[j];
        return (
          <Tooltip key={j} label={tcName}>
            {icon ? (
              <img src={icon} alt={j} className="w-4 h-4 rounded" />
            ) : (
              <span className="text-[10px] px-1 py-0.5 bg-gray-700 rounded">{j}</span>
            )}
          </Tooltip>
        );
      })}
    </span>
  );
}

export function DetailTab({
  inventory,
  selectedJob,
  weapons,
  materialsMap,
  onSelectJob,
  onSetTarget,
  onRequestUpgrade,
  onStartChain,
}: DetailTabProps) {
  const progress = useMemo(() => getJobProgress(selectedJob as JobId, inventory), [selectedJob, inventory]);
  const [startDialogRef, setStartDialogRef] = useState<ChainRef | null>(null);

  const primaryChains = progress.weapons.filter(({ chainId }) => {
    const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
    return !chain?.mirrorsChainId;
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <label className="text-sm text-gray-400" htmlFor="detail-job-select">職業：</label>
        <select
          id="detail-job-select"
          role="combobox"
          value={selectedJob}
          onChange={(e) => onSelectJob(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
        >
          {JOBS.map((j) => (
            <option key={j} value={j}>{JOB_TC_NAME[j as JobId] ?? j}</option>
          ))}
        </select>
      </header>

      {primaryChains.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-yellow-400 font-bold">武器</h3>
          {primaryChains.map(({ chainId, progress: p }) => {
            const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
            const ref: ChainRef = { kind: 'weapon', chainId };
            // A chain is "started" only when it has an explicit slot in inventory;
            // getJobProgress fabricates a default antiquated SlotProgress otherwise.
            const isStarted = inventory.weapons[chainId] !== undefined;
            const stepperCurrent = isStarted ? p.currentStage : null;
            const currentInfo = weaponInfoAt(weapons, chainId, p.currentStage);
            const targetInfo = p.targetStage ? weaponInfoAt(weapons, chainId, p.targetStage) : undefined;
            const currentName = currentInfo?.tcName ?? chain?.displayName ?? chainId;

            const mirrorChains = EUREKA_CHAINS.filter((c) => c.mirrorsChainId === chainId);
            const mirrorInfos = mirrorChains.map((mc) => ({
              chainId: mc.chainId,
              current: weaponInfoAt(weapons, mc.chainId, p.currentStage),
              target: p.targetStage ? weaponInfoAt(weapons, mc.chainId, p.targetStage) : undefined,
              displayName: mc.displayName,
            }));

            const stageSuffix = (info: typeof currentInfo, stage: EurekaStage) =>
              `（${STAGE_TC_LABEL[stage]}${info ? ` · iL${info.itemLevel}` : ''}）`;
            const notStartedSuffix = '（未開始 · 點下方階段標記目標）';

            return (
              <div key={chainId} className="space-y-2 pt-2">
                <div className="space-y-0.5 text-sm">
                  <div className="text-gray-100 font-semibold">
                    {currentName}
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      {isStarted ? stageSuffix(currentInfo, p.currentStage) : notStartedSuffix}
                    </span>
                    {targetInfo && p.targetStage && p.targetStage !== p.currentStage && (
                      <>
                        <span className="text-yellow-400 mx-2">→</span>
                        <span className="text-yellow-200">
                          {targetInfo.tcName}
                          <span className="text-xs text-gray-400 font-normal ml-2">
                            {stageSuffix(targetInfo, p.targetStage)}
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  {mirrorInfos.map((m) => (
                    <div key={m.chainId} className="text-gray-100 font-semibold">
                      {m.current?.tcName ?? m.displayName}
                      <span className="text-xs text-gray-400 font-normal ml-2">
                        {isStarted ? stageSuffix(m.current, p.currentStage) : notStartedSuffix}
                      </span>
                      {m.target && p.targetStage && p.targetStage !== p.currentStage && (
                        <>
                          <span className="text-yellow-400 mx-2">→</span>
                          <span className="text-yellow-200">
                            {m.target.tcName}
                            <span className="text-xs text-gray-400 font-normal ml-2">
                              {stageSuffix(m.target, p.targetStage)}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <ChainStepper
                  currentStage={stepperCurrent}
                  targetStage={p.targetStage}
                  onSelectTarget={(stage) => onSetTarget(ref, stage === p.currentStage ? undefined : stage)}
                  onSelectStart={!isStarted ? () => setStartDialogRef(ref) : undefined}
                />
                <PreviewPanel
                  currentStage={p.currentStage}
                  targetStage={p.targetStage}
                  inventory={inventory.materials}
                  onSetCurrent={() => onRequestUpgrade(ref)}
                  onClearTarget={() => onSetTarget(ref, undefined)}
                  materialsMap={materialsMap}
                />
              </div>
            );
          })}
        </section>
      )}

      {/* 常風系列 — per-job, no shared badge */}
      <ArmorTrackSection
        title="常風系列（外觀專用、不影響戰力）"
        colorClass="text-green-400"
        pieces={progress.anemos}
        stages={ARMOR_STAGES_BY_TRACK.anemos}
        costs={ANEMOS_ARMOR_COSTS}
        zoneGroups={ANEMOS_ARMOR_ZONE_GROUPS}
        makeRef={(slot) => ({ kind: 'armor-anemos', job: selectedJob as JobId, slot })}
        getItemName={(slot, stage) => getAnemosArmorName(selectedJob, slot, stage)}
        materials={inventory.materials}
        materialsMap={materialsMap}
        onSetTarget={onSetTarget}
        onRequestUpgrade={onRequestUpgrade}
        onStartChain={(ref) => setStartDialogRef(ref)}
      />

      {/* 元素系列 — per-role, shared badge */}
      <ArmorTrackSection
        title="元素系列（戰鬥用）"
        colorClass="text-cyan-400"
        pieces={progress.elemental.pieces}
        stages={ARMOR_STAGES_BY_TRACK.elemental}
        costs={ELEMENTAL_ARMOR_COSTS}
        zoneGroups={ELEMENTAL_ARMOR_ZONE_GROUPS}
        makeRef={(slot) => ({ kind: 'armor-elemental', set: progress.elemental.set, slot })}
        getItemName={(slot, stage) => getElementalArmorName(progress.elemental.set, slot, stage)}
        sharedHeader={
          isArmorSetShared(progress.elemental.set)
            ? <SharedJobIcons set={progress.elemental.set} />
            : null
        }
        materials={inventory.materials}
        materialsMap={materialsMap}
        onSetTarget={onSetTarget}
        onRequestUpgrade={onRequestUpgrade}
        onStartChain={(ref) => setStartDialogRef(ref)}
      />

      <StartChainDialog
        isOpen={startDialogRef !== null}
        onConfirm={() => {
          if (startDialogRef) onStartChain(startDialogRef);
          setStartDialogRef(null);
        }}
        onCancel={() => setStartDialogRef(null)}
      />
    </div>
  );
}

type ArmorTrackSectionProps = {
  title: string;
  colorClass: string;
  pieces: Partial<Record<ArmorSlot, { currentStage: EurekaStage; targetStage?: EurekaStage }>>;
  stages: EurekaStage[];
  costs: typeof ANEMOS_ARMOR_COSTS;
  makeRef: (slot: ArmorSlot) => ChainRef;
  zoneGroups?: readonly ArmorZoneGroupDef[];
  getItemName?: (slot: ArmorSlot, stage: EurekaStage) => string | undefined;
  sharedHeader?: React.ReactNode;
  materials: Record<number, number>;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
  onStartChain?: (ref: ChainRef) => void;
};

function ArmorTrackSection({
  title, colorClass, pieces, stages, costs, makeRef, zoneGroups, getItemName, sharedHeader,
  materials, materialsMap, onSetTarget, onRequestUpgrade, onStartChain,
}: ArmorTrackSectionProps) {
  const [expanded, setExpanded] = useState<Record<ArmorSlot, boolean>>({
    head: true, body: false, hands: false, legs: false, feet: false,
  });
  return (
    <section className="space-y-4">
      <h3 className={`${colorClass} font-bold flex items-center flex-wrap`}>
        <span>{title}</span>
        {sharedHeader}
      </h3>
      <div className="space-y-3 pl-2 border-l-2 border-gray-700">
        {ARMOR_SLOTS.map((slot) => {
          const slotData = pieces[slot];
          const isStarted = slotData !== undefined;
          const p = slotData ?? { currentStage: 'antiquated' as const };
          const stepperCurrent = isStarted ? p.currentStage : null;
          const ref = makeRef(slot);
          const currentLabel = isStarted
            ? (getItemName?.(slot, p.currentStage) ?? STAGE_TC_LABEL[p.currentStage])
            : undefined;
          const targetLabel = p.targetStage
            ? (getItemName?.(slot, p.targetStage) ?? STAGE_TC_LABEL[p.targetStage])
            : undefined;
          const header = (
            <div className="text-sm text-gray-100 font-semibold">
              {SLOT_TC[slot]}
              <span className="text-xs text-gray-400 font-normal ml-2">
                {isStarted ? `（${currentLabel}）` : '（未開始）'}
              </span>
              {p.targetStage && p.targetStage !== p.currentStage && (
                <>
                  <span className="text-yellow-400 mx-2">→</span>
                  <span className="text-yellow-200">
                    {targetLabel}
                  </span>
                </>
              )}
            </div>
          );
          return (
            <AccordionItem
              key={slot}
              expanded={expanded[slot]}
              onToggle={() => setExpanded((prev) => ({ ...prev, [slot]: !prev[slot] }))}
              header={header}
            >
              <div className="space-y-2">
                <ChainStepper
                  currentStage={stepperCurrent}
                  targetStage={p.targetStage}
                  stages={stages}
                  zoneGroups={zoneGroups}
                  onSelectTarget={(stage) =>
                    onSetTarget(ref, stage === p.currentStage ? undefined : stage)
                  }
                  onSelectStart={!isStarted ? () => onStartChain?.(ref) : undefined}
                />
                <PreviewPanel
                  currentStage={p.currentStage}
                  targetStage={p.targetStage}
                  inventory={materials}
                  onSetCurrent={() => onRequestUpgrade(ref)}
                  onClearTarget={() => onSetTarget(ref, undefined)}
                  materialsMap={materialsMap}
                  stages={stages}
                  costs={costs}
                  slot={slot}
                  currentLabel={currentLabel}
                  targetLabel={targetLabel}
                />
              </div>
            </AccordionItem>
          );
        })}
      </div>
    </section>
  );
}
