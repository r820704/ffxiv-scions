import { EUREKA_STAGES, ZONE_OF_STAGE, ZONE_TC_NAME, ZONE_ENDPOINT_TC_NAME } from '../../types/eureka-gear';
import type { EurekaStage, EurekaZone } from '../../types/eureka-gear';
import { Tooltip } from '../ui/Tooltip';

const ZONE_HINT: Record<string, string> = {
  start: '起始狀態。Stage 1 對應 70 級職業套裝（antiquated），是禁地兵裝的前置物。',
  anemos: '常風之地（Eureka Anemos）取得的素材主要用於升 stage 2-5。',
  pagos: '恆冰之地（Eureka Pagos）取得的素材主要用於升 stage 6-7。',
  pyros: '湧火之地（Eureka Pyros）取得的素材主要用於升 stage 8-11。',
  hydatos: '豐水之地（Eureka Hydatos）取得的素材主要用於升 stage 12-15。',
  final: '最終形態（physeos）— 把武器升到 iL400 的傳說型態。',
};

export type ChainStepperProps = {
  /** null = the player has not even owned the prereq stage 1 (antiquated). */
  currentStage: EurekaStage | null;
  targetStage?: EurekaStage;
  onSelectTarget: (stage: EurekaStage) => void;
  /** Optional stage sequence for armor tracks (shorter than EUREKA_STAGES). */
  stages?: readonly EurekaStage[];
};

function stageState(
  i: number,
  currentIdx: number,
  targetIdx: number | null,
): 'owned' | 'current' | 'target' | 'unowned' | 'not-started' {
  // currentIdx === -1 means currentStage is null → entire stepper is "not started";
  // only the explicit target (if any) breaks out of the gray treatment.
  if (currentIdx < 0) {
    if (targetIdx !== null && i === targetIdx) return 'target';
    return 'not-started';
  }
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

export function ChainStepper({ currentStage, targetStage, onSelectTarget, stages }: ChainStepperProps) {
  const seq = stages ?? EUREKA_STAGES;
  // currentStage === null → currentIdx -1, which stageState reads as "not started".
  const currentIdx = currentStage ? seq.indexOf(currentStage) : -1;
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
        className={`w-10 h-10 md:w-7 md:h-7 rounded-full text-sm md:text-xs font-bold flex items-center justify-center transition ${STATE_STYLE[state]}`}
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
          className={`flex flex-col gap-1 ${gi > 0 ? 'md:pl-3 md:border-l md:border-gray-700' : ''}`}
        >
          <span
            id={`zone-label-${group.key}`}
            data-testid={`zone-label-${group.key}`}
            className="text-xs text-gray-400 inline-flex items-center gap-1"
          >
            {group.label}
            {ZONE_HINT[group.key] && (
              <Tooltip label={ZONE_HINT[group.key]!}>
                <button
                  type="button"
                  aria-label={`${group.label} 說明`}
                  className="w-4 h-4 rounded-full bg-gray-700 text-gray-300 text-[10px] leading-4 text-center hover:bg-gray-600 transition-colors"
                >
                  ⓘ
                </button>
              </Tooltip>
            )}
          </span>
          <div className="flex flex-wrap gap-1 items-center">
            {group.entries.map(({ stage, index }) => renderButton(stage, index))}
          </div>
        </div>
      ))}
    </div>
  );
}
