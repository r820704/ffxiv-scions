import { ChainFingerprint } from './ChainFingerprint';
import { Tooltip } from '../ui/Tooltip';
import { JOBS_FOR_ARMOR_SET, JOB_TC_NAME, type AnyJobId } from '../../data/eureka-armor-sets';
import type { ArmorSetId, ArmorSlot, EurekaStage, SlotProgress } from '../../types/eureka-gear';
import { ARMOR_SLOTS, ARMOR_STAGES_BY_TRACK } from '../../types/eureka-gear';

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

const ROLE_TC_NAME: Record<ArmorSetId, string> = {
  fending: '坦克',
  maiming: '近戰',
  striking: '近戰',
  scouting: '近戰',
  aiming: '遠程',
  healing: '治療',
  casting: '法師',
};

const SLOT_TC: Record<ArmorSlot, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

export type RoleCardProps = {
  set: ArmorSetId;
  pieces: Partial<Record<ArmorSlot, SlotProgress>>;
  /** Click handler — navigates to Detail tab for a representative job in this set. */
  onSelect: (representativeJob: string) => void;
};

export function RoleCard({ set, pieces, onSelect }: RoleCardProps) {
  const jobs = JOBS_FOR_ARMOR_SET[set] ?? [];
  const primary = jobs[0];
  const roleLabel = ROLE_TC_NAME[set];
  const elementalStages = ARMOR_STAGES_BY_TRACK.elemental;
  const lastStage = elementalStages[elementalStages.length - 1];

  return (
    <article className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-3 py-2.5 bg-gray-800 hover:bg-gray-700/60 transition-colors">
      {/* Role identifier */}
      <div className="flex flex-col w-[108px] shrink-0 gap-0.5">
        <div className="flex flex-wrap gap-0.5 items-center">
          {jobs.map((j) => {
            const tcName = JOB_TC_NAME[j as AnyJobId] ?? j;
            const icon = JOB_ICONS[j];
            return (
              <Tooltip key={j} label={tcName}>
                {icon ? (
                  <img src={icon} alt={j} className="w-4 h-4 rounded shrink-0" />
                ) : (
                  <span className="text-[8px] px-0.5 bg-gray-700 rounded shrink-0">{j}</span>
                )}
              </Tooltip>
            );
          })}
        </div>
        <span className="text-[10px] text-gray-400">[{roleLabel}]</span>
      </div>

      {/* Elemental armor chip */}
      <span className="text-[10px] font-bold text-cyan-400/90 bg-cyan-950/40 px-1.5 py-0.5 rounded shrink-0">
        元素系列（戰鬥）
      </span>

      {/* Mobile: compact 5×4 dot groups */}
      <div className="flex sm:hidden gap-[4px] items-center shrink-0">
        {ARMOR_SLOTS.map((slot) => {
          const p = pieces[slot];
          const stage: EurekaStage = p?.currentStage ?? 'antiquated';
          const started = p !== undefined;
          const idx = elementalStages.indexOf(stage);
          return (
            <div key={slot} className="flex gap-[2px] items-center">
              {elementalStages.map((s, i) => (
                <span
                  key={s}
                  className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${started && i <= idx ? 'bg-cyan-400' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop: per-slot with label, dots, count */}
      {ARMOR_SLOTS.map((slot) => {
        const p = pieces[slot];
        const stage: EurekaStage = p?.currentStage ?? 'antiquated';
        const started = p !== undefined;
        const filled = elementalStages.indexOf(stage) + 1;
        const done = stage === lastStage;
        return (
          <div key={slot} className="hidden sm:flex items-center gap-1 text-xs shrink-0">
            <span className="text-cyan-400/70 w-4 shrink-0">{SLOT_TC[slot]}</span>
            {started ? (
              <ChainFingerprint currentStage={stage} stages={elementalStages} />
            ) : (
              <div className="flex gap-[2px] items-center">
                {elementalStages.map((s) => (
                  <span key={s} className="inline-block w-1.5 h-1.5 rounded-full shrink-0 bg-gray-600" />
                ))}
              </div>
            )}
            <span className={`tabular-nums shrink-0 ${done ? 'text-green-400' : 'text-gray-400'}`}>
              {started ? filled : 0}<span className="text-gray-600">/{elementalStages.length}</span>
            </span>
          </div>
        );
      })}

      {/* Detail button */}
      {primary && (
        <button
          type="button"
          onClick={() => onSelect(primary)}
          aria-label="查看詳情"
          className="ml-auto text-xs text-gray-400 hover:text-primary transition-colors shrink-0"
        >
          →
        </button>
      )}
    </article>
  );
}
