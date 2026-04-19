import type {
  DisplayMode, EquipSlot, EurekaStage, GearFilterState, GearTag, JobId, SortMode,
} from '@/types/eureka-gear';

const STAGES: EurekaStage[] = [
  'antique', 'anemos', 'pagos', 'pagos+1', 'pyros', 'hydatos', 'hydatos+1',
  'elemental', 'elemental+1', 'physeos',
];
const SLOTS: Array<{ id: EquipSlot; label: string }> = [
  { id: 'weapon', label: '武器' }, { id: 'head', label: '頭' },
  { id: 'body', label: '身' }, { id: 'hands', label: '手' },
  { id: 'legs', label: '腳' }, { id: 'feet', label: '足' },
];
const JOBS: JobId[] = [
  'PLD','WAR','DRK','GNB',
  'WHM','SCH','AST','SGE',
  'MNK','DRG','NIN','SAM','RPR',
  'BRD','MCH','DNC',
  'BLM','SMN','RDM','BLU',
];
const TAGS: Array<{ id: GearTag; label: string }> = [
  { id: 'glow-water-island', label: '水島發光' },
  { id: 'eureka-bonus', label: '優雷卡補正' },
  { id: 'ozma-only', label: '歐茲瑪限定' },
];
const DISPLAY_MODES: Array<{ id: DisplayMode; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'affordable', label: '可兌換' },
  { id: 'unowned', label: '未持有' },
  { id: 'owned', label: '已持有' },
];
const SORTS: Array<{ id: SortMode; label: string }> = [
  { id: 'stage', label: '階段' }, { id: 'job', label: '職業' }, { id: 'npc', label: 'NPC' },
];

interface GearFilterBarProps {
  filter: GearFilterState;
  onChange: (next: GearFilterState) => void;
}

export default function GearFilterBar({ filter, onChange }: GearFilterBarProps) {
  function toggleSet<T>(set: Set<T>, v: T): Set<T> {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    return next;
  }

  function chip(selected: boolean, onClick: () => void, label: string, key: string) {
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        className={`px-2 py-0.5 rounded border text-xs ${
          selected ? 'border-primary text-primary' : 'border-border/50 text-muted-foreground'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2 text-xs">
      <input
        type="text"
        placeholder="搜尋"
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
        className="bg-transparent border border-border/50 rounded px-2 py-1 text-sm outline-none focus:border-primary"
      />
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-muted-foreground mr-1">階段</span>
        {STAGES.map((s) =>
          chip(
            filter.stages.has(s),
            () => onChange({ ...filter, stages: toggleSet(filter.stages, s) }),
            s,
            s,
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-muted-foreground mr-1">部位</span>
        {SLOTS.map((s) =>
          chip(
            filter.slots.has(s.id),
            () => onChange({ ...filter, slots: toggleSet(filter.slots, s.id) }),
            s.label,
            s.id,
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-muted-foreground mr-1">職業</span>
        {JOBS.map((j) =>
          chip(
            filter.jobs.has(j),
            () => onChange({ ...filter, jobs: toggleSet(filter.jobs, j) }),
            j,
            j,
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-muted-foreground mr-1">標籤</span>
        {TAGS.map((t) =>
          chip(
            filter.tags.has(t.id),
            () => onChange({ ...filter, tags: toggleSet(filter.tags, t.id) }),
            t.label,
            t.id,
          ),
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">顯示</span>
        {DISPLAY_MODES.map((m) => (
          <label key={m.id} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="gear-display"
              checked={filter.display === m.id}
              onChange={() => onChange({ ...filter, display: m.id })}
              aria-label={m.label}
            />
            {m.label}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">排序</span>
        <select
          value={filter.sort}
          onChange={(e) => onChange({ ...filter, sort: e.target.value as SortMode })}
          className="bg-card border border-border/50 rounded px-2 py-0.5"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
