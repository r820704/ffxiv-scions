import { useState } from 'react';
import type { SkillSlotRow } from '@/hooks/useSkillSlots';
import { eurekaData } from '@/data/eureka-data';
import { cn } from '@/lib/utils';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

interface SkillSlotsProps {
  slots: SkillSlotRow[];
  learnedSkills: Set<string>;
  onSetSlot: (row: number, col: 0 | 1, skillId: string | null) => void;
}

export default function SkillSlots({ slots, learnedSkills, onSetSlot }: SkillSlotsProps) {
  const [pickerTarget, setPickerTarget] = useState<{ row: number; col: 0 | 1 } | null>(null);

  const usedSkills = new Set(
    slots.flatMap(([l, r]) => [l, r]).filter((id): id is string => id !== null)
  );

  const availableSkills = eurekaData.logosActions.filter(
    (a) => learnedSkills.has(a.id) && !usedSkills.has(a.id)
  );

  const handleSlotClick = (row: number, col: 0 | 1, currentSkill: string | null) => {
    if (currentSkill) {
      onSetSlot(row, col, null);
    } else {
      setPickerTarget({ row, col });
    }
  };

  const handlePickSkill = (skillId: string) => {
    if (pickerTarget) {
      onSetSlot(pickerTarget.row, pickerTarget.col, skillId);
      setPickerTarget(null);
    }
  };

  return (
    <div className="relative">
      <div className="text-[11px] text-muted-foreground mb-1">技能格</div>
      <div className="flex flex-col gap-1.5">
        {slots.map(([left, right], rowIdx) => {
          const filledCount = (left ? 1 : 0) + (right ? 1 : 0);
          return (
            <div key={rowIdx} className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground w-3 text-center shrink-0">
                {rowIdx + 1}
              </span>
              {filledCount === 1 ? (
                // Single skill: centered, with small empty slot for adding second
                <>
                  {left && (
                    <SlotCell
                      skillId={left}
                      onClick={() => handleSlotClick(rowIdx, 0, left)}
                      className="flex-1"
                    />
                  )}
                  {right && !left && (
                    <SlotCell
                      skillId={right}
                      onClick={() => handleSlotClick(rowIdx, 1, right)}
                      className="flex-1"
                    />
                  )}
                  <EmptySlot
                    onClick={() => handleSlotClick(rowIdx, left ? 1 : 0, null)}
                    className="w-10"
                  />
                </>
              ) : (
                // 0 or 2 skills: normal two-slot layout
                <>
                  {left ? (
                    <SlotCell
                      skillId={left}
                      onClick={() => handleSlotClick(rowIdx, 0, left)}
                      className="flex-1"
                    />
                  ) : (
                    <EmptySlot
                      onClick={() => handleSlotClick(rowIdx, 0, null)}
                      className="flex-1"
                    />
                  )}
                  {right ? (
                    <SlotCell
                      skillId={right}
                      onClick={() => handleSlotClick(rowIdx, 1, right)}
                      className="flex-1"
                    />
                  ) : (
                    <EmptySlot
                      onClick={() => handleSlotClick(rowIdx, 1, null)}
                      className="flex-1"
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Skill picker popup */}
      {pickerTarget && (
        <div className="absolute top-0 left-full ml-2 z-50 w-[200px] max-h-[280px] overflow-y-auto rounded-lg border border-border bg-card shadow-xl p-2">
          <div className="text-[10px] text-muted-foreground mb-1">選擇技能</div>
          {availableSkills.length === 0 ? (
            <div className="text-[10px] text-muted-foreground/60 py-2 text-center">
              沒有可用的技能
            </div>
          ) : (
            availableSkills.map((action) => (
              <button
                key={action.id}
                onClick={() => handlePickSkill(action.id)}
                className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-left hover:bg-secondary/80 cursor-pointer transition-colors"
              >
                <img
                  src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                  alt={action.nameTw}
                  className="w-5 h-5 shrink-0"
                />
                <span className="text-[10px] text-foreground truncate">{action.nameTw}</span>
              </button>
            ))
          )}
          <button
            onClick={() => setPickerTarget(null)}
            className="w-full text-[10px] text-muted-foreground mt-1 py-1 rounded hover:bg-secondary/50 cursor-pointer"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

function SlotCell({ skillId, onClick, className }: { skillId: string; onClick: () => void; className?: string }) {
  const action = actionMap.get(skillId);
  if (!action) return null;
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 rounded border-2 border-primary-dark bg-card flex items-center gap-1 px-1 cursor-pointer hover:bg-secondary/50 transition-colors',
        className
      )}
    >
      <img
        src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
        alt={action.nameTw}
        className="w-6 h-6 shrink-0"
      />
      <span className="text-[9px] text-primary-dark truncate">{action.nameTw}</span>
    </button>
  );
}

function EmptySlot({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 rounded border-2 border-dashed border-muted-foreground/30 bg-card/50 flex items-center justify-center cursor-pointer hover:border-muted-foreground/60 transition-colors',
        className
      )}
    >
      <span className="text-[9px] text-muted-foreground/40">空</span>
    </button>
  );
}
