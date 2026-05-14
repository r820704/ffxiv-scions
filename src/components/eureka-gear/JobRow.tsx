import {
  EUREKA_STAGES,
  ARMOR_SLOTS,
  ARMOR_STAGES_BY_TRACK,
  ANEMOS_ARMOR_STAGES,
  ANEMOS_ARMOR_ZONE_GROUPS,
  WEAPON_ZONE_GROUPS,
  WEAPON_GLOW_STAGES,
  type EurekaStage,
  type EurekaWeapon,
} from '../../types/eureka-gear';
import { ArmorDots } from './ArmorDots';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
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
    <div className="relative px-3 py-2.5 bg-gray-800 hover:bg-gray-700/60 transition-colors space-y-1.5">
      {/* Detail button (absolute, top-right) */}
      <button
        type="button"
        onClick={() => onSelect(job)}
        aria-label={`查看詳情 ${jobName}`}
        className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-primary transition-colors"
      >
        →
      </button>

      {/* Row 1: job identifier + 武器 badge + weapon dots */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pr-6">
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
        <span className="text-[10px] font-bold text-target/90 bg-target/20 px-1.5 py-0.5 rounded shrink-0">
          武器
        </span>
        {progress.weapons.map(({ chainId, progress: p, started }) => {
          const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
          const slotLabel = chain?.isShield ? '盾' : '主';
          const effectiveCurrent = p.currentStage ?? 'antiquated';
          const idx = EUREKA_STAGES.indexOf(effectiveCurrent);
          const filled = idx + 1;
          const done = filled === EUREKA_STAGES.length;
          return (
            <div key={chainId} className="flex items-center gap-1 text-xs shrink-0">
              <span className="text-target/40 text-[10px]">{slotLabel}</span>
              <ArmorDots
                stages={EUREKA_STAGES}
                zoneGroups={WEAPON_ZONE_GROUPS}
                currentStage={effectiveCurrent}
                started={started}
                colorFilled="bg-owned"
                glowStages={WEAPON_GLOW_STAGES}
              />
              <span className={`tabular-nums shrink-0 ${done ? 'text-owned' : 'text-gray-400'}`}>
                {started ? filled : 0}<span className="text-gray-600">/{EUREKA_STAGES.length}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: compact armor row (badge + dots inline) */}
      <div className="flex md:hidden items-center gap-x-2.5 gap-y-1 flex-wrap pr-6">
        <span className="text-[10px] font-bold text-owned/90 bg-owned/20 px-1.5 py-0.5 rounded shrink-0">
          常風防具
        </span>
        <div className="flex gap-[2px] items-center shrink-0 flex-wrap">
          {ARMOR_SLOTS.map((slot, slotIdx) => {
            const p = progress.anemos[slot];
            const stage: EurekaStage = p?.currentStage ?? 'antiquated';
            const started = p !== undefined;
            return (
              <div key={slot} className="flex items-center gap-[2px]">
                {slotIdx > 0 && (
                  <span className="text-gray-600 text-[9px] mx-0.5">·</span>
                )}
                <ArmorDots
                  stages={ARMOR_STAGES_BY_TRACK.anemos}
                  zoneGroups={ANEMOS_ARMOR_ZONE_GROUPS}
                  currentStage={stage}
                  started={started}
                  colorFilled="bg-owned"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: stacked — 常風防具 badge line, then slot dots wrap beneath */}
      <div className="hidden md:block pr-6">
        <div className="flex items-center">
          <span className="text-[10px] font-bold text-owned/90 bg-owned/20 px-1.5 py-0.5 rounded shrink-0">
            常風防具
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
          {ARMOR_SLOTS.map((slot) => {
            const p = progress.anemos[slot];
            const stage: EurekaStage = p?.currentStage ?? 'antiquated';
            const started = p !== undefined;
            const filled = ANEMOS_ARMOR_STAGES.indexOf(stage) + 1;
            const done = stage === 'anemos';
            return (
              <div key={slot} className="flex items-center gap-1 text-xs shrink-0">
                <span className="text-owned/70 w-4 shrink-0">{SLOT_TC[slot]}</span>
                <ArmorDots
                  stages={ARMOR_STAGES_BY_TRACK.anemos}
                  zoneGroups={ANEMOS_ARMOR_ZONE_GROUPS}
                  currentStage={stage}
                  started={started}
                  colorFilled="bg-owned"
                />
                <span className={`tabular-nums shrink-0 ${done ? 'text-owned' : 'text-gray-400'}`}>
                  {started ? filled : 0}<span className="text-gray-600">/5</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
