// src/components/eureka/AlbumGrid.tsx
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction } from '@/types/eureka';
import type { Recipe } from '@/types/eureka';
import ActionDetailTooltip from './ActionDetailTooltip';
import SynthesisPopup from './SynthesisPopup';
import { cn } from '@/lib/utils';

interface AlbumGridProps {
  learnedSkills: Set<string>;
  onToggle: (skillId: string) => void;
  mode?: 'album' | 'synthesis';
  inventory?: Record<string, number>;
  onSynthesize?: (recipe: Recipe) => void;
}

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

export default function AlbumGrid({ learnedSkills, onToggle, mode = 'album', inventory = {}, onSynthesize }: AlbumGridProps) {
  const orderedActions = useMemo(() => {
    return ALBUM_ORDER.map((id) => actionMap.get(id)).filter(
      (a): a is LogosAction => a !== undefined
    );
  }, []);

  const [tappedId, setTappedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Close tooltip when tapping outside the grid
  useEffect(() => {
    if (!tappedId) return;
    const handleClick = (e: MouseEvent) => {
      if (gridRef.current?.contains(e.target as Node)) return;
      setTappedId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [tappedId]);

  const handleCellClick = useCallback((actionId: string, e: React.MouseEvent) => {
    if (mode === 'synthesis') {
      e.preventDefault();
      setTappedId((prev) => (prev === actionId ? null : actionId));
      return;
    }
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) {
      e.preventDefault();
      setTappedId((prev) => (prev === actionId ? null : actionId));
    } else {
      onToggle(actionId);
    }
  }, [onToggle, mode]);

  return (
    <div className="grid grid-cols-10 gap-0.5" ref={gridRef}>
      {orderedActions.map((action, idx) => {
        const isLearned = learnedSkills.has(action.id);
        const row = Math.floor(idx / 10);
        const col = idx % 10;
        const isTapped = tappedId === action.id;

        return (
          <div
            key={action.id}
            className="relative group"
          >
            <button
              onClick={(e) => handleCellClick(action.id, e)}
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

            {/* Desktop: hover tooltip (no learn button) */}
            <div
              className={cn(
                'hidden group-hover:block absolute z-50 pointer-events-none',
                row < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                col < 2 ? 'left-0' : col > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              )}
            >
              <ActionDetailTooltip action={action} />
            </div>

            {/* Mobile: tap tooltip (with learn button) */}
            {isTapped && (
              <div
                className={cn(
                  'absolute z-50',
                  row < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                  col < 2 ? 'left-0' : col > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {mode === 'synthesis' ? (
                  <SynthesisPopup
                    action={action}
                    inventory={inventory}
                    onSynthesize={(recipe) => {
                      onSynthesize?.(recipe);
                      if (!learnedSkills.has(action.id)) {
                        onToggle(action.id);
                      }
                    }}
                    onClose={() => setTappedId(null)}
                  />
                ) : (
                  <ActionDetailTooltip
                    action={action}
                    learnButton={
                      <button
                        onClick={() => { onToggle(action.id); setTappedId(null); }}
                        className={cn(
                          'w-full text-xs py-1.5 rounded cursor-pointer transition-colors font-medium',
                          isLearned
                            ? 'bg-primary-dark/20 text-primary-dark hover:bg-primary-dark/30'
                            : 'bg-primary-dark/80 text-primary-foreground hover:bg-primary-dark'
                        )}
                      >
                        {isLearned ? '✓ 已習得 — 點擊取消' : '標記習得'}
                      </button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
