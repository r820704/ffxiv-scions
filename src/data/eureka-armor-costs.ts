/**
 * Eureka armor upgrade costs.
 *
 * SB Eureka has two INDEPENDENT armor tracks per slot:
 *
 * 1. **Anemos chain** (glamour-only, ends at iL350)
 *    antiquated → anemos-base (335) → +1 (340) → +2 (345) → anemos (350)
 *    All slots use same cost. Source: Gerolt in Eureka Anemos.
 *
 * 2. **Elemental chain** (combat set, ends at iL390 "Physeos armor")
 *    (none) → elemental (380) → +1 (390) → +2 (390)
 *    Split costs: body/legs use more than head/hands/feet at +1 and +2.
 *    Source: Expedition Artisan in Eureka Pyros / Hydatos.
 *    Prerequisites: 50 Logos Actions for base, 56 for +1, BA clear (Eureka Fragments) for +2.
 *
 * Cost data verified against ffxiv.consolegameswiki.com/wiki/Eurekan_Gear (2026-04-24).
 */
import type { StageUpgradeCost } from '../types/eureka-gear';

const PROTEAN_CRYSTAL = 21801;
const ANEMOS_CRYSTAL = 21803;
const PYROS_CRYSTAL = 24124;
const HYDATOS_CRYSTAL = 24807;
const EUREKA_FRAGMENT = 24808;

/**
 * Anemos armor chain — all slots share same cost per stage.
 */
export const ANEMOS_ARMOR_COSTS: StageUpgradeCost[] = [
  { from: 'antiquated',  to: 'anemos-base', materials: [{ materialId: PROTEAN_CRYSTAL, quantity: 50 }] },
  { from: 'anemos-base', to: 'anemos+1',    materials: [{ materialId: PROTEAN_CRYSTAL, quantity: 150 }] },
  { from: 'anemos+1',    to: 'anemos+2',    materials: [{ materialId: PROTEAN_CRYSTAL, quantity: 400 }] },
  { from: 'anemos+2',    to: 'anemos',      materials: [{ materialId: ANEMOS_CRYSTAL, quantity: 150 }] },
];

/**
 * Elemental armor chain — per-slot split costs at +1 and +2.
 * Each edge has two variants (body/legs vs head/hands/feet) for stages that split;
 * the initial acquisition (antiquated → elemental) is uniform across slots.
 */
export const ELEMENTAL_ARMOR_COSTS: StageUpgradeCost[] = [
  {
    from: 'antiquated',
    to: 'elemental',
    materials: [{ materialId: PYROS_CRYSTAL, quantity: 40 }],
    notes: '需收集 50 個文理技能圖鑑，且至少完成一件任意職業的恆冰武器',
  },
  // elemental → elemental+1 — system filters by slot, so the "身/腿" / "頭/手/腳"
  // prefix is redundant; only one of these is shown to any given player.
  {
    from: 'elemental',
    to: 'elemental+1',
    slots: ['body', 'legs'],
    materials: [{ materialId: HYDATOS_CRYSTAL, quantity: 50 }],
    notes: '需解鎖 56 個文理技能圖鑑',
  },
  {
    from: 'elemental',
    to: 'elemental+1',
    slots: ['head', 'hands', 'feet'],
    materials: [{ materialId: HYDATOS_CRYSTAL, quantity: 30 }],
    notes: '需解鎖 56 個文理技能圖鑑',
  },
  // elemental+1 → elemental+2 — acquisition method for 優雷卡的斷片 is now
  // per-material (MATERIAL_ACQUISITION); no additional edge note needed.
  {
    from: 'elemental+1',
    to: 'elemental+2',
    slots: ['body', 'legs'],
    materials: [{ materialId: EUREKA_FRAGMENT, quantity: 35 }],
  },
  {
    from: 'elemental+1',
    to: 'elemental+2',
    slots: ['head', 'hands', 'feet'],
    materials: [{ materialId: EUREKA_FRAGMENT, quantity: 21 }],
  },
];
