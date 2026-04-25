import { describe, it, expect } from 'vitest';
import {
  ARMOR_SET_FOR_JOB,
  JOBS_FOR_ARMOR_SET,
  JOB_TC_NAME,
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

  it('maps DRG to maiming', () => {
    expect(ARMOR_SET_FOR_JOB.DRG).toBe('maiming');
  });

  it('maps SAM to striking (per official ClassJobCategory)', () => {
    expect(ARMOR_SET_FOR_JOB.SAM).toBe('striking');
  });
});

describe('JOBS_FOR_ARMOR_SET', () => {
  it('covers all 7 armor sets', () => {
    ARMOR_SET_IDS.forEach((id) => {
      expect(JOBS_FOR_ARMOR_SET[id]).toBeDefined();
      expect(JOBS_FOR_ARMOR_SET[id].length).toBeGreaterThan(0);
    });
  });

  it('fending includes all four tank jobs (PLD/WAR/DRK/GNB)', () => {
    expect(JOBS_FOR_ARMOR_SET.fending).toEqual(expect.arrayContaining(['PLD', 'WAR', 'DRK', 'GNB']));
  });

  it('maiming includes DRG and RPR', () => {
    expect(JOBS_FOR_ARMOR_SET.maiming).toEqual(expect.arrayContaining(['DRG', 'RPR']));
  });

  it('striking includes MNK and SAM', () => {
    expect(JOBS_FOR_ARMOR_SET.striking).toEqual(expect.arrayContaining(['MNK', 'SAM']));
  });

  it('scouting includes NIN and VPR', () => {
    expect(JOBS_FOR_ARMOR_SET.scouting).toEqual(expect.arrayContaining(['NIN', 'VPR']));
  });

  it('aiming includes BRD/MCH/DNC', () => {
    expect(JOBS_FOR_ARMOR_SET.aiming).toEqual(expect.arrayContaining(['BRD', 'MCH', 'DNC']));
  });

  it('healing includes WHM/SCH/AST/SGE', () => {
    expect(JOBS_FOR_ARMOR_SET.healing).toEqual(expect.arrayContaining(['WHM', 'SCH', 'AST', 'SGE']));
  });

  it('casting includes BLM/SMN/RDM/BLU/PCT', () => {
    expect(JOBS_FOR_ARMOR_SET.casting).toEqual(expect.arrayContaining(['BLM', 'SMN', 'RDM', 'BLU', 'PCT']));
  });
});

describe('JOB_TC_NAME', () => {
  it('uses datamining-tc names (魔道士, not 魔法師)', () => {
    expect(JOB_TC_NAME.WHM).toBe('白魔道士');
    expect(JOB_TC_NAME.BLM).toBe('黑魔道士');
    expect(JOB_TC_NAME.SMN).toBe('召喚士');
    expect(JOB_TC_NAME.AST).toBe('占星術師');
    expect(JOB_TC_NAME.RDM).toBe('赤魔道士');
  });

  it('includes post-SB jobs', () => {
    expect(JOB_TC_NAME.GNB).toBe('絕槍戰士');
    expect(JOB_TC_NAME.DNC).toBe('舞者');
    expect(JOB_TC_NAME.RPR).toBe('奪魂者');
    expect(JOB_TC_NAME.SGE).toBe('賢者');
    expect(JOB_TC_NAME.VPR).toBe('毒蛇劍士');
    expect(JOB_TC_NAME.PCT).toBe('繪靈法師');
    expect(JOB_TC_NAME.BLU).toBe('青魔道士');
  });
});

describe('isArmorSetShared', () => {
  it('returns true for fending (4 jobs)', () => {
    expect(isArmorSetShared('fending')).toBe(true);
  });

  it('returns true for maiming (DRG + RPR)', () => {
    expect(isArmorSetShared('maiming')).toBe(true);
  });

  it('returns true for striking (MNK + SAM)', () => {
    expect(isArmorSetShared('striking')).toBe(true);
  });

  it('returns true for casting (5 jobs)', () => {
    expect(isArmorSetShared('casting')).toBe(true);
  });
});
