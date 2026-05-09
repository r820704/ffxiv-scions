// src/components/eureka/SkillRecipeList.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction, LogogramPrice, Role } from '@/types/eureka';
import { eurekaData } from '@/data/eureka-data';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import type { OptimizationResult } from '@/utils/recipe-optimizer';
import type { SlotConfig, SlotOptimizationResult } from '@/utils/slot-optimizer';
import type { CalcMode } from '@/hooks/useCalcMode';
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

type StateFilter = 'all' | 'unlearned' | 'learned' | 'guide';

interface SkillRecipeListProps {
  mode: CalcMode;
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
  // Album mode
  optimizationResult?: OptimizationResult | null;
  // Slot mode
  slotConfig?: SlotConfig;
  slotResult?: SlotOptimizationResult | null;
}

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

export default function SkillRecipeList({
  mode,
  learnedSkills,
  onToggle,
  prices,
  priceLoading,
  optimizationResult,
  slotConfig,
  slotResult,
}: SkillRecipeListProps) {
  const [search, setSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [expandedSet, setExpandedSet] = useState<Set<string>>(() => new Set(ALBUM_ORDER));

  // Per-slot per-side recipe overrides for slot-pick + guide interactive mode.
  // Resets when leaving that mode; not persisted to localStorage.
  type SlotOverrides = Record<number, { skill1RecipeIdx?: number; skill2RecipeIdx?: number }>;
  const [slotOverrides, setSlotOverrides] = useState<SlotOverrides>({});

  useEffect(() => {
    if (!(mode === 'slots' && stateFilter === 'guide')) {
      setSlotOverrides({});
    }
  }, [mode, stateFilter]);

  const updateSlotOverride = useCallback(
    (slotIdx: number, side: 'skill1' | 'skill2', recipeIdx: number) => {
      setSlotOverrides((prev) => ({
        ...prev,
        [slotIdx]: {
          ...prev[slotIdx],
          [`${side}RecipeIdx`]: recipeIdx,
        },
      }));
    },
    [],
  );

  // Auto-switch to 'guide' when a fresh result arrives (both modes)
  useEffect(() => {
    if (mode === 'album' && optimizationResult) {
      setStateFilter('guide');
    }
  }, [optimizationResult, mode]);

  useEffect(() => {
    if (mode === 'slots' && slotResult) {
      setStateFilter('guide');
    }
  }, [slotResult, mode]);

  // When switching modes, reset state filter to a valid option
  useEffect(() => {
    if (mode === 'slots' && (stateFilter === 'learned' || stateFilter === 'unlearned')) {
      setStateFilter('all');
    }
  }, [mode, stateFilter]);

  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  const slotSkillIds = useMemo(() => {
    const ids = new Set<string>();
    if (mode !== 'slots' || !slotConfig) return ids;
    slotConfig.forEach(([s1, s2]) => {
      if (s1) ids.add(s1);
      if (s2) ids.add(s2);
    });
    return ids;
  }, [mode, slotConfig]);

  const hasAnyFilter =
    selectedRoles.size > 0 || selectedTags.size > 0 || stateFilter !== 'all' || search !== '';

  const filtered = useMemo(() => {
    return orderedActions.filter((action) => {
      if (selectedRoles.size > 0) {
        const matchesRole = action.roles.includes('all') || action.roles.some((r) => selectedRoles.has(r));
        if (!matchesRole) return false;
      }
      if (selectedTags.size > 0) {
        const tags = getActionTags(action.descriptionTw);
        if (!tags.some((t) => selectedTags.has(t))) return false;
      }
      if (mode === 'album') {
        if ((stateFilter === 'unlearned' || stateFilter === 'guide') && learnedSkills.has(action.id)) return false;
        if (stateFilter === 'learned' && !learnedSkills.has(action.id)) return false;
      } else {
        // slot mode: guide filter = only skills in slotConfig
        if (stateFilter === 'guide' && !slotSkillIds.has(action.id)) return false;
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
  }, [orderedActions, search, selectedRoles, selectedTags, stateFilter, learnedSkills, mode, slotSkillIds]);

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
    setStateFilter('all');
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

  const stateButtons: { value: StateFilter; label: string }[] =
    mode === 'album'
      ? [
          { value: 'all', label: '全部' },
          { value: 'unlearned', label: '未習得' },
          { value: 'learned', label: '已習得' },
        ]
      : [{ value: 'all', label: '全部' }];

  const guideEnabled =
    mode === 'album' ? !!optimizationResult : !!slotResult && slotSkillIds.size > 0;

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="搜尋技能名稱或說明..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* State filter */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {stateButtons.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStateFilter(value)}
            className={cn(
              'text-xs px-2 py-1 rounded transition-colors',
              stateFilter === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {label}
          </button>
        ))}
        <span className="text-border mx-0.5">|</span>
        <span className="relative group inline-block">
          <button
            onClick={() => setStateFilter(stateFilter === 'guide' ? 'all' : 'guide')}
            disabled={!guideEnabled}
            className={cn(
              'text-xs px-2 py-1 rounded transition-colors',
              stateFilter === 'guide'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              !guideEnabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            合成指南
          </button>
          {!guideEnabled && (
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover text-popover-foreground text-xs whitespace-nowrap shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              尚未計算合成方案，請先點擊上方計算按鈕
              <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-border" />
            </span>
          )}
        </span>
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

      {/* Effect tag filter */}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`text-[0.65rem] px-1.5 py-0.5 rounded transition-colors ${
              selectedTags.has(tag)
                ? 'bg-primary text-primary-foreground'
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
            disabled={mode === 'slots' && stateFilter === 'guide'}
            className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:border-border"
          >
            全部展開
          </button>
          <button
            onClick={collapseAll}
            disabled={mode === 'slots' && stateFilter === 'guide'}
            className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:border-border"
          >
            全部縮合
          </button>
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-2 min-h-[200px]">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            {stateFilter === 'learned' ? '尚未習得任何技能' : '沒有符合條件的技能'}
          </div>
        ) : mode === 'slots' && stateFilter === 'guide' ? (
          renderSlotGroups({
            filtered, slotConfig, slotResult,
            prices, priceLoading, learnedSkills, onToggle,
            slotOverrides, updateSlotOverride,
          })
        ) : (
          filtered.map((action) => {
            const isLearned = learnedSkills.has(action.id);
            const isGuideMode = stateFilter === 'guide';
            const guideIdx =
              mode === 'album' && isGuideMode
                ? optimizationResult?.selectedRecipes[action.id]
                : undefined;
            const isExpanded = isGuideMode ? true : expandedSet.has(action.id);
            const dim = mode === 'album' && !isLearned && !isGuideMode;

            return (
              <div key={action.id} className="flex items-start gap-2">
                <div className={cn('flex-1 min-w-0', dim && 'opacity-60')}>
                  <LogosActionCard
                    action={action}
                    prices={prices}
                    priceLoading={priceLoading}
                    isExpanded={isExpanded}
                    onToggleExpand={isGuideMode ? undefined : () => toggleCardExpand(action.id)}
                    guideRecipeIdx={guideIdx}
                    showUnitPriceOnly={isGuideMode}
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

interface RenderSlotGroupsArgs {
  filtered: LogosAction[];
  slotConfig: SlotConfig | undefined;
  slotResult: SlotOptimizationResult | null | undefined;
  prices: LogogramPrice[];
  priceLoading: boolean;
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
  slotOverrides: Record<number, { skill1RecipeIdx?: number; skill2RecipeIdx?: number }>;
  updateSlotOverride: (slotIdx: number, side: 'skill1' | 'skill2', recipeIdx: number) => void;
}

function renderSlotGroups({
  filtered, slotConfig, slotResult, prices, priceLoading, learnedSkills, onToggle,
  slotOverrides, updateSlotOverride,
}: RenderSlotGroupsArgs) {
  if (!slotConfig || !slotResult) return null;
  const filteredIds = new Set(filtered.map((a) => a.id));

  // Build groups sorted by slot index
  const groups = slotConfig
    .map((entry, slotIdx) => ({ slotIdx, skill1Id: entry[0], skill2Id: entry[1] }))
    .filter(({ skill1Id, skill2Id }) => {
      if (!skill1Id && !skill2Id) return false;
      // Only include groups whose skills pass the current filter
      return (
        (skill1Id && filteredIds.has(skill1Id)) ||
        (skill2Id && filteredIds.has(skill2Id))
      );
    });

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        沒有符合條件的技能
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(({ slotIdx, skill1Id, skill2Id }) => {
        const recommended = slotResult.slotCombinations[slotIdx]?.[0];
        if (!recommended) return null;
        const skill1 = skill1Id ? actionMap.get(skill1Id) : null;
        const skill2 = skill2Id ? actionMap.get(skill2Id) : null;

        const override = slotOverrides[slotIdx];
        const effective1 = override?.skill1RecipeIdx ?? recommended.skill1RecipeIdx;
        const effective2 = override?.skill2RecipeIdx ?? recommended.skill2RecipeIdx;
        const effectiveCombo =
          slotResult.slotCombinations[slotIdx]?.find(
            (c) => c.skill1RecipeIdx === effective1 && c.skill2RecipeIdx === effective2,
          ) ?? null;
        const successRate = effectiveCombo?.successRate ?? null;
        const totalMnemes = effectiveCombo?.totalMnemes ?? null;

        const buildSkillEntry = (
          action: LogosAction,
          side: 'skill1' | 'skill2',
          effectiveIdx: number,
          recommendedIdx: number,
        ) => {
          const allIdx = action.recipes.map((_, i) => i);
          const sortedIndices = [effectiveIdx, ...allIdx.filter((i) => i !== effectiveIdx)];
          return { action, side, effectiveIdx, recommendedIdx, sortedIndices };
        };

        type SkillEntry = ReturnType<typeof buildSkillEntry>;
        const skills: SkillEntry[] = [];
        if (skill1) {
          skills.push(buildSkillEntry(skill1, 'skill1', effective1, recommended.skill1RecipeIdx));
        }
        if (skill2 && recommended.skill2RecipeIdx != null && effective2 != null) {
          skills.push(buildSkillEntry(skill2, 'skill2', effective2, recommended.skill2RecipeIdx));
        }

        const calcParts: string[] = [];
        if (skill1) calcParts.push(`${skill1.nameTw}#${effective1 + 1}`);
        if (skill2 && effective2 != null) calcParts.push(`${skill2.nameTw}#${effective2 + 1}`);
        const calcLabel = calcParts.length > 0 ? `計算：${calcParts.join(' + ')}` : '';

        return (
          <div key={slotIdx} className="space-y-1.5">
            {/* Slot header */}
            <div className="flex items-center gap-2 px-1 text-xs">
              <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
                格 {slotIdx + 1}
              </span>
              {calcLabel && (
                <span className="text-[0.65rem] text-muted-foreground truncate min-w-0">
                  {calcLabel}
                </span>
              )}
              <span
                className={cn(
                  'ml-auto shrink-0',
                  successRate == null
                    ? 'text-muted-foreground'
                    : successRate >= 1.0
                      ? 'text-green-400'
                      : 'text-warning',
                )}
              >
                {successRate != null
                  ? `${Math.round(successRate * 100)}% 成功${(totalMnemes ?? 0) > 3 ? `（${totalMnemes} 記憶）` : ''}`
                  : '—'}
              </span>
            </div>

            {/* Pair cards (1 or 2 side by side on md+) */}
            <div
              className={cn(
                'grid gap-2',
                skills.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
              )}
            >
              {skills.map(({ action, side, recommendedIdx, sortedIndices }) => {
                const isLearned = learnedSkills.has(action.id);
                return (
                  <div key={action.id} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <LogosActionCard
                        action={action}
                        prices={prices}
                        priceLoading={priceLoading}
                        isExpanded
                        highlightRecipeIdx={recommendedIdx}
                        recipeOrder={sortedIndices}
                        showUnitPriceOnly
                        compactLayout
                        onRecipeClick={(idx) => updateSlotOverride(slotIdx, side, idx)}
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
      })}
    </div>
  );
}
