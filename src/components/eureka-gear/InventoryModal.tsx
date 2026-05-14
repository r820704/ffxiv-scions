import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { EurekaMaterial } from '@/types/eureka-gear';
import { Tooltip } from '../ui/Tooltip';

const MATERIAL_ICON_MODULES = import.meta.glob('../../assets/material-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const MATERIAL_ICONS: Record<number, string> = Object.fromEntries(
  Object.entries(MATERIAL_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/(\d+)\.png$/);
    return [match ? Number(match[1]) : 0, url];
  }),
);

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: EurekaMaterial[];
  inventory: Record<number, number>;
  onMaterialChange: (id: number, next: number) => void;
  onClear: () => void;
}

const STEP_DELTAS = [-100, -10, -1, +1, +10, +100] as const;

export default function InventoryModal({
  open, onOpenChange, materials, inventory, onMaterialChange, onClear,
}: InventoryModalProps) {
  const registered = materials.filter((m) => (inventory[m.id] ?? 0) > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto [scrollbar-gutter:stable]">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            📦 素材庫存
            <span className="text-xs text-muted-foreground font-normal">
              （{registered}/{materials.length} 種已輸入）
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">編輯素材庫存：每個素材可輸入數字或用 -100 / -10 / -1 / +1 / +10 / +100 按鈕調整</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-2 py-0.5 rounded border border-border/50 hover:border-red-400 text-muted-foreground hover:text-red-400"
          >
            全部清空
          </button>
        </div>

        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-1.5">
          {materials.map((m) => {
            const count = inventory[m.id] ?? 0;
            const iconSrc = MATERIAL_ICONS[m.iconId];
            return (
              <li
                key={m.id}
                className="flex items-center gap-1.5 p-1.5 rounded border border-border/40 bg-card hover:bg-secondary/40 transition-colors"
              >
                {iconSrc && (
                  <img src={iconSrc} alt="" className="w-5 h-5 shrink-0" loading="lazy" />
                )}
                <span className="text-xs text-foreground flex-1 min-w-0 leading-tight" title={m.tcName}>
                  {m.tcName}
                </span>
                <input
                  type="number"
                  min={0}
                  value={count}
                  onChange={(e) => onMaterialChange(m.id, Math.max(0, Number(e.target.value) || 0))}
                  className="w-12 text-center text-xs bg-transparent border border-border/50 rounded px-1 py-0.5 outline-none focus:border-primary tabular-nums shrink-0"
                />
                <div className="flex gap-0.5 shrink-0">
                  {STEP_DELTAS.map((delta) => {
                    const label = delta > 0 ? `+${delta}` : `${delta}`;
                    return (
                      <Tooltip key={delta} label={label}>
                        <button
                          type="button"
                          aria-label={label}
                          onClick={() => onMaterialChange(m.id, Math.max(0, count + delta))}
                          className={`min-w-[2rem] px-0.5 py-0.5 text-[10px] rounded transition-colors tabular-nums ${
                            delta > 0
                              ? 'bg-primary/10 text-primary hover:bg-primary/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {label}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
