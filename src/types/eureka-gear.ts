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
  /**
   * If present, this cost entry only applies to the listed armor slots.
   * Used when armor upgrade materials differ by slot (e.g. body/legs cost
   * more than head/hands/feet at the same stage edge).
   * Omitted = applies to any slot (weapons use this default).
   */
  slots?: ArmorSlot[];
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
  PLD: '騎士', WAR: '戰士', DRK: '暗黑騎士',
  DRG: '龍騎士', MNK: '武僧', SAM: '武士', NIN: '忍者',
  BRD: '吟遊詩人', MCH: '機工士',
  BLM: '黑魔道士', SMN: '召喚士', RDM: '赤魔道士',
  WHM: '白魔道士', SCH: '學者', AST: '占星術師',
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

// ============ v4 schema (adds dual-track armor) ============

/**
 * Armor has two independent progression tracks per slot:
 * - `anemos`: 5 stages (antiquated → anemos-base → +1 → +2 → anemos, glamour only, ends iL350)
 * - `elemental`: 3 stages (elemental → +1 → +2, combat set, ends iL390)
 *
 * Tracks are independent — completing one does not affect the other.
 */
export const ARMOR_TRACKS = ['anemos', 'elemental'] as const;
export type ArmorTrack = typeof ARMOR_TRACKS[number];

export type ArmorSlotState = Partial<Record<ArmorTrack, SlotProgress>>;

export type EurekaInventoryV4 = {
  schemaVersion: 4;
  weapons: Record<string, SlotProgress>;
  armor: Record<ArmorSetId, Partial<Record<ArmorSlot, ArmorSlotState>>>;
  materials: Record<number, number>;
};

// ============ v5 schema (splits armor into per-job Anemos vs per-role Elemental) ============

/**
 * v5 separates the two armor chains based on how they're actually tracked in-game:
 *
 * - **Anemos armor** (iL290-350): job-specific item, NOT shared. Each job has
 *   its own visual set (e.g. 騎士's "嘉拉汀" set ≠ 戰士's "伐煞" set).
 *   Tracked per JobId.
 * - **Elemental armor** (iL380-390): role-shared item. All tanks share the
 *   same Fending piece. Tracked per ArmorSetId (role).
 */
export type EurekaInventoryV5 = {
  schemaVersion: 5;
  weapons: Record<string, SlotProgress>;
  armor: {
    anemos: Partial<Record<string /* JobId */, Partial<Record<ArmorSlot, SlotProgress>>>>;
    elemental: Record<ArmorSetId, Partial<Record<ArmorSlot, SlotProgress>>>;
  };
  materials: Record<number, number>;
};

/**
 * Stages available per armor track (subset of EUREKA_STAGES).
 */
export const ANEMOS_ARMOR_STAGES: EurekaStage[] = [
  'antiquated', 'anemos-base', 'anemos+1', 'anemos+2', 'anemos',
];

export const ELEMENTAL_ARMOR_STAGES: EurekaStage[] = [
  'elemental', 'elemental+1', 'elemental+2',
];

export const ARMOR_STAGES_BY_TRACK: Record<ArmorTrack, EurekaStage[]> = {
  anemos: ANEMOS_ARMOR_STAGES,
  elemental: ELEMENTAL_ARMOR_STAGES,
};

export const ARMOR_TRACK_LABEL: Record<ArmorTrack, string> = {
  anemos: '常風系列（外觀）',
  elemental: '元素系列（戰鬥）',
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

export const ZONE_ENDPOINT_TC_NAME = {
  start: '起點',
  final: '最終形態',
} as const;

/** Zone group shape accepted by ChainStepper.zoneGroups prop. */
export type ArmorZoneGroupDef = {
  key: string;
  label: string;
  stages: readonly EurekaStage[];
};

/** Zone groups for the anemos armor stepper. */
export const ANEMOS_ARMOR_ZONE_GROUPS: ArmorZoneGroupDef[] = [
  { key: 'start',  label: '起點',    stages: ['antiquated'] },
  { key: 'anemos', label: '常風之地', stages: ['anemos-base', 'anemos+1', 'anemos+2', 'anemos'] },
];

/** Zone groups for the elemental armor stepper. */
export const ELEMENTAL_ARMOR_ZONE_GROUPS: ArmorZoneGroupDef[] = [
  { key: 'pyros',   label: '湧火之地', stages: ['elemental'] },
  { key: 'hydatos', label: '豐水之地', stages: ['elemental+1', 'elemental+2'] },
];
