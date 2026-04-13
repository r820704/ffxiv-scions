// src/components/eureka/AlbumGrid.tsx
import { useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction } from '@/types/eureka';
import ActionDetailTooltip from './ActionDetailTooltip';
import { cn } from '@/lib/utils';

interface AlbumGridProps {
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
}

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

export default function AlbumGrid({ learnedSkills, onToggle }: AlbumGridProps) {
  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  return (
    <div className="grid grid-cols-10 gap-0.5">
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

            {/* Tooltip — uses ActionDetailTooltip for full detail */}
            <div
              className={cn(
                'hidden group-hover:block absolute z-50 pointer-events-none',
                row < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                col < 2 ? 'left-0' : col > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              )}
            >
              <ActionDetailTooltip action={action} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
