import type { StageUpgradeCost } from '../types/eureka-gear';

const PROTEAN_CRYSTAL = 21801;
const PAZUZU_FEATHER = 21802;
const FROSTED_PROTEAN = 23309;
const PAGOS_CRYSTAL = 22976;
const LOUHI_ICE = 22975;
const PYROS_CRYSTAL = 24124;
const PENTHESILEA_FLAME = 24123;
const HYDATOS_CRYSTAL = 24807;
const CRYSTALLINE_SCALE = 24806;
const EUREKA_FRAGMENT = 24808;

export const STAGE_UPGRADE_COSTS: StageUpgradeCost[] = [
  { from: 'antiquated',  to: 'anemos-base', materials: [{ materialId: PROTEAN_CRYSTAL, quantity: 100 }] },
  { from: 'anemos-base', to: 'anemos+1',    materials: [{ materialId: PROTEAN_CRYSTAL, quantity: 400 }] },
  { from: 'anemos+1',    to: 'anemos+2',    materials: [{ materialId: PROTEAN_CRYSTAL, quantity: 800 }] },
  { from: 'anemos+2',    to: 'anemos',      materials: [{ materialId: PAZUZU_FEATHER, quantity: 3 }] },
  { from: 'anemos',      to: 'pagos',       materials: [{ materialId: FROSTED_PROTEAN, quantity: 5 }] },
  { from: 'pagos',       to: 'pagos+1',     materials: [
    { materialId: FROSTED_PROTEAN, quantity: 10 },
    { materialId: PAGOS_CRYSTAL, quantity: 500 },
  ] },
  { from: 'pagos+1',     to: 'elemental',   materials: [
    { materialId: FROSTED_PROTEAN, quantity: 16 },
    { materialId: LOUHI_ICE, quantity: 5 },
  ] },
  { from: 'elemental',   to: 'elemental+1', materials: [{ materialId: PYROS_CRYSTAL, quantity: 150 }], notes: '需收集 10 個文理技能圖鑑' },
  { from: 'elemental+1', to: 'elemental+2', materials: [{ materialId: PYROS_CRYSTAL, quantity: 200 }], notes: '需收集 20 個文理技能圖鑑' },
  { from: 'elemental+2', to: 'pyros',       materials: [
    { materialId: PYROS_CRYSTAL, quantity: 300 },
    { materialId: PENTHESILEA_FLAME, quantity: 5 },
  ], notes: '需收集 30 個文理技能圖鑑' },
  { from: 'pyros',       to: 'hydatos',     materials: [{ materialId: HYDATOS_CRYSTAL, quantity: 50 }] },
  { from: 'hydatos',     to: 'hydatos+1',   materials: [{ materialId: HYDATOS_CRYSTAL, quantity: 100 }] },
  { from: 'hydatos+1',   to: 'base-eureka', materials: [{ materialId: HYDATOS_CRYSTAL, quantity: 100 }] },
  { from: 'base-eureka', to: 'eureka',      materials: [
    { materialId: HYDATOS_CRYSTAL, quantity: 100 },
    { materialId: CRYSTALLINE_SCALE, quantity: 5 },
  ] },
  { from: 'eureka',      to: 'physeos',     materials: [{ materialId: EUREKA_FRAGMENT, quantity: 100 }] },
];

