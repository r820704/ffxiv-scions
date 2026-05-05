import { useMemo } from 'react';
import { costBetween, costBetweenInSequence } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { EUREKA_STAGES, STAGE_TC_LABEL } from '../../types/eureka-gear';
import type { ArmorSlot, EurekaStage, StageUpgradeCost } from '../../types/eureka-gear';

export type PreviewPanelProps = {
  currentStage: EurekaStage;
  targetStage: EurekaStage | undefined;
  inventory: Record<number, number>;
  onSetCurrent: () => void;
  onClearTarget: () => void;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  /** Optional: armor track stage sequence (defaults to full 16 weapon stages) */
  stages?: readonly EurekaStage[];
  /** Optional: cost table to use (defaults to STAGE_UPGRADE_COSTS for weapons) */
  costs?: StageUpgradeCost[];
  /** Optional: armor slot for slot-specific cost filtering */
  slot?: ArmorSlot;
  /** Optional display name overrides (falls back to STAGE_TC_LABEL) */
  currentLabel?: string;
  targetLabel?: string;
  /** When true, show prerequisite hint + confirm button instead of the default placeholder. */
  showStartPanel?: boolean;
  startHint?: string;
  onStartChain?: () => void;
};

export function PreviewPanel({
  currentStage,
  targetStage,
  inventory,
  onSetCurrent,
  onClearTarget,
  materialsMap,
  stages,
  costs,
  slot,
  currentLabel,
  targetLabel,
  showStartPanel,
  startHint,
  onStartChain,
}: PreviewPanelProps) {
  const seq = stages ?? EUREKA_STAGES;
  const currentIdx = seq.indexOf(currentStage);
  const targetIdx = targetStage ? seq.indexOf(targetStage) : -1;
  const direction: 'up' | 'down' | 'none' =
    targetStage === undefined || targetIdx === currentIdx
      ? 'none'
      : targetIdx > currentIdx
        ? 'up'
        : 'down';

  const materials = useMemo(
    () => {
      if (!targetStage || direction !== 'up') return [];
      if (stages || costs) {
        return costBetweenInSequence(currentStage, targetStage, seq, costs ?? STAGE_UPGRADE_COSTS, slot);
      }
      return costBetween(currentStage, targetStage, STAGE_UPGRADE_COSTS);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStage, targetStage, direction, slot],
  );

  if (direction === 'none') {
    if (showStartPanel && onStartChain) {
      return (
        <div className="p-3 rounded border border-gray-700 bg-gray-900 text-sm">
          {startHint && <p className="text-gray-400 mb-3">{startHint}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onStartChain}
              className="px-3 py-1.5 rounded font-bold text-sm bg-green-500 text-black"
            >
              ⬆ 📍 設為目前階段 ({currentLabel ?? STAGE_TC_LABEL[currentStage]})
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-700 rounded">
        選擇下方任一階段以查看升降所需
      </div>
    );
  }

  return (
    <div className="p-3 rounded border border-gray-700 bg-gray-900 text-sm">
      {direction === 'up' ? (
        <>
          <div className="text-yellow-400 font-semibold mb-2">
            從 {currentLabel ?? STAGE_TC_LABEL[currentStage]} → {targetStage ? (targetLabel ?? STAGE_TC_LABEL[targetStage]) : ''} 需要
          </div>
          <ul className="space-y-1 mb-3">
            {materials.map((m) => {
              const have = inventory[m.materialId] ?? 0;
              const name = materialsMap[m.materialId]?.nameTC ?? `#${m.materialId}`;
              const short = Math.max(0, m.quantity - have);
              return (
                <li key={m.materialId} className="flex justify-between">
                  <span>{name} × {m.quantity}</span>
                  <span className={short === 0 ? 'text-green-400' : 'text-red-400'}>
                    有 {have}{short > 0 ? ` / 缺 ${short}` : ' ✓'}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="text-red-400 font-semibold mb-2">
          {targetStage ? (targetLabel ?? STAGE_TC_LABEL[targetStage]) : ''} — 已擁有（設為目前會捨棄中間進度）
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSetCurrent}
          className={`px-3 py-1.5 rounded font-bold text-sm ${
            direction === 'up' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
          }`}
        >
          {direction === 'up' ? '⬆' : '⬇'} 📍 設為目前階段 ({targetStage ? (targetLabel ?? STAGE_TC_LABEL[targetStage]) : ''})
        </button>
        <button
          type="button"
          onClick={onClearTarget}
          className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm"
        >
          清除 target
        </button>
      </div>
    </div>
  );
}
