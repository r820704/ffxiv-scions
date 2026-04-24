import { describe, it, expect } from 'vitest';
import { STAGE_UPGRADE_COSTS } from './eureka-stage-costs';
import { EUREKA_STAGES } from '../types/eureka-gear';

describe('eureka-stage-costs', () => {
  it('has an entry for every consecutive stage transition', () => {
    expect(STAGE_UPGRADE_COSTS).toHaveLength(15);
    for (let i = 0; i < EUREKA_STAGES.length - 1; i++) {
      const from = EUREKA_STAGES[i];
      const to = EUREKA_STAGES[i + 1];
      const match = STAGE_UPGRADE_COSTS.find((c) => c.from === from && c.to === to);
      expect(match, `missing ${from} → ${to}`).toBeTruthy();
    }
  });

  it('every material reference has positive quantity', () => {
    for (const cost of STAGE_UPGRADE_COSTS) {
      for (const m of cost.materials) {
        expect(m.quantity).toBeGreaterThan(0);
      }
    }
  });
});
