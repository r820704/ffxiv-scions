import { describe, it, expect } from 'vitest';
import {
  EUREKA_STAGES, EUREKA_JOBS, STAGE_ITEM_LEVELS, STAGE_TC_LABEL, JOB_TC_LABEL,
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
