import { useMemo, useState } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction } from '@/types/eureka';
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

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredAction = hoveredId ? actionMap.get(hoveredId) : null;

  const pickDisabled = mode === 'slot-pick' && selectedSlot === null;

  const handleClick = (id: string) => {
    if (mode === 'learn') {
      onToggleLearn(id);
    } else if (selectedSlot !== null) {
      onPickForSlot(id);
    }
  };

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
      <div className="grid grid-cols-10 gap-0.5">
        {orderedActions.map((action) => {
          const isLearned = learnedSkills.has(action.id);
          const isUsed = usedSkillIds.has(action.id);
          const dim =
            mode === 'slot-pick'
              ? isUsed || pickDisabled
              : !isLearned;
          return (
            <button
              key={action.id}
              className={cn(
                'aspect-square rounded border cursor-pointer flex items-center justify-center transition-all',
                mode === 'learn' && isLearned
                  ? 'border-primary-dark border-2 bg-card opacity-100'
                  : 'border-border bg-card',
                dim && 'opacity-40',
                !dim && 'hover:border-muted-foreground hover:opacity-90',
                pickDisabled && 'cursor-default',
              )}
              onClick={() => handleClick(action.id)}
              onMouseEnter={() => setHoveredId(action.id)}
              onMouseLeave={() => setHoveredId(null)}
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
          );
        })}
      </div>
      {hoveredAction && (
        <div className="text-[10px] text-muted-foreground mt-1 h-4 truncate">
          {hoveredAction.nameTw}
        </div>
      )}
    </div>
  );
}
