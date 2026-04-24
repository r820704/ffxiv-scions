export const EUREKA_STAGES = [
  'antiquated', 'anemos-base', 'anemos+1', 'anemos+2', 'anemos',
  'pagos', 'pagos+1', 'elemental', 'elemental+1', 'elemental+2',
  'pyros', 'hydatos', 'hydatos+1', 'base-eureka', 'eureka', 'physeos',
] as const;

export type EurekaStage = (typeof EUREKA_STAGES)[number];

export const EUREKA_JOBS = [
  'PLD', 'WAR', 'DRK', 'DRG', 'MNK', 'SAM', 'NIN',
  'BRD', 'MCH', 'BLM', 'SMN', 'RDM', 'WHM', 'SCH', 'AST',
] as const;

export type FFXIVJob = (typeof EUREKA_JOBS)[number];

export interface EurekaWeapon {
  id: number;
  chainId: string;
  job: FFXIVJob;
  isShield: boolean;
  stage: EurekaStage;
  itemLevel: number;
  tcName: string;
  enName: string;
  iconId: number;
}

export interface EurekaMaterial {
  id: number;
  tcName: string;
  enName: string;
  iconId: number;
  category: 'crystal' | 'rarefaction' | 'token' | 'other';
}

export interface MaterialCost {
  materialId: number;
  quantity: number;
}

export interface StageUpgradeCost {
  from: EurekaStage;
  to: EurekaStage;
  materials: MaterialCost[];
  notes?: string;
}

export interface EurekaChain {
  chainId: string;
  job: FFXIVJob;
  isShield: boolean;
  displayName: string;
  /**
   * If set, this chain's progress mirrors the referenced chain — they are always
   * upgraded together as a pair (e.g. PLD sword + shield). Actions on either chain
   * apply to both; materials are only consumed once (on the primary).
   */
  mirrorsChainId?: string;
}

export type ChainProgress = Record<string, EurekaStage | null>;

export interface GearInventoryState {
  materials: Record<number, number>;
  chainProgress: ChainProgress;
  updatedAt: string;
}

export interface GearFilterState {
  search: string;
  jobs: Set<FFXIVJob>;
  stages: Set<EurekaStage>;
  onlyUpgradable: boolean;
  onlyCompleted: boolean;
  sort: 'role' | 'alpha';
}

export const STAGE_ITEM_LEVELS: Record<EurekaStage, number> = {
  antiquated: 290,
  'anemos-base': 335,
  'anemos+1': 340,
  'anemos+2': 345,
  anemos: 355,
  pagos: 360,
  'pagos+1': 365,
  elemental: 370,
  'elemental+1': 375,
  'elemental+2': 380,
  pyros: 385,
  hydatos: 390,
  'hydatos+1': 395,
  'base-eureka': 400,
  eureka: 405,
  physeos: 405,
};

export const STAGE_TC_LABEL: Record<EurekaStage, string> = {
  antiquated: '70級職業套裝',
  'anemos-base': '禁地兵裝',
  'anemos+1': '禁地兵裝+1',
  'anemos+2': '禁地兵裝+2',
  anemos: '禁地兵裝·常風',
  pagos: '禁地兵裝·恆冰',
  'pagos+1': '禁地兵裝·恆冰+1',
  elemental: '禁地兵裝·元素',
  'elemental+1': '禁地兵裝·元素+1',
  'elemental+2': '禁地兵裝·元素+2',
  pyros: '禁地兵裝·湧火',
  hydatos: '禁地兵裝·豐水',
  'hydatos+1': '禁地兵裝·豐水+1',
  'base-eureka': '新禁地兵裝',
  eureka: '禁地兵裝最終形態',
  physeos: '禁地兵裝·改裝',
};

export const JOB_TC_LABEL: Record<FFXIVJob, string> = {
  PLD: '騎士', WAR: '斧術師', DRK: '暗黑騎士',
  DRG: '龍騎士', MNK: '武僧', SAM: '武士', NIN: '忍者',
  BRD: '吟遊詩人', MCH: '機工士',
  BLM: '黑魔法師', SMN: '召喚師', RDM: '赤魔法師',
  WHM: '白魔法師', SCH: '學者', AST: '占星術士',
};

// ============ v3 schema ============

export type SlotProgress = {
  currentStage: EurekaStage;
  targetStage?: EurekaStage;
};

export const ARMOR_SLOTS = ['head', 'body', 'hands', 'legs', 'feet'] as const;
export type ArmorSlot = typeof ARMOR_SLOTS[number];

export const ARMOR_SET_IDS = [
  'fending',
  'maiming',
  'striking',
  'scouting',
  'aiming',
  'healing',
  'casting',
] as const;
export type ArmorSetId = typeof ARMOR_SET_IDS[number];

export type EurekaInventoryV3 = {
  schemaVersion: 3;
  weapons: Record<string, SlotProgress>;
  armor: Record<ArmorSetId, Partial<Record<ArmorSlot, SlotProgress>>>;
  materials: Record<number, number>;
};

// ============ zone grouping ============

export type EurekaZone = 'anemos' | 'pagos' | 'pyros' | 'hydatos';

export const ZONE_OF_STAGE: Record<EurekaStage, EurekaZone | null> = {
  antiquated: null,
  'anemos-base': 'anemos',
  'anemos+1': 'anemos',
  'anemos+2': 'anemos',
  anemos: 'anemos',
  pagos: 'pagos',
  'pagos+1': 'pagos',
  elemental: 'pyros',
  'elemental+1': 'pyros',
  'elemental+2': 'pyros',
  pyros: 'pyros',
  hydatos: 'hydatos',
  'hydatos+1': 'hydatos',
  'base-eureka': 'hydatos',
  eureka: 'hydatos',
  physeos: null,
};

export const ZONE_TC_NAME: Record<EurekaZone, string> = {
  anemos: '常風之地',
  pagos: '恆冰之地',
  pyros: '湧火之地',
  hydatos: '豐水之地',
};
