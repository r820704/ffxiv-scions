import { EUREKA_STAGES } from '../../types/eureka-gear';
import type { EurekaStage } from '../../types/eureka-gear';

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

export function ChainStepper({ currentStage, targetStage, onSelectTarget, stages }: ChainStepperProps) {
  const seq = stages ?? EUREKA_STAGES;
  const currentIdx = seq.indexOf(currentStage);
  const targetIdx = targetStage ? seq.indexOf(targetStage) : null;
  return (
    <div data-testid="stepper-container" className="flex flex-wrap gap-1 items-center">
      {seq.map((stage, i) => {
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
      })}
    </div>
  );
}
