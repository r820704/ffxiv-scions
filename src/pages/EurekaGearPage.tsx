import { useMemo, useState } from 'react';
import { useEurekaGearData } from '@/hooks/useEurekaGearData';
import { useEurekaInventory } from '@/hooks/useEurekaInventory';
import { filterGear } from '@/utils/eureka-gear-filter';
import type { GearFilterState } from '@/types/eureka-gear';
import InventoryPanel from '@/components/eureka-gear/InventoryPanel';
import GearFilterBar from '@/components/eureka-gear/GearFilterBar';
import GearCard from '@/components/eureka-gear/GearCard';

function initialFilter(): GearFilterState {
  return {
    search: '', stages: new Set(), slots: new Set(), jobs: new Set(), tags: new Set(),
    display: 'all', sort: 'stage',
  };
}

export default function EurekaGearPage() {
  const { gear, materials, loading, error } = useEurekaGearData();
  const { materials: inv, ownedGear, setMaterial, setOwned, clearAll } = useEurekaInventory();
  const [filter, setFilter] = useState<GearFilterState>(initialFilter);

  const materialNames = useMemo(
    () => Object.fromEntries(materials.map((m) => [m.id, m.name])),
    [materials],
  );

  const shown = useMemo(
    () => filterGear(gear, filter, inv, ownedGear),
    [gear, filter, inv, ownedGear],
  );

  const ownedCount = useMemo(
    () => gear.filter((g) => ownedGear[g.id]).length,
    [gear, ownedGear],
  );

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-title text-2xl font-bold text-center text-primary mb-1">禁地兵裝</h1>
      {error && (
        <div className="text-xs text-red-400">資料載入失敗：{error.message}</div>
      )}
      {loading && <div className="text-xs text-muted-foreground">載入中…</div>}
      <InventoryPanel
        materials={materials}
        inventory={inv}
        ownedCount={ownedCount}
        ownedTotal={gear.length}
        onMaterialChange={setMaterial}
        onClear={clearAll}
      />
      <GearFilterBar filter={filter} onChange={setFilter} />
      <div className="text-xs text-muted-foreground">顯示 {shown.length} / {gear.length} 件</div>
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((g) => (
          <GearCard
            key={g.id}
            item={g}
            materials={inv}
            owned={Boolean(ownedGear[g.id])}
            materialNames={materialNames}
            onOwnedChange={setOwned}
          />
        ))}
      </div>
    </div>
  );
}
