// src/components/eureka/SlotRecipeList.tsx
import type { LogogramPrice } from '@/types/eureka';
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import SlotRecipeCard from './SlotRecipeCard';

interface SlotRecipeListProps {
  slotConfig: [string | null, string | null][];
  slotResult: SlotOptimizationResult | null;
  prices: LogogramPrice[];
  priceLoading: boolean;
  isStale: boolean;
  /** Per-slot selected combo index overrides (for manual switching) */
  comboOverrides: Record<number, number>;
  onSelectCombo: (slotIdx: number, comboIdx: number) => void;
}

export default function SlotRecipeList({
  slotConfig,
  slotResult,
  prices,
  priceLoading,
  isStale,
  comboOverrides,
  onSelectCombo,
}: SlotRecipeListProps) {
  if (!slotResult) return null;

  const nonEmptySlots = slotConfig
    .map(([s1, s2], i) => ({ slotIdx: i, skill1: s1, skill2: s2 }))
    .filter(({ skill1 }) => skill1 !== null);

  if (nonEmptySlots.length === 0) return null;

  return (
    <div className={isStale ? 'opacity-50' : ''}>
      <h2 className="text-sm font-semibold text-primary mb-2">技能格合成指南</h2>
      <div className="space-y-2">
        {nonEmptySlots.map(({ slotIdx, skill1, skill2 }) => {
          const combos = slotResult.slotCombinations[slotIdx];
          if (!combos || !skill1) return null;

          const selectedIdx = comboOverrides[slotIdx] ?? 0;

          return (
            <SlotRecipeCard
              key={slotIdx}
              slotIndex={slotIdx}
              skill1Id={skill1}
              skill2Id={skill2}
              combinations={combos}
              selectedComboIndex={selectedIdx}
              onSelectCombo={(ci: number) => onSelectCombo(slotIdx, ci)}
              prices={prices}
              priceLoading={priceLoading}
            />
          );
        })}
      </div>
    </div>
  );
}
