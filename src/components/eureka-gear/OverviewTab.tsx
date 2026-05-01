import { useMemo, useState } from 'react';
import { JobCard } from './JobCard';
import { RoleCard } from './RoleCard';
import { ProgressSummary } from './ProgressSummary';
import { MainJobPickerDialog } from './MainJobPickerDialog';
import { getJobProgress } from '../../utils/eurekaGear';
import { useMainJobs } from '../../hooks/useMainJobs';
import type { EurekaInventoryV5, EurekaWeapon, ArmorSetId } from '../../types/eureka-gear';
import { ARMOR_SET_IDS } from '../../types/eureka-gear';
import {
  ARMOR_SET_FOR_JOB,
  ARMOR_SET_FOR_ANY_JOB,
  JOBS_FOR_ARMOR_SET,
  JOBS_WITH_WEAPONS,
  type AnyJobId,
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
  const { mainJobs, setMainJobs, mainJobsActive, setMainJobsActive } = useMainJobs();
  const [pickerOpen, setPickerOpen] = useState(false);

  const jobProgresses = useMemo(
    () => JOBS_WITH_WEAPONS.map((job) => ({ job, progress: getJobProgress(job, inventory) })),
    [inventory],
  );

  const mainJobsSet = useMemo(() => new Set(mainJobs), [mainJobs]);

  // Main-jobs filter takes precedence over the role chip when active.
  const filteringByMain = mainJobsActive && mainJobs.length > 0;

  const visibleJobs = useMemo(() => {
    if (filteringByMain) return jobProgresses.filter(({ job }) => mainJobsSet.has(job));
    if (role === 'all') return jobProgresses;
    return jobProgresses.filter(({ job }) => ARMOR_SET_TO_ROLE[ARMOR_SET_FOR_JOB[job]] === role);
  }, [jobProgresses, role, filteringByMain, mainJobsSet]);

  const visibleSets = useMemo(() => {
    if (filteringByMain) {
      // When filtering by main jobs, show only role-armor sets that any main job belongs to.
      const roles = new Set(mainJobs.map((j) => ARMOR_SET_TO_ROLE[ARMOR_SET_FOR_ANY_JOB[j]]));
      return ARMOR_SET_IDS.filter((set) => roles.has(ARMOR_SET_TO_ROLE[set]));
    }
    if (role === 'all') return ARMOR_SET_IDS;
    return ARMOR_SET_IDS.filter((set) => ARMOR_SET_TO_ROLE[set] === role);
  }, [role, filteringByMain, mainJobs]);

  const handleMainJobChipClick = () => {
    if (mainJobs.length === 0) {
      setPickerOpen(true);
    } else {
      setMainJobsActive((v) => !v);
    }
  };

  const handlePickerConfirm = (next: AnyJobId[]) => {
    setMainJobs(next);
    setPickerOpen(false);
    if (next.length > 0) setMainJobsActive(true);
    else setMainJobsActive(false);
  };

  return (
    <div className="space-y-6">
      <ProgressSummary inventory={inventory} />
      <div
        role="group"
        aria-label="職能篩選"
        data-testid="role-filter"
        className="flex flex-wrap items-center gap-1.5"
      >
        {FILTER_OPTIONS.map((opt) => {
          const active = !filteringByMain && opt === role;
          // Chip uses '全部' for filter UX context;
          // ROLE_LABELS.all is '全職業' which fits Logos pills but not single-select chips.
          const label = opt === 'all' ? '全部' : ROLE_LABELS[opt];
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setMainJobsActive(false);
                onRoleChange?.(opt);
              }}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                active
                  ? `${ROLE_COLORS[opt]} ring-2 ring-primary`
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {label}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={filteringByMain}
          onClick={handleMainJobChipClick}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            filteringByMain
              ? 'bg-yellow-500 text-black ring-2 ring-yellow-300'
              : mainJobs.length > 0
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-secondary/50 text-secondary-foreground border border-dashed border-yellow-700/60 hover:border-yellow-500'
          }`}
        >
          ⭐ {mainJobs.length > 0 ? `我的職業 (${mainJobs.length})` : '設定我的職業'}
        </button>
        {mainJobs.length > 0 && (
          <button
            type="button"
            aria-label="編輯我的職業"
            onClick={() => setPickerOpen(true)}
            className="text-xs px-1.5 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-secondary/80"
          >
            ✎
          </button>
        )}
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

      <MainJobPickerDialog
        isOpen={pickerOpen}
        initial={mainJobs}
        onConfirm={handlePickerConfirm}
        onCancel={() => setPickerOpen(false)}
      />
    </div>
  );
}
