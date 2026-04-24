import { useMemo } from 'react';
import { ChainStepper } from './ChainStepper';
import { PreviewPanel } from './PreviewPanel';
import { getJobProgress } from '../../utils/eurekaGear';
import { ARMOR_SET_FOR_JOB, JOBS_FOR_ARMOR_SET, isArmorSetShared } from '../../data/eureka-armor-sets';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';
import type { ChainRef } from '../../hooks/useEurekaInventory';
import type {
  ArmorSlot,
  ArmorTrack,
  EurekaInventoryV4,
  EurekaStage,
  EurekaWeapon,
} from '../../types/eureka-gear';
import {
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  ARMOR_TRACKS,
  ARMOR_TRACK_LABEL,
  STAGE_TC_LABEL,
} from '../../types/eureka-gear';

const SLOT_TC: Record<ArmorSlot, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

const JOBS = Object.keys(ARMOR_SET_FOR_JOB);

const JOB_NAME_TC: Record<string, string> = {
  PLD: '騎士',   WAR: '戰士',   DRG: '龍騎士',
  MNK: '武僧',   NIN: '忍者',   BRD: '吟遊詩人',
  BLM: '黑魔法師', SMN: '召喚師', WHM: '白魔法師',
};

export type DetailTabProps = {
  inventory: EurekaInventoryV4;
  selectedJob: string;
  weapons: EurekaWeapon[];
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSelectJob: (job: string) => void;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
};

function weaponInfoAt(weapons: EurekaWeapon[], chainId: string, stage: EurekaStage) {
  return weapons.find((w) => w.chainId === chainId && w.stage === stage);
}

export function DetailTab({
  inventory,
  selectedJob,
  weapons,
  materialsMap,
  onSelectJob,
  onSetTarget,
  onRequestUpgrade,
}: DetailTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = useMemo(() => getJobProgress(selectedJob as any, inventory), [selectedJob, inventory]);

  // Filter to primary chains only (mirror chains like PLD shield share the
  // primary's stepper/preview — their names are rendered inline on the header).
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
            <option key={j} value={j}>{JOB_NAME_TC[j] ?? j}</option>
          ))}
        </select>
      </header>

      <section className="space-y-4">
        <h3 className="text-yellow-400 font-bold">武器</h3>
        {primaryChains.map(({ chainId, progress: p }) => {
          const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
          const ref: ChainRef = { kind: 'weapon', chainId };
          const currentInfo = weaponInfoAt(weapons, chainId, p.currentStage);
          const targetInfo = p.targetStage ? weaponInfoAt(weapons, chainId, p.targetStage) : undefined;
          const currentName = currentInfo?.tcName ?? chain?.displayName ?? chainId;

          // Find mirror chains (e.g. PLD shield) to display their names alongside
          const mirrorChains = EUREKA_CHAINS.filter((c) => c.mirrorsChainId === chainId);
          const mirrorInfos = mirrorChains.map((mc) => ({
            chainId: mc.chainId,
            current: weaponInfoAt(weapons, mc.chainId, p.currentStage),
            target: p.targetStage ? weaponInfoAt(weapons, mc.chainId, p.targetStage) : undefined,
            displayName: mc.displayName,
          }));

          const stageSuffix = (info: typeof currentInfo, stage: EurekaStage) =>
            `（${STAGE_TC_LABEL[stage]}${info ? ` · iL${info.itemLevel}` : ''}）`;

          return (
            <div key={chainId} className="space-y-2 pt-2">
              <div className="space-y-0.5 text-sm">
                {/* Primary weapon row */}
                <div className="text-gray-100 font-semibold">
                  {currentName}
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    {stageSuffix(currentInfo, p.currentStage)}
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

                {/* Mirror (paired) weapon rows — e.g. PLD shield */}
                {mirrorInfos.map((m) => (
                  <div key={m.chainId} className="text-gray-100 font-semibold">
                    {m.current?.tcName ?? m.displayName}
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      {stageSuffix(m.current, p.currentStage)}
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
                currentStage={p.currentStage}
                targetStage={p.targetStage}
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

      <ArmorSection
        set={progress.armor.set}
        pieces={progress.armor.pieces}
        materials={inventory.materials}
        materialsMap={materialsMap}
        onSetTarget={onSetTarget}
        onRequestUpgrade={onRequestUpgrade}
      />
    </div>
  );
}

type ArmorSectionProps = {
  set: ReturnType<typeof getJobProgress>['armor']['set'];
  pieces: ReturnType<typeof getJobProgress>['armor']['pieces'];
  materials: Record<number, number>;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
};

function ArmorSection({ set, pieces, materials, materialsMap, onSetTarget, onRequestUpgrade }: ArmorSectionProps) {
  const shared = isArmorSetShared(set);
  const sharedJobs = JOBS_FOR_ARMOR_SET[set] ?? [];
  return (
    <section className="space-y-4">
      <h3 className="text-green-400 font-bold">
        防具 · {set} 系列
        {shared && (
          <span className="ml-2 text-xs font-normal text-blue-200">
            （共用：{sharedJobs.join(' / ')}）
          </span>
        )}
      </h3>
      {ARMOR_TRACKS.map((track: ArmorTrack) => (
        <div key={track} className="space-y-3 pl-2 border-l-2 border-gray-700">
          <h4 className="text-sm font-bold text-gray-300">{ARMOR_TRACK_LABEL[track]}</h4>
          {ARMOR_SLOTS.map((slot) => {
            const p = pieces[slot]?.[track] ?? { currentStage: 'antiquated' as const };
            const ref: ChainRef = { kind: 'armor', set, slot, track };
            const sequence = ARMOR_STAGES_BY_TRACK[track];
            const costs = track === 'anemos' ? ANEMOS_ARMOR_COSTS : ELEMENTAL_ARMOR_COSTS;
            return (
              <div key={slot} className="space-y-2">
                <div className="text-sm text-gray-100 font-semibold">
                  {SLOT_TC[slot]}
                  <span className="text-xs text-gray-400 font-normal ml-2">
                    （{STAGE_TC_LABEL[p.currentStage]}）
                  </span>
                  {p.targetStage && p.targetStage !== p.currentStage && (
                    <>
                      <span className="text-yellow-400 mx-2">→</span>
                      <span className="text-yellow-200">
                        {STAGE_TC_LABEL[p.targetStage]}
                      </span>
                    </>
                  )}
                </div>
                <ChainStepper
                  currentStage={p.currentStage}
                  targetStage={p.targetStage}
                  stages={sequence}
                  onSelectTarget={(stage) =>
                    onSetTarget(ref, stage === p.currentStage ? undefined : stage)
                  }
                />
                <PreviewPanel
                  currentStage={p.currentStage}
                  targetStage={p.targetStage}
                  inventory={materials}
                  onSetCurrent={() => onRequestUpgrade(ref)}
                  onClearTarget={() => onSetTarget(ref, undefined)}
                  materialsMap={materialsMap}
                  stages={sequence}
                  costs={costs}
                  slot={slot}
                />
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
