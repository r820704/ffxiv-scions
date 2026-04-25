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
  // Detail tab is wired to SB jobs only, so route to the first SB job in the
  // set (which is always position 0 in JOBS_FOR_ARMOR_SET).
  const primary = jobs[0];
  const roleLabel = ROLE_TC_NAME[set];

  return (
    <article className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-cyan-300 text-sm">{roleLabel}</span>
          <span className="inline-flex items-center gap-1">
            {jobs.map((j) => {
              const tcName = JOB_TC_NAME[j as AnyJobId] ?? j;
              const icon = JOB_ICONS[j];
              return (
                <Tooltip key={j} label={tcName}>
                  {icon ? (
                    <img src={icon} alt={j} className="w-4 h-4 rounded" />
                  ) : (
                    <span className="text-[10px] px-1 bg-gray-700 rounded">{j}</span>
                  )}
                </Tooltip>
              );
            })}
          </span>
        </div>
        {primary && (
          <button
            type="button"
            onClick={() => onSelect(primary)}
            className="text-xs text-blue-400 hover:underline"
            aria-label="查看詳情"
          >
            查看詳情 →
          </button>
        )}
      </header>
      <ul className="space-y-0.5 text-xs">
        {ARMOR_SLOTS.map((slot) => {
          const p = pieces[slot];
          const stage: EurekaStage = p?.currentStage ?? 'antiquated';
          return (
            <li key={slot} className="flex items-center gap-2">
              <span className="w-6 text-gray-400">{SLOT_TC[slot]}</span>
              <ChainFingerprint
                currentStage={stage}
                stages={ARMOR_STAGES_BY_TRACK.elemental}
                showLabel
              />
            </li>
          );
        })}
      </ul>
    </article>
  );
}
