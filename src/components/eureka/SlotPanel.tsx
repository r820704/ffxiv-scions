// src/components/eureka/SlotPanel.tsx
import { eurekaData } from '@/data/eureka-data';
import { cn } from '@/lib/utils';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

interface SlotPanelProps {
  slotConfig: [string | null, string | null][];
  selectedSlot: number | null;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
}

export default function SlotPanel({
  slotConfig,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
}: SlotPanelProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground">前置技能</span>
      {slotConfig.map(([skill1, skill2], i) => {
        if (i === 2) {
          return (
            <div key={`label-${i}`}>
              <span className="text-[10px] text-muted-foreground mt-1 block">BA 技能</span>
              <SlotCell
                index={i}
                skill1={skill1}
                skill2={skill2}
                isDashed={false}
                isSelected={selectedSlot === i}
                onSelect={onSelectSlot}
                onClear={onClearSlot}
              />
            </div>
          );
        }
        return (
          <SlotCell
            key={i}
            index={i}
            skill1={skill1}
            skill2={skill2}
            isDashed={i < 2}
            isSelected={selectedSlot === i}
            onSelect={onSelectSlot}
            onClear={onClearSlot}
          />
        );
      })}
    </div>
  );
}

function SlotCell({
  index,
  skill1,
  skill2,
  isDashed,
  isSelected,
  onSelect,
  onClear,
}: {
  index: number;
  skill1: string | null;
  skill2: string | null;
  isDashed: boolean;
  isSelected: boolean;
  onSelect: (i: number) => void;
  onClear: (i: number) => void;
}) {
  const hasSkill = skill1 !== null;
  const action1 = skill1 ? actionMap.get(skill1) : null;
  const action2 = skill2 ? actionMap.get(skill2) : null;

  return (
    <div
      className={cn(
        'relative w-[120px] h-12 rounded-md flex items-center justify-center text-[9px] cursor-pointer transition-all',
        isDashed ? 'border-[1.5px] border-dashed' : 'border-[1.5px] border-solid',
        isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_6px_rgba(85,136,255,0.2)]'
          : hasSkill
            ? 'border-primary-dark bg-card shadow-[0_0_4px_rgba(165,123,24,0.13)]'
            : 'border-border bg-card/50',
      )}
      onClick={() => onSelect(index)}
    >
      <span className="absolute left-1 top-0.5 text-[7px] text-muted-foreground/60">
        {index + 1}
      </span>

      {hasSkill && (
        <button
          className="absolute right-0.5 top-0.5 text-[8px] text-destructive hover:text-destructive/80 z-10 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onClear(index); }}
        >
          ✕
        </button>
      )}

      {!hasSkill && !isSelected && (
        <span className="text-muted-foreground/50">空</span>
      )}

      {!hasSkill && isSelected && (
        <span className="text-blue-400 text-[8px]">點擊圖鑑放入 ▸</span>
      )}

      {hasSkill && !action2 && action1 && (
        <div className="flex items-center justify-center">
          <img
            src={`https://xivapi.com/i/064000/0${action1.iconId}.png`}
            alt={action1.nameTw}
            title={action1.nameTw}
            className="w-8 h-8 shrink-0"
            loading="lazy"
          />
        </div>
      )}

      {hasSkill && action2 && action1 && (
        <div className="flex items-center justify-center gap-1.5">
          <img
            src={`https://xivapi.com/i/064000/0${action1.iconId}.png`}
            alt={action1.nameTw}
            title={action1.nameTw}
            className="w-8 h-8 shrink-0"
            loading="lazy"
          />
          <img
            src={`https://xivapi.com/i/064000/0${action2.iconId}.png`}
            alt={action2.nameTw}
            title={action2.nameTw}
            className="w-8 h-8 shrink-0"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
