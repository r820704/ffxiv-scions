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

  it('anemos+2 → anemos for weapons requires only PAZUZU_FEATHER (no ANEMOS_CRYSTAL)', () => {
    const edge = STAGE_UPGRADE_COSTS.find((c) => c.from === 'anemos+2' && c.to === 'anemos');
    expect(edge).toBeTruthy();
    expect(edge!.materials).toHaveLength(1);
    const onlyMaterial = edge!.materials[0]!;
    expect(onlyMaterial.materialId).toBe(21802); // PAZUZU_FEATHER
    expect(onlyMaterial.quantity).toBe(3);
  });
});
