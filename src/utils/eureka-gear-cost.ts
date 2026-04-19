import type { EurekaGearItem } from '@/types/eureka-gear';

export function canAfford(
  item: EurekaGearItem,
  materials: Record<number, number>,
): boolean {
  return item.cost.materials.every(
    (m) => (materials[m.materialId] ?? 0) >= m.quantity,
  );
}
