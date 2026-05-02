import {
  EUREKA_STAGES,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  ANEMOS_ARMOR_STAGES,
  type EurekaStage,
  type EurekaWeapon,
} from '../../types/eureka-gear';

const WEAPON_GLOW_STAGES = new Set<EurekaStage>([
  'anemos', 'elemental', 'pyros', 'eureka', 'physeos',
]);
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

export function JobRow({ job, progress, weapons: _weapons, onSelect }: JobRowProps) {
  const iconSrc = JOB_ICONS[job];
  const jobName = JOB_TC_NAME[job as JobId] ?? job;

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-3 py-2.5 bg-gray-800 hover:bg-gray-700/60 transition-colors">
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

      {/* Weapons section */}
      <span className="text-[10px] font-bold text-yellow-400/90 bg-yellow-950/40 px-1.5 py-0.5 rounded shrink-0">
        武器
      </span>
      {progress.weapons.map(({ chainId, progress: p, started }) => {
        const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
        const slotLabel = chain?.isShield ? '盾' : '主';
        const idx = EUREKA_STAGES.indexOf(p.currentStage);
        const filled = idx + 1;
        const done = filled === EUREKA_STAGES.length;
        return (
          <div key={chainId} className="flex items-center gap-1 text-xs shrink-0">
            <span className="text-yellow-400/40 text-[10px]">{slotLabel}</span>
            {started ? (
              <ChainFingerprint currentStage={p.currentStage} glowStages={WEAPON_GLOW_STAGES} />
            ) : (
              <div className="flex gap-[2px] items-center">
                {EUREKA_STAGES.map((s) => (
                  <span key={s} className="inline-block w-1.5 h-1.5 rounded-full shrink-0 bg-gray-600" />
                ))}
              </div>
            )}
            <span className={`tabular-nums shrink-0 ${done ? 'text-green-400' : 'text-gray-400'}`}>
              {started ? filled : 0}<span className="text-gray-600">/{EUREKA_STAGES.length}</span>
            </span>
          </div>
        );
      })}

      {/* Force new line; spacer aligns armor chip with weapon chip (desktop only) */}
      <div className="w-full" />
      <div className="w-[108px] shrink-0 hidden sm:block" />

      {/* Anemos armor section */}
      <span className="text-[10px] font-bold text-green-400/90 bg-green-900/50 px-1.5 py-0.5 rounded shrink-0">
        常風系列（外觀）
      </span>

      {/* Mobile: compact 5×5 dot groups */}
      <div className="flex sm:hidden gap-[4px] items-center shrink-0">
        {ARMOR_SLOTS.map((slot) => {
          const p = progress.anemos[slot];
          const stage: EurekaStage = p?.currentStage ?? 'antiquated';
          const started = p !== undefined;
          const idx = ANEMOS_ARMOR_STAGES.indexOf(stage);
          return (
            <div key={slot} className="flex gap-[2px] items-center">
              {ARMOR_STAGES_BY_TRACK.anemos.map((s, i) => (
                <span
                  key={s}
                  className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${started && i <= idx ? 'bg-green-400' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop: per-slot with label, dots, and count */}
      {ARMOR_SLOTS.map((slot) => {
        const p = progress.anemos[slot];
        const stage: EurekaStage = p?.currentStage ?? 'antiquated';
        const started = p !== undefined;
        const filled = ANEMOS_ARMOR_STAGES.indexOf(stage) + 1;
        const done = stage === 'anemos';
        return (
          <div key={slot} className="hidden sm:flex items-center gap-1 text-xs shrink-0">
            <span className="text-green-400/70 w-4 shrink-0">{SLOT_TC[slot]}</span>
            {started ? (
              <ChainFingerprint currentStage={stage} stages={ARMOR_STAGES_BY_TRACK.anemos} />
            ) : (
              <div className="flex gap-[2px] items-center">
                {ARMOR_STAGES_BY_TRACK.anemos.map((s) => (
                  <span key={s} className="inline-block w-1.5 h-1.5 rounded-full shrink-0 bg-gray-600" />
                ))}
              </div>
            )}
            <span className={`tabular-nums shrink-0 ${done ? 'text-green-400' : 'text-gray-400'}`}>
              {started ? filled : 0}<span className="text-gray-600">/5</span>
            </span>
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
