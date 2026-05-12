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
  /** undefined = 玩家尚未取得舊化（未開始）。 */
  currentStage: EurekaStage | undefined;
  targetStage: EurekaStage | undefined;
  inventory: Record<number, number>;
  /** 點「⬆ 升階段」會呼叫此 callback（內部呼叫 performUpgrade，一次跳到 target）。 */
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
  /**
   * 玩家「尚未取得舊化」時要列在 materials 清單最前面的「前置道具」，
   * 例如武器的舊化裝備、鏡像鏈的另一件武器。當 currentStage 已定義時不顯示。
   * 每個 row 顯示為「📜 name × 1（obtainMethod）」。
   */
  prereqRows?: Array<{ name: string; obtainMethod?: string }>;
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
  prereqRows,
}: PreviewPanelProps) {
  const seq = stages ?? EUREKA_STAGES;
  // currentStage 未取得舊化（undefined）→ 視為 stage 0 的前面
  const currentIdx = currentStage ? seq.indexOf(currentStage) : -1;
  const targetIdx = targetStage ? seq.indexOf(targetStage) : -1;

  const isPreObtained = currentStage === undefined;
  const direction: 'up' | 'down' | 'none' =
    targetStage === undefined || targetIdx === currentIdx
      ? 'none'
      : targetIdx > currentIdx
        ? 'up'
        : 'down';

  // 升階段所需材料：currentStage undefined 時以 antiquated 為起點（一次跳到 target）
  const materials = useMemo(
    () => {
      if (!targetStage || direction !== 'up') return [];
      const effectiveFrom: EurekaStage = currentStage ?? 'antiquated';
      if (effectiveFrom === targetStage) return [];
      if (stages || costs) {
        return costBetweenInSequence(effectiveFrom, targetStage, seq, costs ?? STAGE_UPGRADE_COSTS, slot);
      }
      return costBetween(effectiveFrom, targetStage, STAGE_UPGRADE_COSTS);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStage, targetStage, direction, slot, isPreObtained],
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

  // 無目標 → 提示
  if (!targetStage) {
    return (
      <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-700 rounded">
        選擇下方任一階段以查看升降所需
      </div>
    );
  }

  // current === target → 已達目標（無升降可做）
  if (direction === 'none' && !isPreObtained) {
    return (
      <div className="text-sm text-gray-500 italic p-4 border border-dashed border-gray-700 rounded">
        {currentLabel ?? STAGE_TC_LABEL[currentStage!]}（已達目標）
      </div>
    );
  }

  // 降階段
  if (direction === 'down') {
    return (
      <div className="p-3 rounded border border-gray-700 bg-gray-900 text-sm">
        <div className="text-red-400 font-semibold mb-2">
          從 {currentLabel ?? STAGE_TC_LABEL[currentStage!]} → {targetLabel ?? STAGE_TC_LABEL[targetStage]}（已擁有，會捨棄中間進度）
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSetCurrent}
            className="px-3 py-1.5 rounded font-bold text-sm bg-red-500 text-white"
          >
            ⬇ 📍 設為目前階段 ({targetLabel ?? STAGE_TC_LABEL[targetStage]})
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

  // 升階段（current undefined 時亦同 — 一次跳到 target）
  const headingFromName = isPreObtained ? '未開始' : (currentLabel ?? STAGE_TC_LABEL[currentStage!]);
  const headingToName = targetLabel ?? STAGE_TC_LABEL[targetStage];
  const showPrereqs = isPreObtained && prereqRows && prereqRows.length > 0;

  return (
    <div className="p-3 rounded border border-gray-700 bg-gray-900 text-sm">
      <div className="text-yellow-400 font-semibold mb-2">
        從 {headingFromName} → {headingToName} 需要
      </div>
      {(materials.length > 0 || showPrereqs) && (
        <ul className="space-y-1 mb-3">
          {showPrereqs && prereqRows!.map((row, i) => (
            <li key={`prereq-${i}`} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <span aria-hidden="true" className="w-5 h-5 shrink-0 inline-flex items-center justify-center text-base">📜</span>
                <span className="truncate">
                  {row.name} × 1
                  {row.obtainMethod && (
                    <span className="text-gray-400">（{row.obtainMethod}）</span>
                  )}
                </span>
              </span>
            </li>
          ))}
          {materials.map(renderMaterialRow)}
        </ul>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSetCurrent}
          className="px-3 py-1.5 rounded font-bold text-sm bg-green-500 text-black"
        >
          ⬆ 升階段 ({headingToName})
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
