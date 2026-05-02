import { EUREKA_STAGES, ARMOR_SLOTS } from '../../types/eureka-gear';
import { JOB_TC_NAME, type JobId } from '../../data/eureka-armor-sets';
import type { JobProgress } from '../../utils/eurekaGear';

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

const WEAPON_TOTAL = EUREKA_STAGES.length; // 16
const ARMOR_TOTAL = ARMOR_SLOTS.length;    // 5

function Frac({ n, d }: { n: number; d: number }) {
  const done = n === d;
  const zero = n === 0;
  return (
    <span
      className={`tabular-nums text-xs ${done ? 'text-green-400' : zero ? 'text-gray-600' : 'text-gray-300'}`}
    >
      {n}<span className="text-gray-500">/{d}</span>
    </span>
  );
}

export type JobRowProps = {
  job: string;
  progress: JobProgress;
  onSelect: (job: string) => void;
};

export function JobRow({ job, progress, onSelect }: JobRowProps) {
  const iconSrc = JOB_ICONS[job];
  const jobName = JOB_TC_NAME[job as JobId] ?? job;

  const completedAnemos = ARMOR_SLOTS.filter(
    (slot) => progress.anemos[slot]?.currentStage === 'anemos',
  ).length;

  return (
    <div className="grid grid-cols-[1fr_auto_52px_28px] items-center gap-3 px-3 py-2 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        {iconSrc ? (
          <img src={iconSrc} alt={job} className="w-6 h-6 rounded shrink-0" />
        ) : (
          <span className="w-6 h-6 rounded bg-gray-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {job}
          </span>
        )}
        <span className="text-sm text-gray-200 truncate">{jobName}</span>
      </div>

      <div className="flex items-center gap-2.5">
        {progress.weapons.every((w) => !w.started) ? (
          <span className="text-xs text-gray-600">—</span>
        ) : (
          progress.weapons.map(({ chainId, progress: p, started }) => {
            if (!started) return <span key={chainId} className="text-xs text-gray-600">—</span>;
            const filled = EUREKA_STAGES.indexOf(p.currentStage) + 1;
            return <Frac key={chainId} n={filled} d={WEAPON_TOTAL} />;
          })
        )}
      </div>

      <div className="text-right">
        <Frac n={completedAnemos} d={ARMOR_TOTAL} />
      </div>

      <button
        type="button"
        onClick={() => onSelect(job)}
        aria-label={`查看詳情 ${jobName}`}
        className="text-sm text-gray-400 hover:text-primary transition-colors text-right"
      >
        →
      </button>
    </div>
  );
}
