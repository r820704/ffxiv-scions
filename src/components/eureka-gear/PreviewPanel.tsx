import { useMemo } from 'react';
import { costBetween, costBetweenInSequence } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { EUREKA_STAGES, STAGE_TC_LABEL } from '../../types/eureka-gear';
import type { ArmorSlot, EurekaStage, StageUpgradeCost } from '../../types/eureka-gear';

const MATERIAL_ICON_MODULES = import.meta.glob('../../assets/material-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const MATERIAL_ICONS: Record<number, string> = Object.fromEntries(
  Object.entries(MATERIAL_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/(\d+)\.png$/);
    return [match ? Number(match[1]) : 0, url];
  }),
);

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
  /** Optional cancel callback for the start panel; renders a clear button when provided. */
  onClearStart?: () => void;
  /**
   * When the start panel is active and the user clicked a stage past the
   * starting one, show the full antiquated → pendingStartTargetStage cost so
   * they can preview the whole upgrade path before confirming. The single
   * confirm action both starts the chain (current = first stage) and sets
   * pendingStartTargetStage as the target.
   */
  pendingStartTargetStage?: EurekaStage;
  pendingStartTargetLabel?: string;
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
  onClearStart,
  pendingStartTargetStage,
  pendingStartTargetLabel,
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

  const startMaterials = useMemo(
    () => {
      if (!showStartPanel) return [];
      // When user clicked a later stage as their desired goal, preview the
      // FULL chain cost (first stage → pendingStartTargetStage). Otherwise
      // fall back to the legacy "antiquated → currentStage" path.
      const endStage = pendingStartTargetStage ?? currentStage;
      return costBetweenInSequence('antiquated', endStage, seq, costs ?? STAGE_UPGRADE_COSTS, slot);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showStartPanel, currentStage, pendingStartTargetStage, slot],
  );

  const renderMaterialRow = (m: { materialId: number; quantity: number }) => {
    const have = inventory[m.materialId] ?? 0;
    const meta = materialsMap[m.materialId];
    const name = meta?.nameTC ?? `#${m.materialId}`;
    const iconUrl = MATERIAL_ICONS[meta?.icon ?? 0];
    const short = Math.max(0, m.quantity - have);
    return (
      <li key={m.materialId} className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          {iconUrl && <img src={iconUrl} alt="" aria-hidden="true" className="w-5 h-5 shrink-0" loading="lazy" />}
          <span className="truncate">{name} × {m.quantity}</span>
        </span>
        <span className={`shrink-0 ${short === 0 ? 'text-green-400' : 'text-red-400'}`}>
          有 {have}{short > 0 ? ` / 缺 ${short}` : ' ✓'}
        </span>
      </li>
    );
  };

  if (direction === 'none') {
    if (showStartPanel && onStartChain) {
      const startName = currentLabel ?? STAGE_TC_LABEL[currentStage];
      const targetName = pendingStartTargetStage
        ? (pendingStartTargetLabel ?? STAGE_TC_LABEL[pendingStartTargetStage])
        : null;
      const heading = targetName && targetName !== startName
        ? `從 ${startName} → ${targetName} 需要`
        : `獲得 ${startName} 需要`;
      const buttonLabel = targetName && targetName !== startName
        ? `⬆ 取得 (${targetName})`
        : `⬆ 取得 (${startName})`;
      return (
        <div className="p-3 rounded border border-gray-700 bg-gray-900 text-sm">
          <div className="text-yellow-400 font-semibold mb-2">{heading}</div>
          {(startMaterials.length > 0 || startHint) && (
            <ul className="space-y-1 mb-3">
              {startMaterials.map(renderMaterialRow)}
              {startHint && (
                <li className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className="w-5 h-5 shrink-0 inline-flex items-center justify-center text-base">📜</span>
                    <span className="truncate">{startHint}取得{startName} × 1</span>
                  </span>
                </li>
              )}
            </ul>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onStartChain}
              className="px-3 py-1.5 rounded font-bold text-sm bg-green-500 text-black"
            >
              {buttonLabel}
            </button>
            {onClearStart && (
              <button
                type="button"
                onClick={onClearStart}
                className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm"
              >
                清除
              </button>
            )}
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
            {materials.map(renderMaterialRow)}
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
