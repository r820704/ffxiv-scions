import { useState, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import type { LogosCategory, LogogramPrice, Role } from '@/types/eureka';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import CategoryFilter from './CategoryFilter';
import LogosActionCard from './LogosActionCard';

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

interface LogosActionListProps {
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function LogosActionList({ prices, priceLoading }: LogosActionListProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LogosCategory | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return eurekaData.logosActions.filter((action) => {
      if (category && action.category !== category) return false;
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
        ) {
          return false;
        }
      }
      return true;
    });
  }, [search, category, selectedRole, selectedTag]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    eurekaData.logosActions.forEach((action) => {
      getActionTags(action.descriptionTw).forEach((tag) => tagSet.add(tag));
    });
    return EFFECT_TAGS.filter((t) => tagSet.has(t.label)).map((t) => t.label);
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
      <CategoryFilter selected={category} onSelect={setCategory} />

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

      <div className="text-xs text-muted-foreground">
        顯示 {filtered.length} / {eurekaData.logosActions.length} 個技能
      </div>
      <div className="space-y-2">
        {filtered.map((action) => (
          <LogosActionCard
            key={action.id}
            action={action}
            prices={prices}
            priceLoading={priceLoading}
          />
        ))}
      </div>
    </div>
  );
}
