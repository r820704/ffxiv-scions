import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StartChainDialog } from './StartChainDialog';
import { ChainStepper } from './ChainStepper';
import { StageListPanel } from './StageListPanel';
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
import {
  ANEMOS_ARMOR_ITEM_LEVELS,
  ELEMENTAL_ARMOR_ITEM_LEVELS,
  getAnemosArmorName,
  getElementalArmorName,
} from '../../data/eureka-armor-names';
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
  EUREKA_STAGES,
  STAGE_ITEM_LEVELS,
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
  onClearChain?: (ref: ChainRef) => void;
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
  onClearChain,
}: DetailTabProps) {
  const progress = useMemo(() => getJobProgress(selectedJob as JobId, inventory), [selectedJob, inventory]);
  const [startDialogRef, setStartDialogRef] = useState<ChainRef | null>(null);
  const [globalArmorExpand, setGlobalArmorExpand] = useState<boolean | null>(null);
  const [resetDialogRef, setResetDialogRef] = useState<{ ref: ChainRef; label: string } | null>(null);

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
                  <div className="flex items-start">
                  <div className="text-gray-100 font-semibold flex-1">
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
                  {isStarted && (
                    <button
                      type="button"
                      aria-label={`重置${chain?.isShield ? '盾' : '主'}手武器進度`}
                      onClick={() => setResetDialogRef({ ref, label: `${chain?.isShield ? '盾' : '主'}手武器` })}
                      className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors px-1 ml-auto"
                      title="重置此武器的所有進度"
                    >
                      重置
                    </button>
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
                <StageListPanel
                  stages={EUREKA_STAGES}
                  currentStage={stepperCurrent}
                  targetStage={p.targetStage}
                  itemLevels={STAGE_ITEM_LEVELS}
                  getItemName={(stage) => weaponInfoAt(weapons, chainId, stage)?.tcName}
                  onSelectTarget={(stage) => onSetTarget(ref, stage === p.currentStage ? undefined : stage)}
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

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">防具欄位：</span>
        <button
          type="button"
          aria-label="展開所有防具欄位"
          onClick={() => setGlobalArmorExpand(true)}
          className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500"
        >
          全展開
        </button>
        <button
          type="button"
          aria-label="收合所有防具欄位"
          onClick={() => setGlobalArmorExpand(false)}
          className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500"
        >
          全收合
        </button>
      </div>

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
        itemLevels={ANEMOS_ARMOR_ITEM_LEVELS}
        materials={inventory.materials}
        materialsMap={materialsMap}
        onSetTarget={onSetTarget}
        onRequestUpgrade={onRequestUpgrade}
        onStartChain={(ref) => setStartDialogRef(ref)}
        onRequestReset={(ref, label) => setResetDialogRef({ ref, label })}
        globalExpand={globalArmorExpand}
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
        itemLevels={ELEMENTAL_ARMOR_ITEM_LEVELS}
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
        onRequestReset={(ref, label) => setResetDialogRef({ ref, label })}
        globalExpand={globalArmorExpand}
      />

      <StartChainDialog
        isOpen={startDialogRef !== null}
        onConfirm={() => {
          if (startDialogRef) onStartChain(startDialogRef);
          setStartDialogRef(null);
        }}
        onCancel={() => setStartDialogRef(null)}
      />

      {resetDialogRef && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-red-600 rounded-lg p-5 max-w-sm">
            <h2 className="text-lg font-bold text-red-400 mb-3">重置此裝備進度</h2>
            <p className="text-sm text-gray-200 mb-4">
              確認要清除「{resetDialogRef.label}」的所有進度紀錄？此操作不可還原。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setResetDialogRef(null)}
                className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resetDialogRef) onClearChain?.(resetDialogRef.ref);
                  setResetDialogRef(null);
                }}
                className="px-3 py-1.5 rounded bg-red-700 text-white text-sm hover:bg-red-600"
              >
                確認重置
              </button>
            </div>
          </div>
        </div>
      )}
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
  itemLevels?: Partial<Record<EurekaStage, number>>;
  sharedHeader?: ReactNode;
  materials: Record<number, number>;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
  onStartChain?: (ref: ChainRef) => void;
  onRequestReset?: (ref: ChainRef, label: string) => void;
  globalExpand?: boolean | null;
};

function ArmorTrackSection({
  title, colorClass, pieces, stages, costs, makeRef, zoneGroups, getItemName, itemLevels, sharedHeader,
  materials, materialsMap, onSetTarget, onRequestUpgrade, onStartChain, onRequestReset, globalExpand,
}: ArmorTrackSectionProps) {
  const [expanded, setExpanded] = useState<Record<ArmorSlot, boolean>>({
    head: true, body: false, hands: false, legs: false, feet: false,
  });
  const [sectionExpanded, setSectionExpanded] = useState(true);

  useEffect(() => {
    if (globalExpand == null) return;
    setExpanded({ head: globalExpand, body: globalExpand, hands: globalExpand, legs: globalExpand, feet: globalExpand });
    setSectionExpanded(globalExpand);
  }, [globalExpand]);

  return (
    <section className="space-y-4">
      <button
        type="button"
        aria-expanded={sectionExpanded}
        aria-label={`${sectionExpanded ? '收合' : '展開'} ${title}`}
        onClick={() => setSectionExpanded((v) => !v)}
        className={`${colorClass} font-bold flex items-center flex-wrap w-full text-left gap-1 hover:opacity-80 transition-opacity`}
      >
        <span className="text-xs text-gray-500 mr-1">{sectionExpanded ? '▼' : '▶'}</span>
        <span>{title}</span>
        {sharedHeader}
      </button>
      {sectionExpanded && (
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
          const currentIL = isStarted ? itemLevels?.[p.currentStage] : undefined;
          const currentStageSuffix = isStarted
            ? `（${STAGE_TC_LABEL[p.currentStage]}${currentIL != null ? ` · iL${currentIL}` : ''}）`
            : '（未開始）';
          const targetIL = p.targetStage ? itemLevels?.[p.targetStage] : undefined;
          const header = (
            <div className="flex items-center text-sm text-gray-100 font-semibold">
              <span className="flex-1">
                {SLOT_TC[slot]}
                {isStarted && currentLabel && (
                  <span className="font-normal ml-2">{currentLabel}</span>
                )}
                <span className="text-xs text-gray-400 font-normal ml-1">
                  {currentStageSuffix}
                </span>
                {p.targetStage && p.targetStage !== p.currentStage && (
                  <>
                    <span className="text-yellow-400 mx-2">→</span>
                    <span className="text-yellow-200">
                      {targetLabel}
                      {targetIL != null && (
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          {`（${STAGE_TC_LABEL[p.targetStage]} · iL${targetIL}）`}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </span>
              {isStarted && (
                <button
                  type="button"
                  aria-label={`重置${SLOT_TC[slot]}防具進度`}
                  onClick={(e) => { e.stopPropagation(); onRequestReset?.(ref, SLOT_TC[slot]); }}
                  className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors px-1 ml-2"
                  title="重置此欄位的所有進度"
                >
                  重置
                </button>
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
                <StageListPanel
                  stages={stages}
                  currentStage={stepperCurrent}
                  targetStage={p.targetStage}
                  itemLevels={itemLevels}
                  getItemName={(stage) => getItemName?.(slot, stage)}
                  onSelectTarget={(stage) => {
                    const r = makeRef(slot);
                    return onSetTarget(r, stage === p.currentStage ? undefined : stage);
                  }}
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
      )}
    </section>
  );
}
