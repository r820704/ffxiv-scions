// src/components/eureka/AlbumGrid.tsx
import { useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction } from '@/types/eureka';
import { CATEGORY_LABELS } from '@/types/eureka';
import { cn } from '@/lib/utils';

interface AlbumGridProps {
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
}

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

const catColors: Record<string, string> = {
  wisdom: 'text-purple-400',
  spirit: 'text-blue-400',
  offensive: 'text-red-400',
  defensive: 'text-cyan-600',
  healing: 'text-green-400',
  utility: 'text-amber-400',
  movement: 'text-emerald-400',
};

export default function AlbumGrid({ learnedSkills, onToggle }: AlbumGridProps) {
  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  return (
    <div className="grid grid-cols-10 gap-1">
      {orderedActions.map((action, idx) => {
        const isLearned = learnedSkills.has(action.id);
        const row = Math.floor(idx / 10);
        const col = idx % 10;

        return (
          <div
            key={action.id}
            className="relative group"
          >
            <button
              onClick={() => onToggle(action.id)}
              className={cn(
                'aspect-square w-full rounded border-2 flex items-center justify-center transition-all cursor-pointer',
                isLearned
                  ? 'border-primary-dark bg-card opacity-100'
                  : 'border-border bg-card opacity-40 hover:opacity-70 hover:border-muted-foreground'
              )}
            >
              <img
                src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                alt={action.nameTw}
                loading="lazy"
                className={cn(
                  'w-[78%] h-[78%] object-contain rounded-sm',
                  !isLearned && 'brightness-[0.25] grayscale'
                )}
              />
              {isLearned && (
                <span className="absolute bottom-0 right-0.5 text-[8px] text-primary-dark font-bold">
                  ✓
                </span>
              )}
            </button>

            {/* Tooltip */}
            <div
              className={cn(
                'hidden group-hover:block absolute z-50 w-[260px] bg-card border border-primary-dark rounded-lg p-3 shadow-xl pointer-events-none',
                row < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                col < 2 ? 'left-0' : col > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                  alt=""
                  className="w-9 h-9 rounded"
                />
                <div>
                  <div className="text-sm font-bold text-primary">{action.nameTw}</div>
                  <div className={cn('text-xs', catColors[action.category] || 'text-muted-foreground')}>
                    {CATEGORY_LABELS[action.category]} #{idx + 1}
                  </div>
                </div>
              </div>
              <div className="text-xs text-foreground leading-relaxed border-t border-border pt-2">
                {action.descriptionTw}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
