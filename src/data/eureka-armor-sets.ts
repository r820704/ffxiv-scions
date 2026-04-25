import type { ArmorSetId } from '../types/eureka-gear';

/** 15 SB-era jobs — each has its own Eureka weapon chain + anemos armor. */
export type JobId =
  | 'PLD' | 'WAR' | 'DRK'
  | 'DRG' | 'SAM'
  | 'MNK'
  | 'NIN'
  | 'BRD' | 'MCH'
  | 'WHM' | 'SCH' | 'AST'
  | 'BLM' | 'SMN' | 'RDM';

/**
 * Post-SB jobs that share role-based elemental armor per ClassJobCategory but
 * have no Eureka weapon or per-job anemos chain (they appear only as shared
 * icons on RoleCard).
 */
export type PostSbJobId = 'GNB' | 'DNC' | 'RPR' | 'SGE' | 'VPR' | 'PCT' | 'BLU';

/** Every job that can equip Eureka elemental armor. */
export type AnyJobId = JobId | PostSbJobId;

export const ARMOR_SET_FOR_JOB: Record<JobId, ArmorSetId> = {
  // Tanks (fending)
  PLD: 'fending', WAR: 'fending', DRK: 'fending',
  // Maiming (heavy STR melee — pole/scythe)
  DRG: 'maiming',
  // Striking (martial — fists/katana)
  MNK: 'striking', SAM: 'striking',
  // Scouting (DEX rogue)
  NIN: 'scouting',
  // Aiming (ranged physical)
  BRD: 'aiming', MCH: 'aiming',
  // Healing
  WHM: 'healing', SCH: 'healing', AST: 'healing',
  // Casting (ranged magical)
  BLM: 'casting', SMN: 'casting', RDM: 'casting',
};

/**
 * Every job that shares each role-based elemental armor set, including
 * post-SB jobs (GNB/DNC/RPR/SGE/VPR/PCT/BLU). Mirrors the in-game
 * ClassJobCategory entries 59/76/65/103/66/64/63 for elemental armor.
 */
export const JOBS_FOR_ARMOR_SET: Record<ArmorSetId, AnyJobId[]> = {
  fending:  ['PLD', 'WAR', 'DRK', 'GNB'],
  maiming:  ['DRG', 'RPR'],
  striking: ['MNK', 'SAM'],
  scouting: ['NIN', 'VPR'],
  aiming:   ['BRD', 'MCH', 'DNC'],
  healing:  ['WHM', 'SCH', 'AST', 'SGE'],
  casting:  ['BLM', 'SMN', 'RDM', 'BLU', 'PCT'],
};

/** Every SB job has its own Eureka weapon chain. Ordered by role then canonical job order. */
export const JOBS_WITH_WEAPONS: JobId[] = [
  'PLD', 'WAR', 'DRK',
  'MNK', 'DRG', 'NIN', 'SAM',
  'BRD', 'MCH',
  'BLM', 'SMN', 'RDM',
  'WHM', 'SCH', 'AST',
];

/**
 * Traditional Chinese job names sourced from thewakingsands/ffxiv-datamining-tc
 * (ClassJob.csv) — must match official datamining text per CLAUDE.md.
 */
export const JOB_TC_NAME: Record<AnyJobId, string> = {
  PLD: '騎士',     WAR: '戰士',     DRK: '暗黑騎士', GNB: '絕槍戰士',
  DRG: '龍騎士',   SAM: '武士',     RPR: '奪魂者',
  MNK: '武僧',
  NIN: '忍者',     VPR: '毒蛇劍士',
  BRD: '吟遊詩人', MCH: '機工士',   DNC: '舞者',
  WHM: '白魔道士', SCH: '學者',     AST: '占星術師', SGE: '賢者',
  BLM: '黑魔道士', SMN: '召喚士',   RDM: '赤魔道士', BLU: '青魔道士', PCT: '繪靈法師',
};

export function isArmorSetShared(id: ArmorSetId): boolean {
  return JOBS_FOR_ARMOR_SET[id].length > 1;
}

/** Convenience: list of TC names for all jobs using an armor set. */
export function sharedJobNames(id: ArmorSetId): string[] {
  return JOBS_FOR_ARMOR_SET[id].map((j) => JOB_TC_NAME[j]);
}
