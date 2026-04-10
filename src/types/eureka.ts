export type LogosCategory =
  | 'wisdom'
  | 'spirit'
  | 'offensive'
  | 'defensive'
  | 'healing'
  | 'utility'
  | 'movement';

export type Role = 'tank' | 'healer' | 'melee' | 'ranged' | 'caster' | 'all';

export interface Logogram {
  id: string;
  itemId: number;
  nameTw: string;
  mnemeIds: string[];
}

export interface Mneme {
  id: string;
  nameTw: string;
  sourceLogogramId: string;
}

export interface RecipeIngredient {
  mnemeId: string;
  quantity: number;
}

export interface Recipe {
  ingredients: RecipeIngredient[];
}

export interface LogosAction {
  id: string;
  nameTw: string;
  descriptionTw: string;
  category: LogosCategory;
  roles: Role[];
  recipes: Recipe[];
  iconId: number;
}

export interface LogogramPrice {
  itemId: number;
  price: number | null;
  worldName: string | null;
  lastUpdated: number | null;
}

export interface EurekaData {
  logograms: Logogram[];
  mnemes: Mneme[];
  logosActions: LogosAction[];
}

export const CATEGORY_LABELS: Record<LogosCategory, string> = {
  wisdom: '智慧',
  spirit: '精神',
  offensive: '攻擊',
  defensive: '防禦',
  healing: '回復',
  utility: '輔助',
  movement: '移動',
};

export const ROLE_LABELS: Record<Role, string> = {
  tank: '坦克',
  healer: '治療',
  melee: '近戰',
  ranged: '遠程',
  caster: '法師',
  all: '全職業',
};
