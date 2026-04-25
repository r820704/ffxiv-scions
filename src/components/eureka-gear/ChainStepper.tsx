import { EUREKA_STAGES, ZONE_OF_STAGE, ZONE_TC_NAME, ZONE_ENDPOINT_TC_NAME } from '../../types/eureka-gear';
import type { EurekaStage, EurekaZone } from '../../types/eureka-gear';

export type ChainStepperProps = {
  currentStage: EurekaStage;
  targetStage?: EurekaStage;
  onSelectTarget: (stage: EurekaStage) => void;
  /** Optional stage sequence for armor tracks (shorter than EUREKA_STAGES). */
  stages?: readonly EurekaStage[];
};

function stageState(
  i: number,
  currentIdx: number,
  targetIdx: number | null,
): 'owned' | 'current' | 'target' | 'unowned' {
  if (i === currentIdx) return 'current';
  if (targetIdx !== null && i === targetIdx) return 'target';
  if (i < currentIdx) return 'owned';
  return 'unowned';
}

const STATE_STYLE: Record<string, string> = {
  owned: 'bg-green-500 text-black',
  current: 'bg-green-500 text-black ring-2 ring-white',
  target: 'bg-transparent border-2 border-yellow-400 text-yellow-400 ring-2 ring-white',
  unowned: 'bg-gray-700 text-gray-500',
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

export function ChainStepper({ currentStage, targetStage, onSelectTarget, stages }: ChainStepperProps) {
  const seq = stages ?? EUREKA_STAGES;
  const currentIdx = seq.indexOf(currentStage);
  const targetIdx = targetStage ? seq.indexOf(targetStage) : null;
  const showZoneGroups = seq === EUREKA_STAGES;

  const renderButton = (stage: EurekaStage, i: number) => {
    const state = stageState(i, currentIdx, targetIdx);
    return (
      <button
        key={stage}
        type="button"
        data-state={state}
        aria-label={`stage ${i + 1}: ${stage}`}
        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition ${STATE_STYLE[state]}`}
        onClick={() => onSelectTarget(stage)}
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

  const groups = groupByZone(seq);
  return (
    <div data-testid="stepper-container" className="flex flex-wrap gap-3 items-end">
      {groups.map((group, gi) => (
        <div
          key={group.key}
          data-testid={`zone-group-${group.key}`}
          role="group"
          aria-labelledby={`zone-label-${group.key}`}
          className={`flex flex-col gap-1 ${gi > 0 ? 'pl-3 border-l border-gray-700' : ''}`}
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
