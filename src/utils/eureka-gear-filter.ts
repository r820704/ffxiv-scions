import type {
  EurekaGearItem,
  EurekaStage,
  GearFilterState,
} from '@/types/eureka-gear';
import { canAfford } from './eureka-gear-cost';

const STAGE_ORDER: EurekaStage[] = [
  'antique',
  'anemos',
  'pagos',
  'pagos+1',
  'pyros',
  'hydatos',
  'hydatos+1',
  'elemental',
  'elemental+1',
  'physeos',
];

export function filterGear(
  items: EurekaGearItem[],
  filter: GearFilterState,
  materials: Record<number, number>,
  ownedGear: Record<number, boolean>,
): EurekaGearItem[] {
  const kept = items.filter((item) => {
    if (filter.search && !item.name.includes(filter.search)) return false;
    if (filter.stages.size && !filter.stages.has(item.stage)) return false;
    if (filter.slots.size && !filter.slots.has(item.slot)) return false;
    if (filter.jobs.size && !item.jobs.some((j) => filter.jobs.has(j))) return false;
    if (filter.tags.size && !item.tags.some((t) => filter.tags.has(t))) return false;
    const owned = Boolean(ownedGear[item.id]);
    switch (filter.display) {
      case 'affordable': return canAfford(item, materials);
      case 'unowned':    return !owned;
      case 'owned':      return owned;
      case 'all':
      default:           return true;
    }
  });

  switch (filter.sort) {
    case 'stage':
      kept.sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
      );
      break;
    case 'job':
      kept.sort((a, b) => (a.jobs[0] ?? '').localeCompare(b.jobs[0] ?? ''));
      break;
    case 'npc':
      kept.sort((a, b) => a.source.npcName.localeCompare(b.source.npcName, 'zh'));
      break;
  }
  return kept;
}
