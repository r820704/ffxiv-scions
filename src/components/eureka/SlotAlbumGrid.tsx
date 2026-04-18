import { useMemo, useState } from 'react';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogosAction } from '@/types/eureka';
import { cn } from '@/lib/utils';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

interface SlotAlbumGridProps {
  usedSkillIds: Set<string>;
  selectedSlot: number | null;
  onPickSkill: (skillId: string) => void;
}

export default function SlotAlbumGrid({
  usedSkillIds,
  selectedSlot,
  onPickSkill,
}: SlotAlbumGridProps) {
  const orderedActions = useMemo(
    () => ALBUM_ORDER.map((id) => actionMap.get(id)).filter((a): a is LogosAction => !!a),
    [],
  );

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredAction = hoveredId ? actionMap.get(hoveredId) : null;

  return (
    <div>
      {selectedSlot !== null && (
        <div className="text-[9px] text-muted-foreground mb-1">
          點擊技能放入格子 {selectedSlot + 1}
        </div>
      )}
      {selectedSlot === null && (
        <div className="text-[9px] text-muted-foreground/50 mb-1">
          先選擇一個格子
        </div>
      )}
      <div className="grid grid-cols-10 gap-0.5">
        {orderedActions.map((action) => {
          const isUsed = usedSkillIds.has(action.id);
          return (
            <button
              key={action.id}
              className={cn(
                'aspect-square rounded border cursor-pointer flex items-center justify-center transition-all',
                isUsed
                  ? 'border-primary-dark/50 bg-card opacity-40'
                  : 'border-border bg-card hover:border-muted-foreground hover:opacity-80',
                selectedSlot === null && 'opacity-50 cursor-default',
              )}
              onClick={() => onPickSkill(action.id)}
              onMouseEnter={() => setHoveredId(action.id)}
              onMouseLeave={() => setHoveredId(null)}
              title={action.nameTw}
            >
              <img
                src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                alt={action.nameTw}
                loading="lazy"
                className="w-[80%] h-[80%] object-contain"
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
