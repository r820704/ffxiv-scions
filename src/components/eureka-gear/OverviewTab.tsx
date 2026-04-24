import { useMemo } from 'react';
import { JobCard } from './JobCard';
import { getJobProgress } from '../../utils/eurekaGear';
import type { EurekaInventoryV4, EurekaWeapon } from '../../types/eureka-gear';
import {
  ARMOR_SET_FOR_JOB,
  JOB_TC_NAME,
  JOBS_ARMOR_ONLY,
  JOBS_WITH_WEAPONS,
  type JobId,
} from '../../data/eureka-armor-sets';

const JOB_ICON_MODULES = import.meta.glob('../../assets/job-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const JOB_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(JOB_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/([A-Z]+)\.png$/);
    return [match ? match[1] : '', url];
  }),
);

export type OverviewTabProps = {
  inventory: EurekaInventoryV4;
  weapons?: EurekaWeapon[];
  onSelectJob: (job: string) => void;
};

export function OverviewTab({ inventory, weapons, onSelectJob }: OverviewTabProps) {
  const jobProgresses = useMemo(
    () => JOBS_WITH_WEAPONS.map((job) => ({ job, progress: getJobProgress(job, inventory) })),
    [inventory],
  );
  return (
    <div className="space-y-6">
      <div
        data-testid="job-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {jobProgresses.map(({ job, progress }) => (
          <JobCard key={job} job={job} progress={progress} weapons={weapons} onSelect={onSelectJob} />
        ))}
      </div>

      <section>
        <h3 className="text-sm font-bold text-gray-400 mb-2">其他共用防具的職業（無 Eureka 武器）</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {JOBS_ARMOR_ONLY.map((job) => (
            <ArmorOnlyMiniCard key={job} job={job} onSelect={onSelectJob} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ArmorOnlyMiniCard({ job, onSelect }: { job: JobId; onSelect: (job: string) => void }) {
  const iconSrc = JOB_ICONS[job];
  const set = ARMOR_SET_FOR_JOB[job];
  return (
    <button
      type="button"
      onClick={() => onSelect(job)}
      className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded px-2 py-1.5 hover:border-blue-500 text-left"
    >
      {iconSrc ? (
        <img src={iconSrc} alt={job} className="w-6 h-6 rounded shrink-0" />
      ) : (
        <span className="w-6 h-6 rounded bg-gray-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
          {job}
        </span>
      )}
      <div className="min-w-0">
        <div className="text-xs font-semibold text-gray-200 truncate">{JOB_TC_NAME[job]}</div>
        <div className="text-[10px] text-gray-400 truncate">共用 {set} 防具</div>
      </div>
    </button>
  );
}
