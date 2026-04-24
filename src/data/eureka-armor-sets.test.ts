import { describe, it, expect } from 'vitest';
import {
  ARMOR_SET_FOR_JOB,
  JOBS_FOR_ARMOR_SET,
  isArmorSetShared,
} from './eureka-armor-sets';
import { ARMOR_SET_IDS } from '../types/eureka-gear';

describe('ARMOR_SET_FOR_JOB', () => {
  it('maps PLD and WAR to fending', () => {
    expect(ARMOR_SET_FOR_JOB.PLD).toBe('fending');
    expect(ARMOR_SET_FOR_JOB.WAR).toBe('fending');
  });

  it('maps BLM and SMN to casting', () => {
    expect(ARMOR_SET_FOR_JOB.BLM).toBe('casting');
    expect(ARMOR_SET_FOR_JOB.SMN).toBe('casting');
  });

  it('maps DRG to maiming alone', () => {
    expect(ARMOR_SET_FOR_JOB.DRG).toBe('maiming');
  });
});

describe('JOBS_FOR_ARMOR_SET', () => {
  it('covers all 7 armor sets', () => {
    ARMOR_SET_IDS.forEach((id) => {
      expect(JOBS_FOR_ARMOR_SET[id]).toBeDefined();
      expect(JOBS_FOR_ARMOR_SET[id].length).toBeGreaterThan(0);
    });
  });

  it('fending includes PLD and WAR', () => {
    expect(JOBS_FOR_ARMOR_SET.fending).toEqual(expect.arrayContaining(['PLD', 'WAR']));
  });

  it('maiming includes DRG and SAM', () => {
    expect(JOBS_FOR_ARMOR_SET.maiming).toEqual(expect.arrayContaining(['DRG', 'SAM']));
  });

  it('fending includes DRK (weaponless-but-shares-armor)', () => {
    expect(JOBS_FOR_ARMOR_SET.fending).toContain('DRK');
  });

  it('healing includes SCH and AST (both weaponless)', () => {
    expect(JOBS_FOR_ARMOR_SET.healing).toEqual(expect.arrayContaining(['WHM', 'SCH', 'AST']));
  });
});

describe('isArmorSetShared', () => {
  it('returns true for fending (2 jobs)', () => {
    expect(isArmorSetShared('fending')).toBe(true);
  });

  it('returns true for maiming (DRG + SAM)', () => {
    expect(isArmorSetShared('maiming')).toBe(true);
  });

  it('returns false for striking (MNK only)', () => {
    expect(isArmorSetShared('striking')).toBe(false);
  });

  it('returns true for casting (2 jobs)', () => {
    expect(isArmorSetShared('casting')).toBe(true);
  });
});
