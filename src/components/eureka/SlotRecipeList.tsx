// src/components/eureka/SlotRecipeList.tsx
import type { SlotOptimizationResult } from '@/utils/slot-optimizer';
import SlotRecipeCard from './SlotRecipeCard';

interface SlotRecipeListProps {
  slotConfig: [string | null, string | null][];
  slotResult: SlotOptimizationResult | null;
  isStale: boolean;
}

export default function SlotRecipeList({
  slotConfig,
  slotResult,
  isStale,
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
          if (!combos || combos.length === 0 || !skill1) return null;

          // Use the best combination (first in sorted list = cheapest)
          const bestCombo = combos[0]!;

          return (
            <SlotRecipeCard
              key={slotIdx}
              slotIndex={slotIdx}
              skill1Id={skill1}
              skill2Id={skill2}
              combination={bestCombo}
            />
          );
        })}
      </div>
    </div>
  );
}
