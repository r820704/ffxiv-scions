import { Tooltip } from '../ui/Tooltip';
import { JOBS_FOR_ARMOR_SET, JOB_TC_NAME, type AnyJobId } from '../../data/eureka-armor-sets';
import type { ArmorSetId, ArmorSlot, EurekaStage, SlotProgress } from '../../types/eureka-gear';
import { ARMOR_SLOTS, ARMOR_STAGES_BY_TRACK, ELEMENTAL_ARMOR_ZONE_GROUPS } from '../../types/eureka-gear';
import { ArmorDots } from './ArmorDots';

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
  const jobNamesHeading = jobs.map((j) => JOB_TC_NAME[j as AnyJobId] ?? j).join(' · ');
  const elementalStages = ARMOR_STAGES_BY_TRACK.elemental;
  const lastStage = elementalStages[elementalStages.length - 1];

  return (
    <article className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-3 py-2.5 bg-gray-800 hover:bg-gray-700/60 transition-colors">
      {/* Line 1: job icons + job combination names + role label */}
      <div className="w-full flex items-center gap-1.5 flex-wrap">
        <div className="flex gap-0.5 items-center shrink-0">
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
        <span className="text-sm text-gray-200">{jobNamesHeading}</span>
        <span className="text-xs text-gray-500">[{roleLabel}]</span>
      </div>

      {/* Line 2: elemental armor chip */}
      <span className="text-[10px] font-bold text-cyan-400/90 bg-cyan-950/40 px-1.5 py-0.5 rounded shrink-0">
        元素系列（戰鬥）
      </span>

      {/* Mobile: compact 5×3 dot groups with zone separators */}
      <div className="flex sm:hidden gap-[2px] items-center shrink-0 flex-wrap">
        {ARMOR_SLOTS.map((slot, slotIdx) => {
          const p = pieces[slot];
          const stage: EurekaStage = p?.currentStage ?? 'elemental';
          const started = p !== undefined;
          return (
            <div key={slot} className="flex items-center gap-[2px]">
              {slotIdx > 0 && (
                <span className="text-gray-600 text-[9px] mx-0.5">·</span>
              )}
              <ArmorDots
                stages={elementalStages}
                zoneGroups={ELEMENTAL_ARMOR_ZONE_GROUPS}
                currentStage={stage}
                started={started}
                colorFilled="bg-cyan-400"
              />
            </div>
          );
        })}
      </div>

      {/* Desktop: per-slot with label, zone-separated dots, count */}
      {ARMOR_SLOTS.map((slot) => {
        const p = pieces[slot];
        const stage: EurekaStage = p?.currentStage ?? 'elemental';
        const started = p !== undefined;
        const filled = elementalStages.indexOf(stage) + 1;
        const done = stage === lastStage;
        return (
          <div key={slot} className="hidden sm:flex items-center gap-1 text-xs shrink-0">
            <span className="text-cyan-400/70 w-4 shrink-0">{SLOT_TC[slot]}</span>
            <ArmorDots
              stages={elementalStages}
              zoneGroups={ELEMENTAL_ARMOR_ZONE_GROUPS}
              currentStage={stage}
              started={started}
              colorFilled="bg-cyan-400"
            />
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
