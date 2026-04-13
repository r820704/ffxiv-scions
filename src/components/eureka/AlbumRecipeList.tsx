// src/components/eureka/AlbumRecipeList.tsx
import { useState, useMemo } from 'react';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { eurekaData } from '@/data/eureka-data';
import LogosActionCard from './LogosActionCard';
import { cn } from '@/lib/utils';

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
  const [expanded, setExpanded] = useState(false);

  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm font-medium text-primary flex justify-between items-center cursor-pointer hover:bg-secondary transition-colors"
      >
        <span>全部技能配方</span>
        <span
          className={cn(
            'text-xs text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="border border-border border-t-0 rounded-b-lg bg-card p-3 space-y-2">
          {orderedActions.map((action) => {
            const isLearned = learnedSkills.has(action.id);
            return (
              <div key={action.id} className="flex items-start gap-2">
                <div className={cn('flex-1 min-w-0', isLearned && 'opacity-40')}>
                  <LogosActionCard
                    action={action}
                    prices={prices}
                    priceLoading={priceLoading}
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
      )}
    </div>
  );
}
