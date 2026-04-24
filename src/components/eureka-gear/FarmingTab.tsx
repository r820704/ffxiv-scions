import { useMemo } from 'react';
import { ZoneGroup } from './ZoneGroup';
import { costBetween } from '../../utils/eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../../data/eureka-stage-costs';
import { EUREKA_STAGES, ZONE_OF_STAGE } from '../../types/eureka-gear';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import type {
  EurekaInventoryV3,
  EurekaZone,
  SlotProgress,
} from '../../types/eureka-gear';

const MIRROR_CHAIN_IDS = new Set(
  EUREKA_CHAINS.filter((c) => c.mirrorsChainId).map((c) => c.chainId),
);

export type FarmingTabProps = {
  inventory: EurekaInventoryV3;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
};

type AggregatedMaterial = { materialId: number; totalNeeded: number; shortage: number };

function aggregateMaterialsByZone(inv: EurekaInventoryV3) {
  const zoneAgg: Record<EurekaZone, Map<number, number>> = {
    anemos: new Map(),
    pagos: new Map(),
    pyros: new Map(),
    hydatos: new Map(),
  };

  const slotEntries: [string, SlotProgress][] = Object.entries(inv.weapons);
  for (const [chainId, slot] of slotEntries) {
    // Skip mirror chains (e.g. PLD shield) — materials consumed once via the primary.
    if (MIRROR_CHAIN_IDS.has(chainId)) continue;
    if (!slot.targetStage) continue;
    const fromIdx = EUREKA_STAGES.indexOf(slot.currentStage);
    const toIdx = EUREKA_STAGES.indexOf(slot.targetStage);
    if (toIdx <= fromIdx) continue;
    for (let i = fromIdx; i < toIdx; i++) {
      const edgeStage = EUREKA_STAGES[i + 1];
      if (!edgeStage) continue;
      const zone = ZONE_OF_STAGE[edgeStage];
      if (!zone) continue;
      const fromStage = EUREKA_STAGES[i];
      if (!fromStage) continue;
      const materials = costBetween(fromStage, edgeStage, STAGE_UPGRADE_COSTS);
      for (const m of materials) {
        zoneAgg[zone].set(m.materialId, (zoneAgg[zone].get(m.materialId) ?? 0) + m.quantity);
      }
    }
  }

  return zoneAgg;
}

export function FarmingTab({ inventory, materialsMap }: FarmingTabProps) {
  const zoneAgg = useMemo(() => aggregateMaterialsByZone(inventory), [inventory]);
  const hasAny = Object.values(zoneAgg).some((m) => m.size > 0);

  if (!hasAny) {
    return (
      <div className="text-gray-500 text-sm italic py-6 text-center">
        沒有設定 target 的升級目標。去「職業詳情」tab 選個想達成的階段就會出現素材需求。
      </div>
    );
  }

  const zones: EurekaZone[] = ['anemos', 'pagos', 'pyros', 'hydatos'];

  return (
    <div className="space-y-3">
      {zones.map((zone) => {
        const items: AggregatedMaterial[] = Array.from(zoneAgg[zone]).map(
          ([materialId, totalNeeded]) => {
            const have = inventory.materials[materialId] ?? 0;
            return { materialId, totalNeeded, shortage: Math.max(0, totalNeeded - have) };
          },
        );
        if (items.length === 0) return null;
        return (
          <ZoneGroup key={zone} zone={zone} items={items} materialsMap={materialsMap} />
        );
      })}
    </div>
  );
}
