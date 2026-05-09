import { useState } from 'react';
import { STAGE_TC_LABEL } from '../../types/eureka-gear';
import type { EurekaStage } from '../../types/eureka-gear';

export type StageListPanelProps = {
  stages: readonly EurekaStage[];
  currentStage: EurekaStage | null;
  targetStage?: EurekaStage;
  itemLevels?: Partial<Record<EurekaStage, number>>;
  /** Returns display name for a stage (item name). Falls back to STAGE_TC_LABEL. */
  getItemName?: (stage: EurekaStage) => string | undefined;
  onSelectTarget: (stage: EurekaStage) => void;
  /**
   * Mirrors ChainStepper.onSelectStart: when the chain is not started
   * (currentStage === null), clicking any row routes here so the parent can
   * open the start-with-target flow in one click instead of forcing the user
   * through a separate "click stage 1 first" step.
   */
  onSelectStart?: (stage: EurekaStage) => void;
};

export function StageListPanel({
  stages,
  currentStage,
  targetStage,
  itemLevels,
  getItemName,
  onSelectTarget,
  onSelectStart,
}: StageListPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-gray-300 hover:text-gray-100 border border-gray-700 hover:border-gray-500 rounded px-3 py-1.5 inline-flex items-center gap-2 mt-1 transition-colors"
        aria-expanded={open}
      >
        <span className="text-gray-500">{open ? '▲' : '▼'}</span>
        <span>{open ? '收合階段列表' : '展開階段列表'}</span>
      </button>

      {open && (
        <ol className="mt-2 space-y-0.5 text-xs">
          {stages.map((stage, i) => {
            const isCurrent = stage === currentStage;
            const isTarget = stage === targetStage;
            const itemName = getItemName?.(stage) ?? STAGE_TC_LABEL[stage];
            const iL = itemLevels?.[stage];
            return (
              <li key={stage}>
                <button
                  type="button"
                  onClick={() => {
                    if (currentStage === null && onSelectStart) {
                      onSelectStart(stage);
                    } else {
                      onSelectTarget(stage);
                    }
                  }}
                  className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 transition-colors ${
                    isCurrent
                      ? 'bg-owned/20 text-owned'
                      : isTarget
                      ? 'bg-target/20 text-target'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <span className="w-5 text-right text-gray-600 shrink-0">{i + 1}</span>
                  <span className="flex-1">{itemName}</span>
                  {iL != null && <span className="text-gray-500 shrink-0">iL{iL}</span>}
                  {isCurrent && <span className="text-green-400 text-[10px] shrink-0">目前</span>}
                  {isTarget && !isCurrent && <span className="text-yellow-400 text-[10px] shrink-0">目標</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
