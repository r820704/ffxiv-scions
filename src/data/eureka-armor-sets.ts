import type { ArmorSetId } from '../types/eureka-gear';

/**
 * All 15 SB-era jobs. Some (DRK, SAM, MCH, SCH, AST, RDM) don't have Eureka
 * weapons in Stormblood, but they DO use the role-based armor and should be
 * tracked so their gear progress is visible.
 */
export type JobId =
  | 'PLD' | 'WAR' | 'DRK'
  | 'DRG' | 'SAM'
  | 'MNK'
  | 'NIN'
  | 'BRD' | 'MCH'
  | 'WHM' | 'SCH' | 'AST'
  | 'BLM' | 'SMN' | 'RDM';

export const ARMOR_SET_FOR_JOB: Record<JobId, ArmorSetId> = {
  // Tanks
  PLD: 'fending', WAR: 'fending', DRK: 'fending',
  // Maiming (STR melee DPS heavy)
  DRG: 'maiming', SAM: 'maiming',
  // Striking
  MNK: 'striking',
  // Scouting
  NIN: 'scouting',
  // Aiming (ranged physical DPS)
  BRD: 'aiming', MCH: 'aiming',
  // Healing
  WHM: 'healing', SCH: 'healing', AST: 'healing',
  // Casting (ranged magical DPS)
  BLM: 'casting', SMN: 'casting', RDM: 'casting',
};

export const JOBS_FOR_ARMOR_SET: Record<ArmorSetId, JobId[]> = {
  fending: ['PLD', 'WAR', 'DRK'],
  maiming: ['DRG', 'SAM'],
  striking: ['MNK'],
  scouting: ['NIN'],
  aiming: ['BRD', 'MCH'],
  healing: ['WHM', 'SCH', 'AST'],
  casting: ['BLM', 'SMN', 'RDM'],
};

/**
 * Jobs that have Eureka weapon chains in SB (9 jobs). Used to decide whether to
 * render a full job card (with weapon section) or a compact armor-only card.
 */
export const JOBS_WITH_WEAPONS: JobId[] = [
  'PLD', 'WAR', 'DRG', 'MNK', 'NIN', 'BRD', 'BLM', 'SMN', 'WHM',
];

export const JOBS_ARMOR_ONLY: JobId[] = [
  'DRK', 'SAM', 'MCH', 'SCH', 'AST', 'RDM',
];

/** Traditional Chinese job names for UI display (job, not class). */
export const JOB_TC_NAME: Record<JobId, string> = {
  PLD: '騎士',   WAR: '戰士',    DRK: '暗黑騎士',
  DRG: '龍騎士', SAM: '武士',
  MNK: '武僧',
  NIN: '忍者',
  BRD: '吟遊詩人', MCH: '機工士',
  WHM: '白魔法師', SCH: '學者',  AST: '占星術士',
  BLM: '黑魔法師', SMN: '召喚師', RDM: '赤魔法師',
};

export function isArmorSetShared(id: ArmorSetId): boolean {
  return JOBS_FOR_ARMOR_SET[id].length > 1;
}

/** Convenience: list of TC names for all jobs using an armor set. */
export function sharedJobNames(id: ArmorSetId): string[] {
  return JOBS_FOR_ARMOR_SET[id].map((j) => JOB_TC_NAME[j]);
}
