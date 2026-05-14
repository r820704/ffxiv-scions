import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChainStepper } from './ChainStepper';
import { StageListPanel } from './StageListPanel';
import { PreviewPanel } from './PreviewPanel';
import { AccordionItem } from '../ui/Accordion';
import { getJobProgress } from '../../utils/eurekaGear';
import {
  JOB_TC_NAME,
  JOBS_FOR_ARMOR_SET,
  isArmorSetShared,
  type JobId,
} from '../../data/eureka-armor-sets';
import { ROLE_LABELS, ROLE_COLORS } from '../../types/eureka';
import { Button } from '@/components/ui/button';
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
  SlotProgress,
} from '../../types/eureka-gear';
import {
  ANEMOS_ARMOR_ZONE_GROUPS,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  ELEMENTAL_ARMOR_GLOW_STAGES,
  ELEMENTAL_ARMOR_ZONE_GROUPS,
  EUREKA_STAGES,
  STAGE_ITEM_LEVELS,
  STAGE_TC_LABEL,
  WEAPON_GLOW_STAGES,
} from '../../types/eureka-gear';

const SLOT_TC: Record<ArmorSlot, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

type RoleGroupId = 'tank' | 'melee' | 'ranged' | 'healer' | 'caster';

const JOB_ROLE_GROUPS: ReadonlyArray<{ id: RoleGroupId; jobs: JobId[] }> = [
  { id: 'tank',   jobs: ['PLD', 'WAR', 'DRK'] },
  { id: 'melee',  jobs: ['MNK', 'DRG', 'NIN', 'SAM'] },
  { id: 'ranged', jobs: ['BRD', 'MCH'] },
  { id: 'healer', jobs: ['WHM', 'SCH', 'AST'] },
  { id: 'caster', jobs: ['BLM', 'SMN', 'RDM'] },
];

