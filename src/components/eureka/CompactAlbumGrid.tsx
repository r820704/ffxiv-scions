import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction } from '@/types/eureka';
import ActionDetailTooltip from './ActionDetailTooltip';
import { cn } from '@/lib/utils';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

export type CompactAlbumGridMode = 'learn' | 'slot-pick';

interface CompactAlbumGridProps {
  mode: CompactAlbumGridMode;
  learnedSkills: Set<string>;
  usedSkillIds: Set<string>;
  selectedSlot: number | null;
  onToggleLearn: (skillId: string) => void;
  onPickForSlot: (skillId: string) => void;
}

export default function CompactAlbumGrid({
  mode,
  learnedSkills,
  usedSkillIds,
  selectedSlot,
  onToggleLearn,
  onPickForSlot,
}: CompactAlbumGridProps) {
  const orderedActions = useMemo(
    () => ALBUM_ORDER.map((id) => actionMap.get(id)).filter((a): a is LogosAction => !!a),
    [],
  );

  const [tappedId, setTappedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tappedId) return;
    const handleClick = (e: MouseEvent) => {
      if (gridRef.current?.contains(e.target as Node)) return;
      setTappedId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [tappedId]);

  const pickDisabled = mode === 'slot-pick' && selectedSlot === null;

  const handleCellClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      const isTouch =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches;
      if (isTouch) {
        e.preventDefault();
        setTappedId((prev) => (prev === id ? null : id));
        return;
      }
      if (mode === 'learn') {
        onToggleLearn(id);
      } else if (selectedSlot !== null) {
        onPickForSlot(id);
      }
    },
    [mode, selectedSlot, onToggleLearn, onPickForSlot],
  );

  return (
    <div>
      {mode === 'slot-pick' && selectedSlot !== null && (
        <div className="text-[10px] text-amber-400 mb-1">
          👆 已選格子 {selectedSlot + 1}，點擊技能放入
        </div>
      )}
      {mode === 'slot-pick' && selectedSlot === null && (
        <div className="text-[10px] text-muted-foreground/50 mb-1">
          先選擇一個格子
        </div>
      )}
      {mode === 'learn' && (
        <div className="text-[10px] text-muted-foreground mb-1">
          點擊技能切換已學/未學
        </div>
      )}
      <div className="grid grid-cols-10 gap-0.5 w-full" ref={gridRef}>
        {orderedActions.map((action, idx) => {
          const isLearned = learnedSkills.has(action.id);
          const isUsed = usedSkillIds.has(action.id);
          const dim =
            mode === 'slot-pick'
              ? isUsed || pickDisabled
              : !isLearned;
          const row = Math.floor(idx / 10);
          const col = idx % 10;
          const isTapped = tappedId === action.id;

          return (
            <div key={action.id} className="relative group">
              <button
                className={cn(
                  'w-full aspect-square rounded border cursor-pointer flex items-center justify-center transition-all',
                  mode === 'learn' && isLearned
                    ? 'border-primary-dark border-2 bg-card opacity-100'
                    : 'border-border bg-card',
                  dim && 'opacity-40',
                  !dim && 'hover:border-muted-foreground hover:opacity-90',
                  pickDisabled && 'cursor-default',
                )}
                onClick={(e) => handleCellClick(action.id, e)}
                title={action.nameTw}
                aria-label={action.nameTw}
                disabled={pickDisabled}
              >
                <img
                  src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                  alt=""
                  loading="lazy"
                  className={cn(
                    'w-[80%] h-[80%] object-contain',
                    mode === 'learn' && !isLearned && 'brightness-[0.35] grayscale',
                  )}
                />
              </button>

              {/* Desktop: hover tooltip */}
              <div
                className={cn(
                  'hidden group-hover:block absolute z-50 pointer-events-none',
                  row < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                  col < 2 ? 'left-0' : col > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2',
                )}
              >
                <ActionDetailTooltip action={action} />
              </div>

              {/* Mobile: tap tooltip with action button */}
              {isTapped && (
                <div
                  className={cn(
                    'absolute z-50',
                    row < 2 ? 'top-full mt-2' : 'bottom-full mb-2',
                    col < 2 ? 'left-0' : col > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2',
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ActionDetailTooltip
                    action={action}
                    learnButton={
                      mode === 'learn' ? (
                        <button
                          onClick={() => {
                            onToggleLearn(action.id);
                            setTappedId(null);
                          }}
                          className={cn(
                            'w-full text-xs py-1.5 rounded cursor-pointer transition-colors font-medium',
                            isLearned
                              ? 'bg-primary-dark/20 text-primary-dark hover:bg-primary-dark/30'
                              : 'bg-primary-dark/80 text-primary-foreground hover:bg-primary-dark',
                          )}
                        >
                          {isLearned ? '✓ 已習得 — 點擊取消' : '標記習得'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (selectedSlot !== null) {
                              onPickForSlot(action.id);
                              setTappedId(null);
                            }
                          }}
                          disabled={selectedSlot === null}
                          className={cn(
                            'w-full text-xs py-1.5 rounded cursor-pointer transition-colors font-medium',
                            selectedSlot === null
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-amber-600 text-amber-50 hover:bg-amber-500',
                          )}
                        >
                          {selectedSlot === null ? '先選擇一個格子' : `放入格子 ${selectedSlot + 1}`}
                        </button>
                      )
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
