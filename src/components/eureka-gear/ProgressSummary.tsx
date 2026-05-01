import { useMemo } from 'react';
import type { EurekaInventoryV5 } from '../../types/eureka-gear';
import { ARMOR_SET_IDS, ARMOR_SLOTS } from '../../types/eureka-gear';
import { JOBS_WITH_WEAPONS } from '../../data/eureka-armor-sets';
import { EUREKA_CHAINS } from '../../data/eureka-chains';

const TOTAL_WEAPON_JOBS = JOBS_WITH_WEAPONS.length; // 15

// Anemos armor: per-job × 5 slots — only count primary jobs (with weapons).
const TOTAL_ANEMOS_PIECES = TOTAL_WEAPON_JOBS * ARMOR_SLOTS.length; // 15 × 5 = 75

// Elemental armor: per-set × 5 slots.
const TOTAL_ELEMENTAL_PIECES = ARMOR_SET_IDS.length * ARMOR_SLOTS.length; // 7 × 5 = 35

export type ProgressSummaryProps = {
  inventory: EurekaInventoryV5;
};

export function ProgressSummary({ inventory }: ProgressSummaryProps) {
  const stats = useMemo(() => {
    // 1) Weapons: count jobs with any started chain.
    const startedJobs = new Set<string>();
    for (const chain of EUREKA_CHAINS) {
      if (inventory.weapons[chain.chainId]) startedJobs.add(chain.job);
    }

    // 2) Anemos: sum of started slots across all jobs.
    let anemosStarted = 0;
    for (const job of JOBS_WITH_WEAPONS) {
      const set = inventory.armor.anemos[job];
      if (!set) continue;
      for (const slot of ARMOR_SLOTS) if (set[slot]) anemosStarted += 1;
    }

    // 3) Elemental: sum of started slots across all sets.
    let elementalStarted = 0;
    for (const setId of ARMOR_SET_IDS) {
      const pieces = inventory.armor.elemental[setId];
      if (!pieces) continue;
      for (const slot of ARMOR_SLOTS) if (pieces[slot]) elementalStarted += 1;
    }

    return {
      weaponJobs: startedJobs.size,
      anemos: anemosStarted,
      elemental: elementalStarted,
    };
  }, [inventory]);

  const noProgress = stats.weaponJobs === 0 && stats.anemos === 0 && stats.elemental === 0;
  if (noProgress) return null;

  return (
    <div
      role="status"
      aria-label="禁地兵裝整體進度"
      className="text-xs text-gray-300 bg-secondary/40 border border-border/50 rounded px-3 py-2 mb-3 flex flex-wrap gap-x-4 gap-y-1"
    >
      <span>📊 整體進度：</span>
      <span>
        <span className="text-amber-400 font-semibold">武器</span>{' '}
        {stats.weaponJobs}/{TOTAL_WEAPON_JOBS} 職業已開始
      </span>
      <span>
        <span className="text-emerald-400 font-semibold">常風防具</span>{' '}
        {stats.anemos}/{TOTAL_ANEMOS_PIECES} 件已開始
      </span>
      <span>
        <span className="text-cyan-300 font-semibold">元素防具</span>{' '}
        {stats.elemental}/{TOTAL_ELEMENTAL_PIECES} 件已開始
      </span>
    </div>
  );
}
