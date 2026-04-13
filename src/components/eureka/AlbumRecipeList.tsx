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
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedSet, setExpandedSet] = useState<Set<string>>(() => new Set(ALBUM_ORDER));

  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  const filtered = useMemo(() => {
    return orderedActions.filter((action) => {
      if (selectedRole && !action.roles.includes(selectedRole) && !action.roles.includes('all')) return false;
      if (selectedTag) {
        const tags = getActionTags(action.descriptionTw);
        if (!tags.includes(selectedTag)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !action.nameTw.toLowerCase().includes(q) &&
          !action.descriptionTw.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [orderedActions, search, selectedRole, selectedTag]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    orderedActions.forEach((action) => {
      getActionTags(action.descriptionTw).forEach((tag) => tagSet.add(tag));
    });
    return EFFECT_TAGS.filter((t) => tagSet.has(t.label)).map((t) => t.label);
  }, [orderedActions]);

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

      {/* Role filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedRole(null)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            selectedRole === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          全職業
        </button>
        {FILTERABLE_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(selectedRole === role ? null : role)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedRole === role
                ? ROLE_COLORS[role]
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      {/* Effect tag filter */}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`text-[0.65rem] px-1.5 py-0.5 rounded transition-colors ${
              selectedTag === tag
                ? 'bg-amber-600 text-amber-50'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Count + expand/collapse controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          顯示 {filtered.length} / {orderedActions.length} 個技能
        </span>
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
      <div className="space-y-2">
        {filtered.map((action) => {
          const isLearned = learnedSkills.has(action.id);
          return (
            <div key={action.id} className="flex items-start gap-2">
              <div className={cn('flex-1 min-w-0', isLearned && 'opacity-40')}>
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
        })}
      </div>
    </div>
  );
}
