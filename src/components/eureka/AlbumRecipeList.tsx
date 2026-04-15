// src/components/eureka/AlbumRecipeList.tsx
import { useState, useMemo, useCallback } from 'react';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction, LogogramPrice, Role } from '@/types/eureka';
import { eurekaData } from '@/data/eureka-data';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import LogosActionCard from './LogosActionCard';
import { cn } from '@/lib/utils';

const EFFECT_TAGS: { label: string; keywords: string[] }[] = [
  { label: '攻擊力', keywords: ['攻擊力提高', '魔法攻擊力提高', '物理攻擊力提高', '威力'] },
  { label: '防禦', keywords: ['傷害減免', '傷害減少', '護盾', '防禦力'] },
  { label: '回復', keywords: ['回復HP', '回復力', '治療魔法'] },
  { label: '復活', keywords: ['復活', '自動復活'] },
  { label: '迴避', keywords: ['迴避率提高', '迴避'] },
  { label: '移動', keywords: ['移動速度', '跳躍', '瞬間移動'] },
  { label: 'HP', keywords: ['最大HP提高', 'HP'] },
  { label: 'MP', keywords: ['最大MP', 'MP消耗', 'MP'] },
  { label: '仇恨', keywords: ['仇恨'] },
  { label: '即死', keywords: ['即死'] },
  { label: '狀態異常', keywords: ['麻痺', '暈眩', '異常狀態'] },
  { label: '隱身', keywords: ['隱身'] },
];

function getActionTags(descriptionTw: string): string[] {
  return EFFECT_TAGS
    .filter((tag) => tag.keywords.some((kw) => descriptionTw.includes(kw)))
    .map((tag) => tag.label);
}

const FILTERABLE_ROLES: Role[] = ['tank', 'healer', 'melee', 'ranged', 'caster'];

type LearnedFilter = 'all' | 'unlearned' | 'learned';

interface AlbumRecipeListProps {
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

export default function AlbumRecipeList({
  learnedSkills,
  onToggle,
  prices,
  priceLoading,
}: AlbumRecipeListProps) {
  const [search, setSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [learnedFilter, setLearnedFilter] = useState<LearnedFilter>('all');
  const [expandedSet, setExpandedSet] = useState<Set<string>>(() => new Set(ALBUM_ORDER));

  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  const hasAnyFilter = selectedRoles.size > 0 || selectedTags.size > 0 || learnedFilter !== 'all' || search !== '';

  const filtered = useMemo(() => {
    return orderedActions.filter((action) => {
      // Role filter (multi-select OR)
      if (selectedRoles.size > 0) {
        const matchesRole = action.roles.includes('all') || action.roles.some((r) => selectedRoles.has(r));
        if (!matchesRole) return false;
      }
      // Tag filter (multi-select OR)
      if (selectedTags.size > 0) {
        const tags = getActionTags(action.descriptionTw);
        if (!tags.some((t) => selectedTags.has(t))) return false;
      }
      // Learned filter
      if (learnedFilter === 'unlearned' && learnedSkills.has(action.id)) return false;
      if (learnedFilter === 'learned' && !learnedSkills.has(action.id)) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        if (
          !action.nameTw.toLowerCase().includes(q) &&
          !action.descriptionTw.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [orderedActions, search, selectedRoles, selectedTags, learnedFilter, learnedSkills]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    orderedActions.forEach((action) => {
      getActionTags(action.descriptionTw).forEach((tag) => tagSet.add(tag));
    });
    return EFFECT_TAGS.filter((t) => tagSet.has(t.label)).map((t) => t.label);
  }, [orderedActions]);

  const toggleRole = useCallback((role: Role) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setSelectedRoles(new Set());
    setSelectedTags(new Set());
    setLearnedFilter('all');
  }, []);

  const toggleCardExpand = useCallback((actionId: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) next.delete(actionId);
      else next.add(actionId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSet(new Set(ALBUM_ORDER));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSet(new Set());
  }, []);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="搜尋技能名稱或說明..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Learned filter */}
      <div className="flex flex-wrap gap-1.5">
        {([['all', '全部'], ['unlearned', '未習得'], ['learned', '已習得']] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setLearnedFilter(value)}
            className={cn(
              'text-xs px-2 py-1 rounded transition-colors',
              learnedFilter === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Role filter (multi-select) */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERABLE_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedRoles.has(role)
                ? ROLE_COLORS[role]
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      {/* Effect tag filter (multi-select) */}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`text-[0.65rem] px-1.5 py-0.5 rounded transition-colors ${
              selectedTags.has(tag)
                ? 'bg-amber-600 text-amber-50'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Count + controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            顯示 {filtered.length} / {orderedActions.length} 個技能
          </span>
          {hasAnyFilter && (
            <button
              onClick={resetFilters}
              className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              重置篩選
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer"
          >
            全部展開
          </button>
          <button
            onClick={collapseAll}
            className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer"
          >
            全部縮合
          </button>
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-2 min-h-[200px]">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {learnedFilter === 'learned' ? '尚未習得任何技能' : '沒有符合條件的技能'}
          </div>
        ) : (
          filtered.map((action) => {
            const isLearned = learnedSkills.has(action.id);
            return (
              <div key={action.id} className="flex items-start gap-2">
                <div className={cn('flex-1 min-w-0', !isLearned && 'opacity-60')}>
                  <LogosActionCard
                    action={action}
                    prices={prices}
                    priceLoading={priceLoading}
                    isExpanded={expandedSet.has(action.id)}
                    onToggleExpand={() => toggleCardExpand(action.id)}
                  />
                </div>
                <button
                  onClick={() => onToggle(action.id)}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded border cursor-pointer transition-colors shrink-0 mt-3',
                    isLearned
                      ? 'border-primary-dark text-primary-dark bg-primary-dark/10 hover:bg-primary-dark/20'
                      : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                  )}
                >
                  {isLearned ? '✓ 已習得' : '標記習得'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
