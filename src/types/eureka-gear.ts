export type EurekaStage =
  | 'antique'
  | 'anemos'
  | 'pagos'
  | 'pyros'
  | 'hydatos'
  | 'elemental'
  | 'physeos';

export type EquipSlot =
  | 'weapon'
  | 'head'
  | 'body'
  | 'hands'
  | 'legs'
  | 'feet';

// Job short codes matching XIV data-mining convention.
export type JobId =
  | 'PLD' | 'WAR' | 'DRK' | 'GNB'
  | 'WHM' | 'SCH' | 'AST' | 'SGE'
  | 'MNK' | 'DRG' | 'NIN' | 'SAM' | 'RPR'
  | 'BRD' | 'MCH' | 'DNC'
  | 'BLM' | 'SMN' | 'RDM' | 'BLU';

export type GearTag =
  | 'glow-water-island'
  | 'eureka-bonus'
  | 'ozma-only';

export type MaterialCategory =
  | 'crystal'
  | 'currency'
  | 'drop'
  | 'nm-drop'
  | 'treasure'
  | 'unknown';

export interface GearCostMaterial {
  materialId: number;
  quantity: number;
}

export interface GearCostCurrency {
  id: number;
  quantity: number;
}

export interface GearSource {
  npcId: number;
  npcName: string;
  zone: string;
  specialShopId: number;
}

export interface EurekaGearItem {
  id: number;
  name: string;
  iconId: number;
  stage: EurekaStage;
  slot: EquipSlot;
  jobs: JobId[];
  itemLevel: number;
  source: GearSource;
  cost: {
    materials: GearCostMaterial[];
    currency?: GearCostCurrency;
  };
  tags: GearTag[];
  setName?: string;
}

export interface EurekaMaterial {
  id: number;
  name: string;
  iconId: number;
  category: MaterialCategory;
  sourceHint?: string;
}

export interface EurekaInventoryState {
  materials: Record<number, number>;
  ownedGear: Record<number, boolean>;
  updatedAt: string;
}

export type DisplayMode = 'all' | 'affordable' | 'unowned' | 'owned';
export type SortMode = 'stage' | 'job' | 'npc';

export interface GearFilterState {
  search: string;
  stages: Set<EurekaStage>;
  slots: Set<EquipSlot>;
  jobs: Set<JobId>;
  tags: Set<GearTag>;
  display: DisplayMode;
  sort: SortMode;
}
