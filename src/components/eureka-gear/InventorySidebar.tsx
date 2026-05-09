import type { EurekaMaterial } from '@/types/eureka-gear';
import { Tooltip } from '../ui/Tooltip';
import { useLocalStorageBool } from '@/hooks/useLocalStorageBool';
import MaterialTile from './MaterialTile';

interface InventorySidebarProps {
  materials: EurekaMaterial[];
  inventory: Record<number, number>;
  onMaterialChange: (id: number, next: number) => void;
  onClear: () => void;
}

export default function InventorySidebar({
  materials, inventory, onMaterialChange, onClear,
}: InventorySidebarProps) {
  const [expanded, setExpanded] = useLocalStorageBool('eureka-gear-inventory-expanded', true);
  const registered = materials.filter((m) => (inventory[m.id] ?? 0) > 0).length;

  return (
    <div className="rounded-lg border border-border bg-card p-3 md:sticky md:top-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="text-sm text-foreground">素材庫存：{registered}/{materials.length} 種已輸入</div>
          <Tooltip label={`${materials.length} = 升級會用到的所有素材種類數；目前已輸入持有量的種類數`}>
            <button
              type="button"
              className="inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-foreground/60 hover:text-foreground/100 cursor-help"
              aria-label="素材庫存說明"
            >
              ?
            </button>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-2 py-0.5 rounded border border-border/50 hover:border-primary"
          >
            {expanded ? '收合' : '展開'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-2 py-0.5 rounded border border-border/50 hover:border-red-400 text-muted-foreground hover:text-red-400"
          >
            清空
          </button>
        </div>
      </div>
      {expanded && (
        <div className="grid grid-cols-3 gap-1 mt-2">
          {materials.map((m) => (
            <MaterialTile
              key={m.id}
              material={m}
              count={inventory[m.id] ?? 0}
              onChange={(n) => onMaterialChange(m.id, n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
