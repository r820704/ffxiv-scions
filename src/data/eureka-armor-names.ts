// Eureka armor item names sourced from thewakingsands/ffxiv-datamining-tc (Item.csv).
// IDs 22006-22080 (anemos armor), 24087-24121 (elemental armor base stage).

import type { ArmorSetId, ArmorSlot, EurekaStage } from '../types/eureka-gear';
import type { JobId } from './eureka-armor-sets';

/** Item levels for anemos armor track. */
export const ANEMOS_ARMOR_ITEM_LEVELS: Partial<Record<EurekaStage, number>> = {
  antiquated: 290,
  'anemos-base': 335,
  'anemos+1': 340,
  'anemos+2': 345,
  anemos: 350,
};

/** Item levels for elemental armor track. Note +1 and +2 share iL390 (substats differ). */
export const ELEMENTAL_ARMOR_ITEM_LEVELS: Partial<Record<EurekaStage, number>> = {
  elemental: 380,
  'elemental+1': 390,
  'elemental+2': 390,
};

/** Base item names for the anemos-base stage, per SB-era job and armor slot. */
export const ANEMOS_ARMOR_BASE_NAMES: Record<JobId, Record<ArmorSlot, string>> = {
  PLD: { head: '俠義頭冠',    body: '俠義戰甲',    hands: '俠義手鎧',      legs: '俠義腿甲',     feet: '俠義鎖甲靴' },
  MNK: { head: '和平頭冠',    body: '和平坎肩',    hands: '和平護臂',      legs: '和平短褲',     feet: '和平筒靴'   },
  WAR: { head: '殘暴面罩',    body: '殘暴兜甲',    hands: '殘暴手鎧',      legs: '殘暴馬褲',     feet: '殘暴鎖甲靴' },
  DRG: { head: '真血戰盔',    body: '真血戰鎧',    hands: '真血手鎧',      legs: '真血長褲',     feet: '真血脛甲'   },
  BRD: { head: '述事禮帽',    body: '述事外套',    hands: '述事手套',      legs: '述事下身',     feet: '述事長靴'   },
  WHM: { head: '七天頭冠',    body: '七天上衣',    hands: '七天半指護手',  legs: '七天下身',     feet: '七天長靴'   },
  BLM: { head: '七獄闊邊帽',  body: '七獄外套',    hands: '七獄手套',      legs: '七獄馬褲',     feet: '七獄長靴'   },
  SMN: { head: '通靈長角',    body: '通靈坎肩',    hands: '通靈護臂',      legs: '通靈五分褲',   feet: '通靈筒靴'   },
  SCH: { head: '雄辯方帽',    body: '雄辯外套',    hands: '雄辯護袖',      legs: '雄辯下身',     feet: '雄辯皮靴'   },
  NIN: { head: '影隱總面',    body: '影隱鎖帷子',  hands: '影隱手甲',      legs: '影隱袴',       feet: '影隱纏足'   },
  DRK: { head: '深淵輕盔',    body: '深淵胸甲',    hands: '深淵手鎧',      legs: '深淵重足鎧',   feet: '深淵鎖甲靴' },
  MCH: { head: '砲手護目鏡',  body: '砲手外套',    hands: '砲手手套',      legs: '砲手馬褲',     feet: '砲手長靴'   },
  AST: { head: '星座包頭巾',  body: '星座上衣',    hands: '星座護臂',      legs: '星座長褲',     feet: '星座涼鞋'   },
  SAM: { head: '明珍陣笠',    body: '明珍羽織',    hands: '明珍手甲',      legs: '明珍袴',       feet: '明珍木屐'   },
  RDM: { head: '鬥劍禮帽',    body: '鬥劍罩衣',    hands: '鬥劍手套',      legs: '鬥劍馬褲',     feet: '鬥劍長靴'   },
};

/** Base item name prefix for each elemental armor set and slot (for the `elemental` stage). */
export const ELEMENTAL_ARMOR_SLOT_NAMES: Record<ArmorSetId, Record<ArmorSlot, string>> = {
  fending:  { head: '元素禦敵頭盔',   body: '元素禦敵戰甲',   hands: '元素禦敵手鎧',   legs: '元素禦敵軟甲褲', feet: '元素禦敵皮靴'   },
  maiming:  { head: '元素制敵頭盔',   body: '元素制敵戰甲',   hands: '元素制敵手鎧',   legs: '元素制敵軟甲褲', feet: '元素制敵皮靴'   },
  striking: { head: '元素強襲狩獵帽', body: '元素強襲短衣',   hands: '元素強襲手套',   legs: '元素強襲馬褲',   feet: '元素強襲長靴'   },
  aiming:   { head: '元素精準狩獵帽', body: '元素精準短衣',   hands: '元素精準手套',   legs: '元素精準馬褲',   feet: '元素精準長靴'   },
  scouting: { head: '元素游擊頭冠',   body: '元素游擊短衣',   hands: '元素游擊手套',   legs: '元素游擊馬褲',   feet: '元素游擊長靴'   },
  healing:  { head: '元素治癒頭冠',   body: '元素治癒長衣',   hands: '元素治癒手套',   legs: '元素治癒下身',   feet: '元素治癒皮靴'   },
  casting:  { head: '元素詠咒頭冠',   body: '元素詠咒長衣',   hands: '元素詠咒手套',   legs: '元素詠咒下身',   feet: '元素詠咒皮靴'   },
};

const ANEMOS_STAGE_SUFFIX: Partial<Record<EurekaStage, string>> = {
  'anemos-base': '',
  'anemos+1': '+1',
  'anemos+2': '+2',
  'anemos': '·常風',
};

const ELEMENTAL_STAGE_SUFFIX: Partial<Record<EurekaStage, string>> = {
  'elemental': '',
  'elemental+1': '+1',
  'elemental+2': '+2',
};

/** Returns the TC item name for an anemos armor piece, or undefined if not applicable. */
export function getAnemosArmorName(
  job: string,
  slot: ArmorSlot,
  stage: EurekaStage,
): string | undefined {
  const base = ANEMOS_ARMOR_BASE_NAMES[job as JobId]?.[slot];
  if (!base) return undefined;
  if (stage === 'antiquated') return `舊化的${base}`;
  const suffix = ANEMOS_STAGE_SUFFIX[stage];
  if (suffix === undefined) return undefined;
  return base + suffix;
}

/** Returns the TC item name for an elemental armor piece, or undefined if not applicable. */
export function getElementalArmorName(
  set: ArmorSetId,
  slot: ArmorSlot,
  stage: EurekaStage,
): string | undefined {
  const base = ELEMENTAL_ARMOR_SLOT_NAMES[set]?.[slot];
  if (!base) return undefined;
  const suffix = ELEMENTAL_STAGE_SUFFIX[stage];
  if (suffix === undefined) return undefined;
  return base + suffix;
}
