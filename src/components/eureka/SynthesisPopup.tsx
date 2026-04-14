import type { LogosAction, Recipe } from '@/types/eureka';
import { getMneme, getLogogramForMneme } from '@/data/eureka-data';

interface SynthesisPopupProps {
  action: LogosAction;
  inventory: Record<string, number>;
  onSynthesize: (recipe: Recipe) => void;
  onClose: () => void;
}

function isRecipeCraftable(recipe: Recipe, inventory: Record<string, number>): boolean {
  return recipe.ingredients.every((ing) => {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (!logogram) return false;
    return (inventory[logogram.id] ?? 0) >= ing.quantity;
  });
}

function getMissingMaterial(recipe: Recipe, inventory: Record<string, number>): string | null {
  for (const ing of recipe.ingredients) {
    const logogram = getLogogramForMneme(ing.mnemeId);
    if (!logogram) continue;
    if ((inventory[logogram.id] ?? 0) < ing.quantity) {
      return logogram.nameTw;
    }
  }
  return null;
}

export default function SynthesisPopup({
  action,
  inventory,
  onSynthesize,
  onClose,
}: SynthesisPopupProps) {
  return (
    <div className="w-[300px] rounded-lg border border-border bg-card shadow-xl text-left p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] bg-primary-dark text-primary-foreground px-1.5 py-0.5 rounded font-medium">
          合成
        </span>
        <img
          src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
          alt={action.nameTw}
          className="w-6 h-6 shrink-0"
        />
        <span className="text-sm font-semibold text-foreground">{action.nameTw}</span>
      </div>

      {/* Recipe list */}
      <div className="space-y-1">
        {action.recipes.map((recipe, ri) => {
          const craftable = isRecipeCraftable(recipe, inventory);
          const missing = !craftable ? getMissingMaterial(recipe, inventory) : null;

          return (
            <button
              key={ri}
              disabled={!craftable}
              onClick={() => {
                onSynthesize(recipe);
                onClose();
              }}
              className={`w-full text-left rounded p-2 transition-colors ${
                craftable
                  ? 'bg-secondary/50 hover:bg-primary-dark/15 cursor-pointer'
                  : 'bg-secondary/20 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="text-[11px] text-foreground">
                {recipe.ingredients.map((ing, ii) => {
                  const mneme = getMneme(ing.mnemeId);
                  return (
                    <span key={ii}>
                      {ii > 0 && ' + '}
                      {mneme?.nameTw ?? ing.mnemeId}
                      {ing.quantity > 1 && ` ×${ing.quantity}`}
                    </span>
                  );
                })}
              </div>
              <div className={`text-[10px] mt-0.5 ${craftable ? 'text-green-400' : 'text-red-400'}`}>
                {craftable ? '✓ 材料足夠' : `✗ ${missing ?? '材料'}不足`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
