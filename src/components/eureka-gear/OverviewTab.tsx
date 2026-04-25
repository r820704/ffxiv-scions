import { useMemo } from 'react';
import { JobCard } from './JobCard';
import { RoleCard } from './RoleCard';
import { getJobProgress } from '../../utils/eurekaGear';
import type { EurekaInventoryV5, EurekaWeapon } from '../../types/eureka-gear';
import { ARMOR_SET_IDS } from '../../types/eureka-gear';
import {
  JOBS_FOR_ARMOR_SET,
  JOBS_WITH_WEAPONS,
} from '../../data/eureka-armor-sets';

export type OverviewTabProps = {
  inventory: EurekaInventoryV5;
  weapons?: EurekaWeapon[];
  onSelectJob: (job: string) => void;
};

export function OverviewTab({ inventory, weapons, onSelectJob }: OverviewTabProps) {
  const jobProgresses = useMemo(
    () => JOBS_WITH_WEAPONS.map((job) => ({ job, progress: getJobProgress(job, inventory) })),
    [inventory],
  );

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-bold text-yellow-400 mb-2">武器 + 常風防具（依職業）</h3>
        <div
          data-testid="job-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {jobProgresses.map(({ job, progress }) => (
            <JobCard key={job} job={job} progress={progress} weapons={weapons} onSelect={onSelectJob} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-cyan-300 mb-2">元素防具（依職能共用）</h3>
        <div
          data-testid="role-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {ARMOR_SET_IDS.map((set) => {
            const pieces = inventory.armor.elemental[set] ?? {};
            // Ensure the set has at least one job (all do)
            if (!JOBS_FOR_ARMOR_SET[set]?.length) return null;
            return (
              <RoleCard
                key={set}
                set={set}
                pieces={pieces}
                onSelect={onSelectJob}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
