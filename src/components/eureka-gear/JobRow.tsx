import { EUREKA_STAGES, ARMOR_SLOTS, ARMOR_STAGES_BY_TRACK, ANEMOS_ARMOR_STAGES, type EurekaStage, type EurekaWeapon } from '../../types/eureka-gear';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import { JOB_TC_NAME, type JobId } from '../../data/eureka-armor-sets';
import type { JobProgress } from '../../utils/eurekaGear';
import { ChainFingerprint } from './ChainFingerprint';

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

const SLOT_TC: Record<string, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

export type JobRowProps = {
  job: string;
  progress: JobProgress;
  weapons?: EurekaWeapon[];
  onSelect: (job: string) => void;
};

export function JobRow({ job, progress, weapons, onSelect }: JobRowProps) {
  const iconSrc = JOB_ICONS[job];
  const jobName = JOB_TC_NAME[job as JobId] ?? job;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5 hover:bg-gray-800/50 transition-colors">
      {/* Job identifier */}
      <div className="flex items-center gap-1.5 w-[108px] shrink-0">
        {iconSrc ? (
          <img src={iconSrc} alt={job} className="w-5 h-5 rounded shrink-0" />
        ) : (
          <span className="w-5 h-5 rounded bg-gray-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {job}
          </span>
        )}
        <span className="text-sm text-gray-200 truncate">{jobName}</span>
      </div>

      {/* Weapon chips */}
      {progress.weapons.map(({ chainId, progress: p, started }) => {
        const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
        const baseName = chain?.displayName?.split('·')[1]?.trim() ?? chainId;
        const stageWeapon = weapons?.find((w) => w.chainId === chainId && w.stage === p.currentStage);
        // When not started, use the short base name; once started, show the current-stage weapon name.
        const name = started ? (stageWeapon?.tcName ?? baseName) : baseName;
        const idx = EUREKA_STAGES.indexOf(p.currentStage);
        const filled = idx + 1;
        const done = filled === EUREKA_STAGES.length;
        return (
          <div key={chainId} className="flex items-center gap-1 text-xs shrink-0">
            <span className="text-yellow-300/80">{name}</span>
            {started ? (
              <span className={`tabular-nums ${done ? 'text-green-400' : 'text-gray-400'}`}>
                {filled}<span className="text-gray-600">/{EUREKA_STAGES.length}</span>
              </span>
            ) : (
              <span className="text-gray-600">未開始</span>
            )}
          </div>
        );
      })}

      {/* Anemos armor slot chips */}
      {ARMOR_SLOTS.map((slot) => {
        const p = progress.anemos[slot];
        const stage: EurekaStage = p?.currentStage ?? 'antiquated';
        const started = p !== undefined;
        const filled = ANEMOS_ARMOR_STAGES.indexOf(stage) + 1;
        const done = stage === 'anemos';
        return (
          <div key={slot} className="flex items-center gap-1 text-xs shrink-0">
            <span className="text-green-400/70 w-4 shrink-0">{SLOT_TC[slot]}</span>
            <ChainFingerprint currentStage={stage} stages={ARMOR_STAGES_BY_TRACK.anemos} />
            {started ? (
              <span className={`tabular-nums ${done ? 'text-green-400' : 'text-gray-400'}`}>
                {filled}<span className="text-gray-600">/5</span>
              </span>
            ) : (
              <span className="text-gray-600">未開始</span>
            )}
          </div>
        );
      })}

      {/* Detail button */}
      <button
        type="button"
        onClick={() => onSelect(job)}
        aria-label={`查看詳情 ${jobName}`}
        className="ml-auto text-xs text-gray-400 hover:text-primary transition-colors shrink-0"
      >
        →
      </button>
    </div>
  );
}