function JobPickerPanel({
  selectedJob,
  onSelectJob,
}: {
  selectedJob: string;
  onSelectJob: (job: string) => void;
}) {
  return (
    <aside
      aria-label="職業選擇"
      className="rounded-lg border border-gray-700 bg-gray-900/40 p-3 space-y-2.5"
    >
      <h3 className="text-sm font-bold text-gray-200">職業</h3>
      {JOB_ROLE_GROUPS.map((group) => (
        <div key={group.id} className="space-y-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${ROLE_COLORS[group.id]}`}>
            {ROLE_LABELS[group.id]}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {group.jobs.map((j) => {
              const tcName = JOB_TC_NAME[j] ?? j;
              const icon = JOB_ICONS[j];
              const active = selectedJob === j;
              return (
                <button
                  key={j}
                  type="button"
                  aria-pressed={active}
                  aria-label={tcName}
                  onClick={() => onSelectJob(j)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                    active
                      ? 'bg-primary/20 text-primary ring-2 ring-primary'
                      : 'bg-secondary/60 text-gray-200 hover:bg-secondary'
                  }`}
                >
                  {icon ? (
                    <img src={icon} alt="" className="w-4 h-4 rounded shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded bg-gray-700 text-[9px] flex items-center justify-center shrink-0">{j}</span>
                  )}
                  <span>{tcName}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}

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
  onClearChain?: (ref: ChainRef) => void;
};

function weaponInfoAt(weapons: EurekaWeapon[], chainId: string, stage: EurekaStage) {
  return weapons.find((w) => w.chainId === chainId && w.stage === stage);
}

function SharedJobIcons({ set }: { set: ArmorSetId }) {
  const jobs = JOBS_FOR_ARMOR_SET[set] ?? [];
  if (jobs.length <= 1) return null;
  return (
    <span className="inline-flex items-center flex-wrap gap-x-2 gap-y-1 ml-2">
      <span className="text-xs text-muted-foreground">共用</span>
      {jobs.map((j) => {
        const tcName = JOB_TC_NAME[j] ?? j;
        const icon = JOB_ICONS[j];
        return (
          <span key={j} className="inline-flex items-center gap-1 text-xs text-foreground/80 font-normal">
            {icon ? (
              <img src={icon} alt="" className="w-4 h-4 rounded" />
            ) : (
              <span className="text-[10px] px-1 py-0.5 bg-gray-700 rounded">{j}</span>
            )}
            <span>{tcName}</span>
          </span>
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
  onClearChain,
}: DetailTabProps) {
  const progress = useMemo(() => getJobProgress(selectedJob as JobId, inventory), [selectedJob, inventory]);
  const [globalArmorExpand, setGlobalArmorExpand] = useState<{ rev: number; expand: boolean } | null>(null);
  const [resetDialogRef, setResetDialogRef] = useState<{ ref: ChainRef; label: string } | null>(null);
  const [weaponExpanded, setWeaponExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWeaponExpanded({});
  }, [selectedJob]);

  const primaryChains = progress.weapons.filter(({ chainId }) => {
    const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
    return !chain?.mirrorsChainId;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 lg:gap-6 items-start">
        {primaryChains.length > 0 ? (
          <section className="space-y-2 lg:order-1 order-2 min-w-0">
            <h3 className="text-yellow-400 font-bold">武器</h3>
          {primaryChains.map(({ chainId, progress: p }) => {
            const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
            const ref: ChainRef = { kind: 'weapon', chainId };
            // 「已開始」= 已取得 antiquated（currentStage 已定義）
            const isStarted = p.currentStage !== undefined;
            const stepperCurrent: EurekaStage | undefined = p.currentStage;
            const currentInfo = isStarted ? weaponInfoAt(weapons, chainId, p.currentStage!) : undefined;
            const targetInfo = p.targetStage ? weaponInfoAt(weapons, chainId, p.targetStage) : undefined;
            const slotLabel = chain?.isShield ? '盾' : '主手';

            const mirrorChains = EUREKA_CHAINS.filter((c) => c.mirrorsChainId === chainId);
            const mirrorInfos = mirrorChains.map((mc) => ({
              chainId: mc.chainId,
              chain: mc,
              current: isStarted ? weaponInfoAt(weapons, mc.chainId, p.currentStage!) : undefined,
              target: p.targetStage ? weaponInfoAt(weapons, mc.chainId, p.targetStage) : undefined,
            }));

            // 「0 階」前置道具：主鏈 + 鏡像鏈各自的舊化裝備
            const antiquatedItems: { name: string; obtainMethod?: string }[] = [];
            const primaryAntiquated = weaponInfoAt(weapons, chainId, 'antiquated');
            if (primaryAntiquated) {
              antiquatedItems.push({
                name: primaryAntiquated.tcName,
                obtainMethod: '完成70級職業任務或從失物管理人兌換取得',
              });
            }
            for (const mc of mirrorChains) {
              const mAnt = weaponInfoAt(weapons, mc.chainId, 'antiquated');
              if (mAnt) {
                antiquatedItems.push({
                  name: mAnt.tcName,
                  obtainMethod: '完成70級職業任務或從失物管理人兌換取得',
                });
              }
            }

            const stageSuffix = (info: typeof currentInfo, stage: EurekaStage) =>
              `（${STAGE_TC_LABEL[stage]}${info ? ` · iL${info.itemLevel}` : ''}）`;

            const isExpanded = weaponExpanded[chainId] ?? true;
            const hasEntry = inventory.weapons[chainId] !== undefined;

            // Unified click handler — works for both 0階 and started states.
            // Click currentStage = clear target (undefined); click else = set target.
            const handleSelectStage = (stage: EurekaStage) => {
              if (p.currentStage !== undefined && stage === p.currentStage) {
                onSetTarget(ref, undefined);
              } else {
                onSetTarget(ref, stage);
              }
            };

            const weaponHeader = (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-sm">
                <span className="text-gray-100 font-semibold flex items-center gap-1">
                  <span className="text-yellow-400/70">{slotLabel}</span>
                  {isStarted && currentInfo && (
                    <span className="font-normal">{currentInfo.tcName}</span>
                  )}
                  <span className="text-xs text-gray-400 font-normal">
                    {isStarted ? stageSuffix(currentInfo, p.currentStage!) : '未開始'}
                  </span>
                  {targetInfo && p.targetStage && p.targetStage !== p.currentStage && (
                    <>
                      <span className="text-yellow-400">→</span>
                      <span className="text-yellow-200 font-normal">{targetInfo.tcName}</span>
                      <span className="text-xs text-gray-400 font-normal">{stageSuffix(targetInfo, p.targetStage)}</span>
                    </>
                  )}
                </span>
                {mirrorInfos.map((m) => (
                  <span key={m.chainId} className="text-gray-100 font-semibold flex items-center gap-1">
                    <span className="text-yellow-400/70">{m.chain.isShield ? '盾' : '主手'}</span>
                    {isStarted && m.current && (
                      <span className="font-normal">{m.current.tcName}</span>
                    )}
                    <span className="text-xs text-gray-400 font-normal">
                      {isStarted ? stageSuffix(m.current, p.currentStage!) : '未開始'}
                    </span>
                    {m.target && p.targetStage && p.targetStage !== p.currentStage && (
                      <>
                        <span className="text-yellow-400">→</span>
                        <span className="text-yellow-200 font-normal">{m.target.tcName}</span>
                        <span className="text-xs text-gray-400 font-normal">{stageSuffix(m.target, p.targetStage)}</span>
                      </>
                    )}
                  </span>
                ))}
                {hasEntry && (
                  <button
                    type="button"
                    aria-label={`重置${slotLabel}武器進度`}
                    onClick={(e) => { e.stopPropagation(); setResetDialogRef({ ref, label: `${slotLabel}武器` }); }}
                    className="text-[10px] px-2 py-0.5 rounded border border-red-900/50 text-red-400/60 hover:text-red-300 hover:border-red-500 transition-colors ml-auto shrink-0"
                  >
                    重置
                  </button>
                )}
              </div>
            );

            return (
              <AccordionItem
                key={chainId}
                expanded={isExpanded}
                onToggle={() => setWeaponExpanded((prev) => ({ ...prev, [chainId]: !isExpanded }))}
                header={weaponHeader}
              >
                <div className="space-y-2">
                  <ChainStepper
                    currentStage={stepperCurrent}
                    targetStage={p.targetStage}
                    glowStages={WEAPON_GLOW_STAGES}
                    onSelectTarget={handleSelectStage}
                  />
                  <StageListPanel
                    stages={EUREKA_STAGES}
                    currentStage={stepperCurrent}
                    targetStage={p.targetStage}
                    itemLevels={STAGE_ITEM_LEVELS}
                    getItemName={(stage) => weaponInfoAt(weapons, chainId, stage)?.tcName}
                    onSelectTarget={handleSelectStage}
                  />
                  <PreviewPanel
                    currentStage={p.currentStage}
                    targetStage={p.targetStage}
                    inventory={inventory.materials}
                    onSetCurrent={() => onRequestUpgrade(ref)}
                    onClearTarget={() => onSetTarget(ref, undefined)}
                    materialsMap={materialsMap}
                    currentLabel={currentInfo?.tcName}
                    targetLabel={targetInfo?.tcName}
                    prereqRows={antiquatedItems}
                  />
                </div>
              </AccordionItem>
            );
          })}
        </section>
        ) : (
          <div className="lg:order-1 order-2 min-w-0" />
        )}
        <div className="lg:order-2 order-1">
          <JobPickerPanel selectedJob={selectedJob} onSelectJob={onSelectJob} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">防具欄位：</span>
        <button
          type="button"
          aria-label="展開所有防具欄位"
          onClick={() => setGlobalArmorExpand((prev) => ({ rev: (prev?.rev ?? 0) + 1, expand: true }))}
          className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500"
        >
          全展開
        </button>
        <button
          type="button"
          aria-label="收合所有防具欄位"
          onClick={() => setGlobalArmorExpand((prev) => ({ rev: (prev?.rev ?? 0) + 1, expand: false }))}
          className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500"
        >
          全收合
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {/* 常風防具 — per-job, no shared badge */}
      <ArmorTrackSection
        title="常風防具"
        colorClass="text-green-400"
        slotColorClass="text-green-400/70"
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
        onRequestReset={(ref, label) => setResetDialogRef({ ref, label })}
        globalExpand={globalArmorExpand}
        getPrereqRows={(slot) => {
          const name = getAnemosArmorName(selectedJob, slot, 'antiquated') ?? STAGE_TC_LABEL['antiquated'];
          return [{ name, obtainMethod: '完成70級職業任務或從失物管理人兌換取得' }];
        }}
      />

      {/* 元素防具 — per-role, shared badge */}
      <ArmorTrackSection
        title="元素防具"
        colorClass="text-cyan-400"
        slotColorClass="text-cyan-400/70"
        pieces={progress.elemental.pieces}
        stages={ARMOR_STAGES_BY_TRACK.elemental}
        costs={ELEMENTAL_ARMOR_COSTS}
        zoneGroups={ELEMENTAL_ARMOR_ZONE_GROUPS}
        makeRef={(slot) => ({ kind: 'armor-elemental', set: progress.elemental.set, slot })}
        getItemName={(slot, stage) => getElementalArmorName(progress.elemental.set, slot, stage)}
        itemLevels={ELEMENTAL_ARMOR_ITEM_LEVELS}
        glowStages={ELEMENTAL_ARMOR_GLOW_STAGES}
        sharedHeader={
          isArmorSetShared(progress.elemental.set)
            ? <SharedJobIcons set={progress.elemental.set} />
            : null
        }
        materials={inventory.materials}
        materialsMap={materialsMap}
        onSetTarget={onSetTarget}
        onRequestUpgrade={onRequestUpgrade}
        onRequestReset={(ref, label) => setResetDialogRef({ ref, label })}
        globalExpand={globalArmorExpand}
        getPrereqRows={(slot) => {
          // 元素防具：antiquated 起點（AF 套裝）作為前置道具，前置條件文字寫在 obtainMethod
          const antName = getAnemosArmorName(selectedJob, slot, 'antiquated') ?? STAGE_TC_LABEL['antiquated'];
          return [{
            name: antName,
            obtainMethod: '前置：持有 70 級職業套裝、解鎖 50 個文理技能圖鑑、至少擁有一件元素武器',
          }];
        }}
      />
      </div>

      {resetDialogRef && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-red-600 rounded-lg p-5 max-w-sm">
            <h2 className="text-lg font-bold text-red-400 mb-3">重置此裝備進度</h2>
            <p className="text-sm text-gray-200 mb-4">
              確認要清除「{resetDialogRef.label}」的所有進度紀錄？此操作不可還原。
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetDialogRef(null)}
              >
                取消
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (resetDialogRef) onClearChain?.(resetDialogRef.ref);
                  setResetDialogRef(null);
                }}
              >
                確認重置
              </Button>
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
  slotColorClass: string;
  pieces: Partial<Record<ArmorSlot, SlotProgress>>;
  stages: EurekaStage[];
  costs: typeof ANEMOS_ARMOR_COSTS;
  makeRef: (slot: ArmorSlot) => ChainRef;
  zoneGroups?: readonly ArmorZoneGroupDef[];
  getItemName?: (slot: ArmorSlot, stage: EurekaStage) => string | undefined;
  itemLevels?: Partial<Record<EurekaStage, number>>;
  sharedHeader?: ReactNode;
  glowStages?: ReadonlySet<EurekaStage>;
  materials: Record<number, number>;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
  onRequestReset?: (ref: ChainRef, label: string) => void;
  globalExpand?: { rev: number; expand: boolean } | null;
  /**
   * Returns prereq item rows for a given slot (e.g. anemos armor → 舊化的XX頭 + obtain method).
   * Only used when currentStage is undefined. Return [] to skip.
   */
  getPrereqRows?: (slot: ArmorSlot) => Array<{ name: string; obtainMethod?: string }>;
};

function ArmorTrackSection({
  title, colorClass, slotColorClass, pieces, stages, costs, makeRef, zoneGroups, getItemName, itemLevels, sharedHeader, glowStages,
  materials, materialsMap, onSetTarget, onRequestUpgrade, onRequestReset, globalExpand, getPrereqRows,
}: ArmorTrackSectionProps) {
  const [expanded, setExpanded] = useState<Record<ArmorSlot, boolean>>({
    head: false, body: false, hands: false, legs: false, feet: false,
  });
  const [sectionExpanded, setSectionExpanded] = useState(true);

  useEffect(() => {
    if (globalExpand == null) return;
    const v = globalExpand.expand;
    setExpanded({ head: v, body: v, hands: v, legs: v, feet: v });
    setSectionExpanded(v);
  }, [globalExpand]);

  return (
    <section className="space-y-4">
      <button
        type="button"
        aria-expanded={sectionExpanded}
        aria-label={`${sectionExpanded ? '收合' : '展開'} ${title}`}
        onClick={() => setSectionExpanded((v) => !v)}
        className={`${colorClass} font-bold flex items-center flex-wrap w-full text-left gap-x-3 gap-y-1 hover:opacity-80 transition-opacity`}
      >
        <span className="text-xs text-gray-500 mr-1">{sectionExpanded ? '▼' : '▶'}</span>
        <span>{title}</span>
        {sharedHeader}
      </button>
      {sectionExpanded && (
      <div className="space-y-3 pl-2 border-l-2 border-gray-700">
        {ARMOR_SLOTS.map((slot) => {
          const slotData = pieces[slot];
          const isStarted = slotData?.currentStage !== undefined;
          const ref = makeRef(slot);
          const currentItemName = isStarted ? getItemName?.(slot, slotData!.currentStage!) : undefined;
          const currentLabel = currentItemName ?? (isStarted ? STAGE_TC_LABEL[slotData!.currentStage!] : undefined);
          const targetLabel = slotData?.targetStage
            ? (getItemName?.(slot, slotData.targetStage) ?? STAGE_TC_LABEL[slotData.targetStage])
            : undefined;
          const currentIL = isStarted ? itemLevels?.[slotData!.currentStage!] : undefined;
          const currentStageSuffix = isStarted
            ? `（${STAGE_TC_LABEL[slotData!.currentStage!]}${currentIL != null ? ` · iL${currentIL}` : ''}）`
            : '（未開始）';
          const targetIL = slotData?.targetStage ? itemLevels?.[slotData.targetStage] : undefined;
          const hasEntry = slotData !== undefined;

          // Unified click handler — click currentStage = clear target; click else = set target.
          const handleSelectStage = (stage: EurekaStage) => {
            if (slotData?.currentStage !== undefined && stage === slotData.currentStage) {
              onSetTarget(ref, undefined);
            } else {
              onSetTarget(ref, stage);
            }
          };

          const header = (
            <div className="flex items-center text-sm text-gray-100 font-semibold">
              <span className="flex-1">
                <span className={slotColorClass}>{SLOT_TC[slot]}</span>
                {isStarted && currentLabel && (
                  <span className="font-normal ml-2">{currentLabel}</span>
                )}
                <span className="text-xs text-gray-400 font-normal ml-1">
                  {currentStageSuffix}
                </span>
                {slotData?.targetStage && slotData.targetStage !== slotData.currentStage && (
                  <>
                    <span className="text-yellow-400 mx-2">→</span>
                    <span className="text-yellow-200">
                      {targetLabel}
                      {targetIL != null && (
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          {`（${STAGE_TC_LABEL[slotData.targetStage]} · iL${targetIL}）`}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </span>
              {hasEntry && (
                <button
                  type="button"
                  aria-label={`重置${SLOT_TC[slot]}防具進度`}
                  onClick={(e) => { e.stopPropagation(); onRequestReset?.(ref, SLOT_TC[slot]); }}
                  className="text-[10px] px-2 py-0.5 rounded border border-red-900/50 text-red-400/60 hover:text-red-300 hover:border-red-500 transition-colors ml-auto shrink-0"
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
                  currentStage={slotData?.currentStage}
                  targetStage={slotData?.targetStage}
                  stages={stages}
                  zoneGroups={zoneGroups}
                  glowStages={glowStages}
                  onSelectTarget={handleSelectStage}
                />
                <StageListPanel
                  stages={stages}
                  currentStage={slotData?.currentStage}
                  targetStage={slotData?.targetStage}
                  itemLevels={itemLevels}
                  getItemName={(stage) => getItemName?.(slot, stage)}
                  onSelectTarget={handleSelectStage}
                />
                <PreviewPanel
                  currentStage={slotData?.currentStage}
                  targetStage={slotData?.targetStage}
                  inventory={materials}
                  onSetCurrent={() => onRequestUpgrade(ref)}
                  onClearTarget={() => onSetTarget(ref, undefined)}
                  materialsMap={materialsMap}
                  stages={stages}
                  costs={costs}
                  slot={slot}
                  currentLabel={currentLabel}
                  targetLabel={targetLabel}
                  prereqRows={getPrereqRows?.(slot)}
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
