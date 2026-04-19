import type { EurekaStage, GearTag } from '@/types/eureka-gear';

export interface GearTagEntry {
  itemId: number;
  tags: GearTag[];
  setName?: string;
  stageOverride?: EurekaStage;
}

// MVP placeholder. Populate as we confirm each set of item ids against
// in-game data. Keys: itemId from Item.csv.
export const GEAR_TAGS: GearTagEntry[] = [];

export function getGearTags(itemId: number): GearTagEntry | undefined {
  return GEAR_TAGS.find((e) => e.itemId === itemId);
}
