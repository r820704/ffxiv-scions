import { describe, it, expect } from 'vitest';
import { canAfford } from './eureka-gear-cost';
import type { EurekaGearItem } from '@/types/eureka-gear';

function gear(materials: Array<[number, number]>): EurekaGearItem {
  return {
    id: 1, name: '', iconId: 0, stage: 'anemos', slot: 'weapon', jobs: [],
    itemLevel: 0,
    source: { npcId: 0, npcName: '', zone: '', specialShopId: 0 },
    cost: { materials: materials.map(([materialId, quantity]) => ({ materialId, quantity })) },
    tags: [],
  };
}

describe('canAfford', () => {
  it('returns true when all materials covered', () => {
    expect(canAfford(gear([[1, 3], [2, 5]]), { 1: 3, 2: 5 })).toBe(true);
  });

  it('returns true when inventory exceeds needs', () => {
    expect(canAfford(gear([[1, 3]]), { 1: 99 })).toBe(true);
  });

  it('returns false when any material short', () => {
    expect(canAfford(gear([[1, 3], [2, 5]]), { 1: 3, 2: 4 })).toBe(false);
  });

  it('returns false when material is missing from inventory entirely', () => {
    expect(canAfford(gear([[1, 1]]), {})).toBe(false);
  });

  it('returns true for zero-material cost (edge case)', () => {
    expect(canAfford(gear([]), {})).toBe(true);
  });
});
