import { describe, it, expect } from 'vitest';
import { ANEMOS_ARMOR_COSTS, ELEMENTAL_ARMOR_COSTS } from './eureka-armor-costs';
import { ANEMOS_ARMOR_STAGES, ELEMENTAL_ARMOR_STAGES } from '../types/eureka-gear';

describe('ANEMOS_ARMOR_COSTS', () => {
  it('has an entry for every anemos-stage transition (4 edges)', () => {
    expect(ANEMOS_ARMOR_COSTS).toHaveLength(4);
    for (let i = 0; i < ANEMOS_ARMOR_STAGES.length - 1; i++) {
      const from = ANEMOS_ARMOR_STAGES[i];
      const to = ANEMOS_ARMOR_STAGES[i + 1];
      const match = ANEMOS_ARMOR_COSTS.find((c) => c.from === from && c.to === to);
      expect(match, `missing anemos armor edge ${from} → ${to}`).toBeTruthy();
    }
  });

  it('has no slots restriction (all anemos entries apply to every slot)', () => {
    for (const c of ANEMOS_ARMOR_COSTS) {
      expect(c.slots).toBeUndefined();
    }
  });
});

describe('ELEMENTAL_ARMOR_COSTS', () => {
  it('starts with antiquated → elemental (no split)', () => {
    const entry = ELEMENTAL_ARMOR_COSTS.find((c) => c.from === 'antiquated' && c.to === 'elemental');
    expect(entry).toBeTruthy();
    expect(entry?.slots).toBeUndefined();
  });

  it('has split entries (body/legs vs head/hands/feet) for elemental → +1', () => {
    const entries = ELEMENTAL_ARMOR_COSTS.filter((c) => c.from === 'elemental' && c.to === 'elemental+1');
    expect(entries).toHaveLength(2);
    const bodyLegs = entries.find((c) => c.slots?.includes('body'));
    const headHandsFeet = entries.find((c) => c.slots?.includes('head'));
    expect(bodyLegs?.materials[0]?.quantity).toBe(50);
    expect(headHandsFeet?.materials[0]?.quantity).toBe(30);
  });

  it('has split entries for elemental+1 → +2', () => {
    const entries = ELEMENTAL_ARMOR_COSTS.filter((c) => c.from === 'elemental+1' && c.to === 'elemental+2');
    expect(entries).toHaveLength(2);
    const bodyLegs = entries.find((c) => c.slots?.includes('body'));
    const headHandsFeet = entries.find((c) => c.slots?.includes('head'));
    expect(bodyLegs?.materials[0]?.quantity).toBe(35);
    expect(headHandsFeet?.materials[0]?.quantity).toBe(21);
  });

  it('covers every elemental-track transition', () => {
    // Walk the sequence: antiquated → elemental → +1 → +2
    for (let i = 0; i < ELEMENTAL_ARMOR_STAGES.length - 1; i++) {
      const from = ELEMENTAL_ARMOR_STAGES[i];
      const to = ELEMENTAL_ARMOR_STAGES[i + 1];
      const match = ELEMENTAL_ARMOR_COSTS.find((c) => c.from === from && c.to === to);
      expect(match, `missing elemental armor edge ${from} → ${to}`).toBeTruthy();
    }
  });
});
