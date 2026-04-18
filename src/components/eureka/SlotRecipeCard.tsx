// src/components/eureka/SlotRecipeCard.tsx
import { Fragment } from 'react';
import { eurekaData, getMneme, getLogogramForMneme } from '@/data/eureka-data';
import type { SlotCombination } from '@/utils/slot-optimizer';
import { cn } from '@/lib/utils';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

interface SlotRecipeCardProps {
  slotIndex: number;
  skill1Id: string;
  skill2Id: string | null;
  combination: SlotCombination;
}

export default function SlotRecipeCard({
  slotIndex,
  skill1Id,
  skill2Id,
  combination,
}: SlotRecipeCardProps) {
  const action1 = actionMap.get(skill1Id);
  const action2 = skill2Id ? actionMap.get(skill2Id) : null;

  if (!action1) return null;

  const recipe1 = action1.recipes[combination.skill1RecipeIdx];
  const recipe2 = action2 && combination.skill2RecipeIdx !== undefined
    ? action2.recipes[combination.skill2RecipeIdx]
    : null;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[9px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
          格 {slotIndex + 1}
        </span>
        <img
          src={`https://xivapi.com/i/064000/0${action1.iconId}.png`}
          alt={action1.nameTw}
          className="w-5 h-5 shrink-0"
          loading="lazy"
        />
        <span className="text-sm font-semibold text-foreground">{action1.nameTw}</span>
        {action2 && (
          <>
            <span className="text-muted-foreground/50">+</span>
            <img
              src={`https://xivapi.com/i/064000/0${action2.iconId}.png`}
              alt={action2.nameTw}
              className="w-5 h-5 shrink-0"
              loading="lazy"
            />
            <span className="text-sm font-semibold text-foreground">{action2.nameTw}</span>
          </>
        )}
        <span
          className={cn(
            'text-[10px] ml-auto',
            combination.successRate >= 1.0 ? 'text-green-400' : 'text-amber-400',
          )}
        >
          {Math.round(combination.successRate * 100)}% 成功
          {combination.totalMnemes > 3 && `（${combination.totalMnemes} 記憶）`}
        </span>
      </div>

      {/* Best recipe */}
      <div className="rounded px-3 py-2 bg-muted/50 text-xs">
        {recipe1 && (
          <div className={action2 ? 'mb-1' : ''}>
            {action2 && <span className="text-muted-foreground/60 mr-1">{action1.nameTw}：</span>}
            {recipe1.ingredients.map((ing, ii) => {
              const mneme = getMneme(ing.mnemeId);
              const logogram = getLogogramForMneme(ing.mnemeId);
              return (
                <Fragment key={ii}>
                  {ii > 0 && <span className="text-muted-foreground/40 mx-0.5">+</span>}
                  <span className="text-foreground">
                    {mneme?.nameTw ?? ing.mnemeId}
                    {ing.quantity > 1 && <span className="text-primary"> ×{ing.quantity}</span>}
                  </span>
                  {logogram && (
                    <span className="text-[10px] text-muted-foreground ml-0.5">
                      ← {logogram.nameTw}
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
        {recipe2 && action2 && (
          <div>
            <span className="text-muted-foreground/60 mr-1">{action2.nameTw}：</span>
            {recipe2.ingredients.map((ing, ii) => {
              const mneme = getMneme(ing.mnemeId);
              const logogram = getLogogramForMneme(ing.mnemeId);
              return (
                <Fragment key={ii}>
                  {ii > 0 && <span className="text-muted-foreground/40 mx-0.5">+</span>}
                  <span className="text-foreground">
                    {mneme?.nameTw ?? ing.mnemeId}
                    {ing.quantity > 1 && <span className="text-primary"> ×{ing.quantity}</span>}
                  </span>
                  {logogram && (
                    <span className="text-[10px] text-muted-foreground ml-0.5">
                      ← {logogram.nameTw}
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
