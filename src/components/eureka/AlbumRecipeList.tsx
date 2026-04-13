// src/components/eureka/AlbumRecipeList.tsx
import { useState, useMemo } from 'react';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction, LogogramPrice } from '@/types/eureka';
import { eurekaData } from '@/data/eureka-data';
import { cn } from '@/lib/utils';

interface AlbumRecipeListProps {
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

function recipeCost(action: LogosAction, priceMap: Map<number, number | null>): number | null {
  if (action.recipes.length === 0) return null;
  const ingredients = action.recipes[0]!.ingredients;
  let total = 0;
  for (const ing of ingredients) {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (!logogram) return null;
    const price = priceMap.get(logogram.itemId);
    if (price == null) return null;
    total += price * ing.quantity;
  }
  return total;
}

export default function AlbumRecipeList({
  learnedSkills,
  onToggle,
  prices,
  priceLoading,
}: AlbumRecipeListProps) {
  const [expanded, setExpanded] = useState(false);

  const priceMap = useMemo(() => new Map(prices.map((p) => [p.itemId, p.price])), [prices]);

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
        <div className="border border-border border-t-0 rounded-b-lg bg-card p-3 space-y-1.5">
          {orderedActions.map((action, idx) => {
            const isLearned = learnedSkills.has(action.id);
            const ingredients = action.recipes[0]?.ingredients ?? [];
            const matsStr = ingredients
              .map((i) => {
                const mneme = getMneme(i.mnemeId);
                return `${mneme?.nameTw ?? i.mnemeId} ×${i.quantity}`;
              })
              .join(' + ');
            const cost = recipeCost(action, priceMap);

            return (
              <button
                key={action.id}
                onClick={() => onToggle(action.id)}
                className={cn(
                  'w-full text-left bg-background border border-border rounded-md px-3 py-2 flex items-center gap-2 cursor-pointer transition-all hover:border-muted-foreground hover:bg-card',
                  isLearned && 'opacity-40'
                )}
              >
                <img
                  src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                  alt=""
                  className="w-7 h-7 rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className={cn('text-xs', isLearned ? 'text-muted-foreground' : 'text-foreground')}>
                    {idx + 1}. {action.nameTw}
                    {isLearned && (
                      <span className="text-primary-dark text-[10px] ml-1">✓ 已習得</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{matsStr}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={cn(
                      'text-xs font-medium',
                      isLearned ? 'text-muted-foreground line-through' : 'text-amber-400'
                    )}
                  >
                    {priceLoading
                      ? '...'
                      : cost != null
                        ? `${cost.toLocaleString()} Gil`
                        : '—'}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {isLearned ? '點擊取消' : '點擊標記習得'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
