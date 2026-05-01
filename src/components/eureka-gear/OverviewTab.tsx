import { useMemo } from 'react';
import { JobCard } from './JobCard';
import { RoleCard } from './RoleCard';
import { getJobProgress } from '../../utils/eurekaGear';
import type { EurekaInventoryV5, EurekaWeapon, ArmorSetId } from '../../types/eureka-gear';
import { ARMOR_SET_IDS } from '../../types/eureka-gear';
import {
  ARMOR_SET_FOR_JOB,
  JOBS_FOR_ARMOR_SET,
  JOBS_WITH_WEAPONS,
} from '../../data/eureka-armor-sets';
import { ROLE_LABELS, ROLE_COLORS, type Role } from '../../types/eureka';

/** Filter role values supported by the chip bar (excludes 'all' which is its own UI state). */
type FilterRole = Exclude<Role, 'all'>;

/** Single-select chip values in display order. 'all' first, then standard roles. */
const FILTER_OPTIONS: ReadonlyArray<Role> = ['all', 'tank', 'melee', 'ranged', 'healer', 'caster'];

/** Map each elemental armor set to the role chip it belongs to. */
const ARMOR_SET_TO_ROLE: Record<ArmorSetId, FilterRole> = {
  fending: 'tank',
  maiming: 'melee',
  striking: 'melee',
  scouting: 'melee',
  aiming: 'ranged',
  healing: 'healer',
  casting: 'caster',
};

export type OverviewTabProps = {
  inventory: EurekaInventoryV5;
  weapons?: EurekaWeapon[];
  onSelectJob: (job: string) => void;
  /** Selected role chip ('all' means show everything). Defaults to 'all'. */
  role?: Role;
  /** Callback when user clicks a chip. */
  onRoleChange?: (role: Role) => void;
};

export function OverviewTab({
  inventory,
  weapons,
  onSelectJob,
  role = 'all',
  onRoleChange,
}: OverviewTabProps) {
  const jobProgresses = useMemo(
    () => JOBS_WITH_WEAPONS.map((job) => ({ job, progress: getJobProgress(job, inventory) })),
    [inventory],
  );

  const visibleJobs = useMemo(() => {
    if (role === 'all') return jobProgresses;
    return jobProgresses.filter(({ job }) => ARMOR_SET_TO_ROLE[ARMOR_SET_FOR_JOB[job]] === role);
  }, [jobProgresses, role]);

  const visibleSets = useMemo(() => {
    if (role === 'all') return ARMOR_SET_IDS;
    return ARMOR_SET_IDS.filter((set) => ARMOR_SET_TO_ROLE[set] === role);
  }, [role]);

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="職能篩選"
        data-testid="role-filter"
        className="flex flex-wrap gap-1.5"
      >
        {FILTER_OPTIONS.map((opt) => {
          const active = opt === role;
          // Chip uses '全部' for filter UX context;
          // ROLE_LABELS.all is '全職業' which fits Logos pills but not single-select chips.
          const label = opt === 'all' ? '全部' : ROLE_LABELS[opt];
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onRoleChange?.(opt)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                active
                  ? `${ROLE_COLORS[opt]} ring-2 ring-cyan-400`
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <section>
        <h3 className="text-sm font-bold text-yellow-400 mb-2">武器 + 常風防具（依職業）</h3>
        <div
          data-testid="job-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {visibleJobs.map(({ job, progress }) => (
            <JobCard key={job} job={job} progress={progress} weapons={weapons} onSelect={onSelectJob} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-cyan-300 mb-1">元素防具（依職能共用）</h3>
        <p className="text-xs text-gray-400 mb-2">
          同職能玩家共享同一套外觀，按坦克 / 近戰 / 遠程 / 治療 / 法職分組
        </p>
        <div
          data-testid="role-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {visibleSets.map((set) => {
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
