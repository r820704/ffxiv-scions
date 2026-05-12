import { EUREKA_STAGES, ZONE_OF_STAGE, ZONE_TC_NAME, ZONE_ENDPOINT_TC_NAME } from '../../types/eureka-gear';
import type { ArmorZoneGroupDef, EurekaStage, EurekaZone } from '../../types/eureka-gear';

export type ChainStepperProps = {
  /**
   * null/undefined = 玩家尚未取得舊化（未開始）。null 與 undefined 等價，
   * 兩種都接受以方便 caller。
   */
  currentStage: EurekaStage | null | undefined;
  targetStage?: EurekaStage;
  onSelectTarget: (stage: EurekaStage) => void;
  /**
   * @deprecated 0 階階段統一後（B1 design）不再需要分流；保留以維持向後相容、
   * 但 DetailTab 已不再傳入。
   */
  onSelectStart?: (stage: EurekaStage) => void;
  /**
   * @deprecated 同 onSelectStart — pendingStart 概念已砍除。
   */
  pendingStartActive?: boolean;
  /** Optional stage sequence for armor tracks (shorter than EUREKA_STAGES). */
  stages?: readonly EurekaStage[];
  /** When provided, render zone group labels (for armor tracks). */
  zoneGroups?: readonly ArmorZoneGroupDef[];
  /** Stages that should render with an amber halo to indicate the in-game gear glows. */
  glowStages?: ReadonlySet<EurekaStage>;
};

function stageState(
  i: number,
  currentIdx: number,
  targetIdx: number | null,
  pendingStartActive: boolean,
): 'owned' | 'current' | 'target' | 'unowned' | 'not-started' {
  // currentIdx === -1 means currentStage is null → entire stepper is "not started";
  // only the explicit target (if any) breaks out of the gray treatment.
  if (currentIdx < 0) {
    if (targetIdx !== null && i === targetIdx) return 'target';
    if (pendingStartActive && i === 0) return 'target';
    return 'not-started';
  }
  if (i === currentIdx) return 'current';
  if (targetIdx !== null && i === targetIdx) return 'target';
  if (i < currentIdx) return 'owned';
  return 'unowned';
}

const STATE_STYLE: Record<string, string> = {
  owned: 'bg-owned text-owned-foreground',
  current: 'bg-owned text-owned-foreground ring-2 ring-white',
  target: 'bg-transparent border-2 border-target text-target ring-2 ring-white',
  unowned: 'bg-gray-700 text-gray-500',
  // not-started: empty-slot look (Diablo 4 wardrobe style) — dashed faint ring.
  'not-started': 'bg-transparent border border-dashed border-gray-600 text-gray-600',
};

type StageEntry = { stage: EurekaStage; index: number };
type ZoneGroup = { key: string; label: string; entries: StageEntry[] };

function groupByZone(seq: readonly EurekaStage[]): ZoneGroup[] {
  const groups: ZoneGroup[] = [];
  seq.forEach((stage, index) => {
    const zone: EurekaZone | null = ZONE_OF_STAGE[stage];
    let key: string;
    let label: string;
    if (zone === null) {
      // antiquated → 起點, physeos → 最終形態
      if (stage === 'antiquated') {
        key = 'start';
        label = ZONE_ENDPOINT_TC_NAME.start;
      } else if (stage === 'physeos') {
        key = 'final';
        label = ZONE_ENDPOINT_TC_NAME.final;
      } else {
        key = `null-${index}`;
        label = '';
      }
    } else {
      key = zone;
      label = ZONE_TC_NAME[zone];
    }
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push({ stage, index });
    } else {
      groups.push({ key, label, entries: [{ stage, index }] });
    }
  });
  return groups;
}

export function ChainStepper({ currentStage, targetStage, onSelectTarget, onSelectStart, pendingStartActive, stages, zoneGroups, glowStages }: ChainStepperProps) {
  const seq = stages ?? EUREKA_STAGES;
  // currentStage === null → currentIdx -1, which stageState reads as "not started".
  const currentIdx = currentStage ? seq.indexOf(currentStage) : -1;
  const targetIdx = targetStage ? seq.indexOf(targetStage) : null;
  const showZoneGroups = seq === EUREKA_STAGES || zoneGroups !== undefined;

  const renderButton = (stage: EurekaStage, i: number) => {
    const state = stageState(i, currentIdx, targetIdx, pendingStartActive ?? false);
    const notStarted = currentIdx < 0;
    const isGlow = glowStages?.has(stage) ?? false;
    return (
      <button
        key={stage}
        type="button"
        data-state={state}
        data-glow={isGlow ? 'true' : undefined}
        aria-label={`stage ${i + 1}: ${stage}${isGlow ? '（發光階段）' : ''}`}
        className={`w-10 h-10 md:w-7 md:h-7 rounded-full text-sm md:text-xs font-bold flex items-center justify-center transition ${STATE_STYLE[state]} ${
          // drop-shadow uses CSS filter, not box-shadow, so it coexists with the
          // current/target ring (which uses box-shadow via Tailwind ring-*).
          isGlow ? 'drop-shadow-[0_0_4px_rgba(251,191,36,0.95)]' : ''
        }`}
        onClick={() => {
          // While not started, clicking any stage funnels into onSelectStart so
          // the caller can both kick off the start flow and remember the
          // desired target in one click.
          if (notStarted && onSelectStart) {
            onSelectStart(stage);
          } else {
            onSelectTarget(stage);
          }
        }}
      >
        {i + 1}
      </button>
    );
  };

  if (!showZoneGroups) {
    return (
      <div data-testid="stepper-container" className="flex flex-wrap gap-1 items-center">
        {seq.map((stage, i) => renderButton(stage, i))}
      </div>
    );
  }

  const groups = zoneGroups
    ? zoneGroups.map(({ key, label, stages: stageList }) => ({
        key,
        label,
        entries: stageList
          .map((stage) => ({ stage, index: seq.indexOf(stage) }))
          .filter(({ index }) => index >= 0),
      }))
    : groupByZone(seq);
  return (
    <div
      data-testid="stepper-container"
      className="flex flex-col md:flex-row md:flex-wrap gap-3 md:items-end"
    >
      {groups.map((group, gi) => (
        <div
          key={group.key}
          data-testid={`zone-group-${group.key}`}
          role="group"
          aria-labelledby={`zone-label-${group.key}`}
          className={`flex flex-col gap-1 ${gi > 0 ? 'border-t border-gray-700 pt-2 md:border-t-0 md:pt-0 md:pl-3 md:border-l md:border-gray-700' : ''}`}
        >
          <span
            id={`zone-label-${group.key}`}
            data-testid={`zone-label-${group.key}`}
            className="text-xs text-gray-400"
          >
            {group.label}
          </span>
          <div className="flex flex-wrap gap-1 items-center">
            {group.entries.map(({ stage, index }) => renderButton(stage, index))}
          </div>
        </div>
      ))}
    </div>
  );
}
