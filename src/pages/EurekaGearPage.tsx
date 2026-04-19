import { useMemo, useState } from 'react';
import type { GearFilterState } from '@/types/eureka-gear';
import { useEurekaWeaponsData } from '@/hooks/useEurekaWeaponsData';
import { useEurekaInventory } from '@/hooks/useEurekaInventory';
import { EUREKA_CHAINS } from '@/data/eureka-chains';
import { STAGE_UPGRADE_COSTS } from '@/data/eureka-stage-costs';
import { filterChains } from '@/utils/eurekaGear';
import InventoryPanel from '@/components/eureka-gear/InventoryPanel';
import GearFilterBar from '@/components/eureka-gear/GearFilterBar';
import ChainCard from '@/components/eureka-gear/ChainCard';

function initialFilter(): GearFilterState {
  return {
    search: '', jobs: new Set(), stages: new Set(),
    onlyUpgradable: false, onlyCompleted: false, sort: 'role',
  };
}

export default function EurekaGearPage() {
  const { weapons, materials, loading, error } = useEurekaWeaponsData();
  const {
    materials: inv, chainProgress,
    setMaterial, setChainStage, upgradeChain, clearAll,
  } = useEurekaInventory();
  const [filter, setFilter] = useState<GearFilterState>(initialFilter);

  const shown = useMemo(
    () => filterChains(EUREKA_CHAINS, filter, chainProgress, inv, STAGE_UPGRADE_COSTS),
    [filter, chainProgress, inv],
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      <h1 className="text-lg font-semibold">禁地兵裝</h1>
      {error && <div className="text-red-400 text-sm">載入失敗：{error}</div>}

      <InventoryPanel
        materials={materials}
        inventory={inv}
        onMaterialChange={setMaterial}
        onClear={clearAll}
      />

      <GearFilterBar filter={filter} onChange={setFilter} />

      <div className="grid gap-2">
        {shown.map((c) => (
          <ChainCard
            key={c.chainId}
            chain={c}
            weapons={weapons}
            currentStage={chainProgress[c.chainId] ?? 'antiquated'}
            inventory={inv}
            costs={STAGE_UPGRADE_COSTS}
            materials={materials}
            onSetStage={setChainStage}
            onUpgrade={(id) => upgradeChain(id, STAGE_UPGRADE_COSTS)}
          />
        ))}
        {!loading && shown.length === 0 && (
          <div className="text-sm text-muted-foreground">沒有符合條件的武器鍊</div>
        )}
      </div>
    </div>
  );
}
