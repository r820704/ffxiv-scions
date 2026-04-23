import type { ArmorSetId } from '../types/eureka-gear';

type JobId = 'PLD' | 'WAR' | 'DRG' | 'MNK' | 'NIN' | 'BRD' | 'BLM' | 'SMN' | 'WHM';

export const ARMOR_SET_FOR_JOB: Record<JobId, ArmorSetId> = {
  PLD: 'fending',
  WAR: 'fending',
  DRG: 'maiming',
  MNK: 'striking',
  NIN: 'scouting',
  BRD: 'aiming',
  WHM: 'healing',
  BLM: 'casting',
  SMN: 'casting',
};

export const JOBS_FOR_ARMOR_SET: Record<ArmorSetId, JobId[]> = {
  fending: ['PLD', 'WAR'],
  maiming: ['DRG'],
  striking: ['MNK'],
  scouting: ['NIN'],
  aiming: ['BRD'],
  healing: ['WHM'],
  casting: ['BLM', 'SMN'],
};

export function isArmorSetShared(id: ArmorSetId): boolean {
  return JOBS_FOR_ARMOR_SET[id].length > 1;
}
