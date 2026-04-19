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
  antiquated: '古代',
  'anemos-base': '常風基礎',
  'anemos+1': '常風+1',
  'anemos+2': '常風+2',
  anemos: '常風',
  pagos: '恆冰',
  'pagos+1': '恆冰+1',
  elemental: '元素',
  'elemental+1': '元素+1',
  'elemental+2': '元素+2',
  pyros: '湧火',
  hydatos: '豐水',
  'hydatos+1': '豐水+1',
  'base-eureka': '優雷卡基礎',
  eureka: '優雷卡',
  physeos: 'Physeos',
};

export const JOB_TC_LABEL: Record<FFXIVJob, string> = {
  PLD: '騎士', WAR: '斧術師', DRK: '暗黑騎士',
  DRG: '龍騎士', MNK: '武僧', SAM: '武士', NIN: '忍者',
  BRD: '吟遊詩人', MCH: '機工士',
  BLM: '黑魔法師', SMN: '召喚師', RDM: '赤魔法師',
  WHM: '白魔法師', SCH: '學者', AST: '占星術士',
};
