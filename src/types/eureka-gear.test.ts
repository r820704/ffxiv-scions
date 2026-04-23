import { describe, it, expect } from 'vitest';
import type { SlotProgress, EurekaInventoryV3 } from './eureka-gear';
import {
  EUREKA_STAGES, EUREKA_JOBS, STAGE_ITEM_LEVELS, STAGE_TC_LABEL, JOB_TC_LABEL,
  ARMOR_SLOTS, ARMOR_SET_IDS, ZONE_OF_STAGE, ZONE_TC_NAME,
} from './eureka-gear';

describe('eureka-gear types', () => {
  it('has 16 stages', () => {
    expect(EUREKA_STAGES).toHaveLength(16);
  });

  it('has 15 jobs', () => {
    expect(EUREKA_JOBS).toHaveLength(15);
  });

  it('covers every stage in ilv and TC label maps', () => {
    for (const s of EUREKA_STAGES) {
      expect(STAGE_ITEM_LEVELS[s]).toBeTypeOf('number');
      expect(STAGE_TC_LABEL[s]).toBeTypeOf('string');
    }
  });

  it('covers every job in TC label map', () => {
    for (const j of EUREKA_JOBS) {
      expect(JOB_TC_LABEL[j]).toBeTypeOf('string');
    }
  });
});

describe('eureka-gear v3 types', () => {
  it('SlotProgress has currentStage required and targetStage optional', () => {
    const a: SlotProgress = { currentStage: 'antiquated' };
    const b: SlotProgress = { currentStage: 'pyros', targetStage: 'hydatos' };
    expect(a.currentStage).toBe('antiquated');
    expect(b.targetStage).toBe('hydatos');
  });

  it('EurekaInventoryV3 has schemaVersion 3', () => {
    const inv: EurekaInventoryV3 = {
      schemaVersion: 3,
      weapons: {},
      armor: { fending: {}, maiming: {}, striking: {}, scouting: {}, aiming: {}, healing: {}, casting: {} },
      materials: {},
    };
    expect(inv.schemaVersion).toBe(3);
  });

  it('ARMOR_SLOTS includes head body hands legs feet', () => {
    expect(ARMOR_SLOTS).toEqual(['head', 'body', 'hands', 'legs', 'feet']);
  });

  it('ARMOR_SET_IDS has 7 entries', () => {
    expect(ARMOR_SET_IDS).toHaveLength(7);
  });

  it('ZONE_OF_STAGE maps pyros → pyros zone', () => {
    expect(ZONE_OF_STAGE.pyros).toBe('pyros');
    expect(ZONE_OF_STAGE.hydatos).toBe('hydatos');
    expect(ZONE_OF_STAGE['anemos-base']).toBe('anemos');
  });

  it('ZONE_TC_NAME has TC zone names', () => {
    expect(ZONE_TC_NAME.pyros).toBe('湧火之地');
    expect(ZONE_TC_NAME.hydatos).toBe('豐水之地');
    expect(ZONE_TC_NAME.anemos).toBe('常風之地');
    expect(ZONE_TC_NAME.pagos).toBe('恆冰之地');
  });
});
