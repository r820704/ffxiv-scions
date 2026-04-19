import type { GearFilterState, FFXIVJob, EurekaStage } from '@/types/eureka-gear';
import {
  EUREKA_JOBS, EUREKA_STAGES, JOB_TC_LABEL, STAGE_TC_LABEL,
} from '@/types/eureka-gear';

interface Props {
  filter: GearFilterState;
  onChange: (next: GearFilterState) => void;
}

export default function GearFilterBar({ filter, onChange }: Props) {
  const toggleJob = (j: FFXIVJob) => {
    const next = new Set(filter.jobs);
    if (next.has(j)) next.delete(j);
    else next.add(j);
    onChange({ ...filter, jobs: next });
  };

  const toggleStage = (s: EurekaStage) => {
    const next = new Set(filter.stages);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ ...filter, stages: next });
  };

  return (
    <div className="space-y-2">
      <input
        type="search"
        placeholder="搜尋武器或職業"
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
        className="w-full px-3 py-1.5 rounded border border-border bg-background text-sm"
      />

      <div className="flex flex-wrap gap-1">
        {EUREKA_JOBS.map((j) => {
          const on = filter.jobs.has(j);
          return (
            <button
              key={j}
              type="button"
              onClick={() => toggleJob(j)}
              className={
                'text-xs px-2 py-0.5 rounded border ' +
                (on ? 'border-primary bg-primary/20 text-primary' : 'border-border/50 hover:border-primary')
              }
            >
              {JOB_TC_LABEL[j]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {EUREKA_STAGES.map((s) => {
          const on = filter.stages.has(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleStage(s)}
              className={
                'text-xs px-2 py-0.5 rounded border ' +
                (on ? 'border-primary bg-primary/20 text-primary' : 'border-border/50 hover:border-primary')
              }
            >
              {STAGE_TC_LABEL[s]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filter.onlyUpgradable}
            onChange={(e) => onChange({ ...filter, onlyUpgradable: e.target.checked })}
          />
          僅可升級
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filter.onlyCompleted}
            onChange={(e) => onChange({ ...filter, onlyCompleted: e.target.checked })}
          />
          已完成
        </label>
      </div>
    </div>
  );
}
