import { describe, it, expect } from 'vitest';
import { SUCCESS_RATE_TABLE, simulateSlotMC } from './slot-optimizer';
import { eurekaData } from '@/data/eureka-data';

describe('SUCCESS_RATE_TABLE', () => {
  it('should return correct success rates for all mneme counts', () => {
    expect(SUCCESS_RATE_TABLE[1]).toBe(1.0);
    expect(SUCCESS_RATE_TABLE[2]).toBe(1.0);
    expect(SUCCESS_RATE_TABLE[3]).toBe(1.0);
    expect(SUCCESS_RATE_TABLE[4]).toBe(0.7);
    expect(SUCCESS_RATE_TABLE[5]).toBe(0.5);
    expect(SUCCESS_RATE_TABLE[6]).toBe(0.3);
  });

  it('should return undefined for invalid mneme counts', () => {
    expect(SUCCESS_RATE_TABLE[0]).toBeUndefined();
    expect(SUCCESS_RATE_TABLE[7]).toBeUndefined();
  });
});

describe('simulateSlotMC', () => {
  // Helper: get action by ID
  const getAction = (id: string) => eurekaData.logosActions.find((a) => a.id === id)!;

  it('should return matrix with correct shape', () => {
    const slotNeeds = [
      {
        ingredients: getAction('wisdom-aetherweaver').recipes[0]!.ingredients,
        successRate: 1.0,
      },
    ];
    const result = simulateSlotMC(slotNeeds, 100);
    expect(result).toHaveLength(100);
    for (const row of result) {
      expect(row).toHaveLength(9); // 9 logograms
    }
  });

  it('should produce non-zero opens for the correct logogram', () => {
    const slotNeeds = [
      {
        ingredients: getAction('wisdom-aetherweaver').recipes[0]!.ingredients,
        successRate: 1.0,
      },
    ];
    const result = simulateSlotMC(slotNeeds, 500);
    for (const row of result) {
      expect(row[0]).toBeGreaterThan(0);
    }
    for (const row of result) {
      for (let j = 1; j < 9; j++) {
        expect(row[j]).toBe(0);
      }
    }
  });

  it('should require more opens on average with lower success rate', () => {
    const ing = getAction('wisdom-aetherweaver').recipes[0]!.ingredients;
    const result100 = simulateSlotMC([{ ingredients: ing, successRate: 1.0 }], 2000);
    const result30 = simulateSlotMC([{ ingredients: ing, successRate: 0.3 }], 2000);

    const avg = (matrix: number[][], col: number) =>
      matrix.reduce((sum, row) => sum + row[col]!, 0) / matrix.length;

    expect(avg(result30, 0)).toBeGreaterThan(avg(result100, 0) * 2);
  });

  it('should handle multiple slot needs', () => {
    const ing1 = getAction('wisdom-aetherweaver').recipes[0]!.ingredients;
    const ing2 = getAction('wisdom-martialist').recipes[0]!.ingredients;
    const result = simulateSlotMC(
      [
        { ingredients: ing1, successRate: 1.0 },
        { ingredients: ing2, successRate: 1.0 },
      ],
      500,
    );
    expect(result).toHaveLength(500);
    const avgOpens = result.reduce((sum, row) => sum + row[0]!, 0) / result.length;
    expect(avgOpens).toBeGreaterThanOrEqual(2);
  });

  it('should return all zeros for empty slot needs', () => {
    const result = simulateSlotMC([], 100);
    expect(result).toHaveLength(100);
    for (const row of result) {
      expect(row.every((v) => v === 0)).toBe(true);
    }
  });
});
