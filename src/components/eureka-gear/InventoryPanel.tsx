import { useState } from 'react';
import type { EurekaMaterial } from '@/types/eureka-gear';
import MaterialTile from './MaterialTile';

interface InventoryPanelProps {
  materials: EurekaMaterial[];
  inventory: Record<number, number>;
  ownedCount: number;
  ownedTotal: number;
  onMaterialChange: (materialId: number, next: number) => void;
  onClear: () => void;
}

export default function InventoryPanel({
  materials, inventory, ownedCount, ownedTotal, onMaterialChange, onClear,
}: InventoryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const registered = materials.filter((m) => (inventory[m.id] ?? 0) > 0).length;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-foreground">
          素材：{registered}/{materials.length}
          <span className="mx-2 text-muted-foreground">|</span>
          裝備：{ownedCount}/{ownedTotal}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
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
        <div className="flex flex-wrap gap-2 mt-3">
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
