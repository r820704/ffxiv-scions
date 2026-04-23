import { useMemo } from 'react';
import { JobCard } from './JobCard';
import { getJobProgress } from '../../utils/eurekaGear';
import type { EurekaInventoryV3 } from '../../types/eureka-gear';
import { ARMOR_SET_FOR_JOB } from '../../data/eureka-armor-sets';

const JOBS = Object.keys(ARMOR_SET_FOR_JOB) as (keyof typeof ARMOR_SET_FOR_JOB)[];

export type OverviewTabProps = {
  inventory: EurekaInventoryV3;
  onSelectJob: (job: string) => void;
};

export function OverviewTab({ inventory, onSelectJob }: OverviewTabProps) {
  const jobProgresses = useMemo(
    () => JOBS.map((job) => ({ job, progress: getJobProgress(job, inventory) })),
    [inventory],
  );
  return (
    <div
      data-testid="job-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      {jobProgresses.map(({ job, progress }) => (
        <JobCard key={job} job={job} progress={progress} onSelect={onSelectJob} />
      ))}
    </div>
  );
}
