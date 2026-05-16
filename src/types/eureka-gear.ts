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

/**
 * Stages whose completed weapon visually glows in-game.
 * - anemos (iL 355): subtle shimmer on the final Anemos form
 * - pyros (iL 385): white-blue flame particle effect
 * - eureka (iL 405): swirling particle effects (final appearance)
 * - physeos (iL 405): inherits eureka particle effects
 *
 * NOTE: the `anemos` stage key is also reused on the anemos armor track,
 * but the armor at that stage does NOT glow (only weapons do). Use
 * ELEMENTAL_ARMOR_GLOW_STAGES for the elemental armor track instead.
 *
 * Source: ffxiv.consolegameswiki.com + in-game verification.
 */
export const WEAPON_GLOW_STAGES: ReadonlySet<EurekaStage> = new Set([
  'anemos', 'pyros', 'eureka',
]);

/**
 * Stages whose completed elemental armor visually glows in-game.
 * - elemental+1 (iL 390): recolored with added glowing light effects
 * - elemental+2 (iL 390): visually identical to +1 (only adds Eureka stat bonus)
 *
 * The base `elemental` stage does not glow.
 * Source: ffxiv.consolegameswiki.com/wiki/Eurekan_Armor.
 */
export const ELEMENTAL_ARMOR_GLOW_STAGES: ReadonlySet<EurekaStage> = new Set([
  'elemental+1',
]);

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
  /**
   * 玩家當前持有的階段。`undefined` 表示「未開始 / 尚未取得舊化」—
   * v6 schema 之後新加入的狀態。v5 entries 一律有此欄位、不會是 undefined。
   */
  currentStage?: EurekaStage;
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
  anemos: '常風防具',
  elemental: '元素防具',
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
  elemental: 'pagos',
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

/**
 * Source zone for each upgrade material (where players farm it).
 *
 * Used by FarmingTab to bucket materials by farming destination. This is
 * material-centric and distinct from ZONE_OF_STAGE (which describes the
 * stage's progression zone for the visual stepper).
 *
 * They diverge for elemental armor: ZONE_OF_STAGE['elemental+1'] = 'pyros'
 * (correct for weapons whose elemental+1 upgrade NPC sits in Pyros), but the
 * elemental armor's elemental → elemental+1 step consumes Hydatos Crystals
 * farmed in Hydatos. Bucketing by material zone keeps the farming list honest.
 */
export const MATERIAL_ZONE: Record<number, EurekaZone> = {
  21801: 'anemos',  // 亂屬性水晶 Protean Crystal
  21802: 'anemos',  // 帕祖祖的羽毛 Pazuzu's Feather
  21803: 'anemos',  // 常風水晶 Anemos Crystal
  22975: 'pagos',   // 婁希的冰片 Louhi's Ice
  22976: 'pagos',   // 恆冰水晶 Pagos Crystal
  23309: 'pagos',   // 結冰亂屬性水晶 Frosted Protean Crystal
  24122: 'pyros',   // 大火焰亂屬性水晶 Smoldering Protean Crystal
  24123: 'pyros',   // 彭忒西勒亞的火種 Penthesilea's Flame
  24124: 'pyros',   // 湧火水晶 Pyros Crystal
  24806: 'hydatos', // 水晶龍之鱗 Crystalline Scale
  24807: 'hydatos', // 豐水水晶 Hydatos Crystal
  24808: 'hydatos', // 優雷卡的斷片 Eureka Fragment (Baldesion Arsenal in Hydatos)
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

/** Zone groups for the weapon overview dots (matches the 6 zone sections in ChainStepper). */
export const WEAPON_ZONE_GROUPS: ArmorZoneGroupDef[] = [
  { key: 'start',   label: '起點',    stages: ['antiquated'] },
  { key: 'anemos',  label: '常風之地', stages: ['anemos-base', 'anemos+1', 'anemos+2', 'anemos'] },
  { key: 'pagos',   label: '恆冰之地', stages: ['pagos', 'pagos+1'] },
  { key: 'pyros',   label: '湧火之地', stages: ['elemental', 'elemental+1', 'elemental+2', 'pyros'] },
  { key: 'hydatos', label: '豐水之地', stages: ['hydatos', 'hydatos+1', 'base-eureka', 'eureka'] },
  { key: 'final',   label: '最終形態', stages: ['physeos'] },
];

/** Zone groups for the anemos armor stepper. */
export const ANEMOS_ARMOR_ZONE_GROUPS: ArmorZoneGroupDef[] = [
  { key: 'start',  label: '起點',    stages: ['antiquated'] },
  { key: 'anemos', label: '常風之地', stages: ['anemos-base', 'anemos+1', 'anemos+2', 'anemos'] },
];

/** Zone groups for the elemental armor stepper. */
export const ELEMENTAL_ARMOR_ZONE_GROUPS: ArmorZoneGroupDef[] = [
  { key: 'pyros',   label: '湧火之地', stages: ['elemental'] },
  { key: 'hydatos', label: '豐水之地', stages: ['elemental+1'] },
  { key: 'final',   label: '最終形態', stages: ['elemental+2'] },
];
