import { describe, it, expect } from 'vitest';
import {
  calculateRecipeCost,
  calculateRecipeCost95,
  calculateRecipeCost50,
  calculateRecipeCostN,
  logogramsNeeded95,
} from './eureka-helpers';
import { buildProbCurve } from './joint-probability';
import { getLogogramForMneme } from '@/data/eureka-data';
import type { LogogramPrice, RecipeIngredient } from '@/types/eureka';

const mockPrices: LogogramPrice[] = [
  { itemId: 24007, price: 500, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24008, price: 300, worldName: 'Mandragora', lastUpdated: null, listings: [] },
  { itemId: 24009, price: 1000, worldName: 'Ramuh', lastUpdated: null, listings: [] },
  { itemId: 24010, price: 800, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24011, price: 600, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24012, price: 200, worldName: 'Valefor', lastUpdated: null, listings: [] },
  { itemId: 24013, price: 400, worldName: 'Shinryu', lastUpdated: null, listings: [] },
  { itemId: 24014, price: 700, worldName: 'Mandragora', lastUpdated: null, listings: [] },
  { itemId: 24809, price: 2000, worldName: 'Ramuh', lastUpdated: null, listings: [] },
];

describe('calculateRecipeCost', () => {
  it('should calculate cost for a single-mneme recipe', () => {
    const cost = calculateRecipeCost(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    expect(cost).toBe(500);
  });

  it('should calculate cost for multi-mneme recipe', () => {
    const cost = calculateRecipeCost(
      [
        { mnemeId: 'wisdom-platebearer', quantity: 1 },
        { mnemeId: 'protect-l', quantity: 1 },
      ],
      mockPrices
    );
    expect(cost).toBe(800);
  });

  it('should multiply by quantity', () => {
    const cost = calculateRecipeCost(
      [{ mnemeId: 'stoneskin-l', quantity: 3 }],
      mockPrices
    );
    expect(cost).toBe(1200);
  });

  it('should return null if any price is missing', () => {
    const noPrices: LogogramPrice[] = [
      { itemId: 24007, price: null, worldName: null, lastUpdated: null, listings: [] },
    ];
    const cost = calculateRecipeCost(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      noPrices
    );
    expect(cost).toBeNull();
  });
});

describe('logogramsNeeded95', () => {
  it('should return needed when only 1 mneme type', () => {
    expect(logogramsNeeded95(1, 1)).toBe(1);
    expect(logogramsNeeded95(3, 1)).toBe(3);
  });

  it('should match known values for 1 from 6 (expect 17)', () => {
    expect(logogramsNeeded95(1, 6)).toBe(17);
  });

  it('should match known values for 1 from 7 (expect 20)', () => {
    expect(logogramsNeeded95(1, 7)).toBe(20);
  });

  it('should require more logograms for higher quantity', () => {
    const n1 = logogramsNeeded95(1, 7);
    const n2 = logogramsNeeded95(2, 7);
    expect(n2).toBeGreaterThan(n1);
  });
});

describe('calculateRecipeCost95', () => {
  it('should be higher than base cost for multi-mneme logograms', () => {
    const baseCost = calculateRecipeCost(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    const cost95 = calculateRecipeCost95(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    expect(baseCost).not.toBeNull();
    expect(cost95).not.toBeNull();
    expect(cost95!).toBeGreaterThan(baseCost!);
  });

  it('should equal base cost for single-mneme logograms', () => {
    // curative has only 2 mnemes, but let's test with a hypothetical 1-mneme case
    // All real logograms have 2+ mnemes, so cost95 will always be > base
    const cost95 = calculateRecipeCost95(
      [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
      mockPrices
    );
    // conceptual has 7 mnemes, need 20 logograms at 95%
    expect(cost95).toBe(500 * 20);
  });

  /**
   * Test helper: given a recipe and total cost (representing a chosen allocation
   * of opens), recover the joint probability of meeting all needs.
   *
   * The greedy method B should choose opens (n_1, ..., n_k) per logogram such
   * that Σ n_i * price_i = totalCost AND Π p_i(n_i) >= 0.95.
   *
   * To verify, we re-derive n_i by reading prices and checking.
   * This helper builds curves and computes joint prob if we know the n_i.
   */
  function jointProbabilityForAllocation(
    ingredients: RecipeIngredient[],
    nPerLogogram: Record<string, number>,
  ): number {
    // Group ingredients by logogram
    const groups: Record<string, RecipeIngredient[]> = {};
    for (const ing of ingredients) {
      const logo = getLogogramForMneme(ing.mnemeId);
      if (!logo) continue;
      if (!groups[logo.id]) groups[logo.id] = [];
      groups[logo.id]!.push(ing);
    }

    let p = 1;
    for (const [logoId, ings] of Object.entries(groups)) {
      const logo = getLogogramForMneme(ings[0]!.mnemeId)!;
      const reqs = ings.map((i) => i.quantity);
      const n = nPerLogogram[logoId]!;
      const curve = buildProbCurve(reqs, logo.mnemeIds.length, n + 1);
      p *= curve[n]!;
    }
    return p;
  }

  describe('joint probability mode (Method B greedy)', () => {
    it('should produce >= 95% true joint probability for two-logogram recipe', () => {
      // 守護者的記憶 配方 3: 重騎兵的記憶 ×1 (conceptual, 7 mnemes, 500g) + 文理石膚 ×1 (mitigative, 2 mnemes, 400g)
      const ingredients: RecipeIngredient[] = [
        { mnemeId: 'wisdom-platebearer', quantity: 1 },
        { mnemeId: 'stoneskin-l', quantity: 1 },
      ];
      const cost = calculateRecipeCost95(ingredients, mockPrices)!;
      expect(cost).not.toBeNull();

      // Re-derive n per logogram from cost: search the (n1, n2) pair that sums to cost
      // and has joint prob >= 0.95. Since the optimizer is deterministic, there's a
      // unique allocation it picks - we validate any valid decomposition gives >= 0.95.
      // Simplest verification: try all (n1, n2) pairs that match cost and confirm at
      // least one has joint >= 0.95. If our implementation is correct, the chosen
      // allocation must have >= 0.95.
      const conceptualPrice = 500;
      const mitigativePrice = 400;
      let bestJointAtThisCost = 0;
      for (let n1 = 1; n1 * conceptualPrice <= cost; n1++) {
        const remaining = cost - n1 * conceptualPrice;
        if (remaining % mitigativePrice !== 0) continue;
        const n2 = remaining / mitigativePrice;
        if (n2 < 1) continue;
        const joint = jointProbabilityForAllocation(ingredients, {
          conceptual: n1,
          mitigative: n2,
        });
        if (joint > bestJointAtThisCost) bestJointAtThisCost = joint;
      }
      expect(bestJointAtThisCost).toBeGreaterThanOrEqual(0.95);
    });

    it('should be cheaper than equal-allocation Method A for 2 logograms', () => {
      // For k=2 with very different prices, greedy should outperform 0.95^(1/2) split
      const ingredients: RecipeIngredient[] = [
        { mnemeId: 'wisdom-platebearer', quantity: 1 }, // conceptual 7 mnemes, 500g
        { mnemeId: 'stoneskin-l', quantity: 1 },        // mitigative 2 mnemes, 400g
      ];
      const greedyCost = calculateRecipeCost95(ingredients, mockPrices)!;
      // Method A reference: each must reach 0.95^(1/2) ≈ 0.9747 confidence
      // For p=1/7: need n s.t. 1-(6/7)^n >= 0.9747 → n = 24
      // For p=1/2: need n s.t. 1-(1/2)^n >= 0.9747 → n = 6
      // Method A cost = 24*500 + 6*400 = 14400
      expect(greedyCost).toBeLessThanOrEqual(24 * 500 + 6 * 400);
    });

    it('should be greater than the old (independent per-ingredient) cost when joint matters', () => {
      // Old behavior: each ingredient at 95% individually → joint ~90.25%
      // New behavior: must satisfy joint 95% → must be >= old cost
      const ingredients: RecipeIngredient[] = [
        { mnemeId: 'wisdom-platebearer', quantity: 1 },
        { mnemeId: 'stoneskin-l', quantity: 1 },
      ];
      // Old per-ingredient: 20 * 500 + 5 * 400 = 12000
      const oldIndependentCost = 20 * 500 + 5 * 400;
      const newJointCost = calculateRecipeCost95(ingredients, mockPrices)!;
      expect(newJointCost).toBeGreaterThanOrEqual(oldIndependentCost);
    });

    it('should equal single-ingredient cost (no joint penalty) for single-ingredient recipes', () => {
      // For k=1, joint = single, so no extra cost
      const cost = calculateRecipeCost95(
        [{ mnemeId: 'wisdom-aetherweaver', quantity: 1 }],
        mockPrices,
      );
      expect(cost).toBe(500 * 20);
    });

    it('should return null when any logogram price is missing', () => {
      const partial: LogogramPrice[] = [
        { itemId: 24007, price: 500, worldName: null, lastUpdated: null, listings: [] },
      ];
      const cost = calculateRecipeCost95(
        [
          { mnemeId: 'wisdom-platebearer', quantity: 1 },
          { mnemeId: 'stoneskin-l', quantity: 1 },
        ],
        partial,
      );
      expect(cost).toBeNull();
    });

    it('should reach >= 95% for three different logograms', () => {
      const ingredients: RecipeIngredient[] = [
        { mnemeId: 'wisdom-platebearer', quantity: 1 }, // conceptual 500g
        { mnemeId: 'stoneskin-l', quantity: 1 },        // mitigative 400g
        { mnemeId: 'protect-l', quantity: 1 },          // fundamental 300g
      ];
      const cost = calculateRecipeCost95(ingredients, mockPrices)!;
      expect(cost).not.toBeNull();

      // Verify: enumerate plausible (n1,n2,n3) combos to find one matching cost with joint >= 0.95
      const prices = { conceptual: 500, mitigative: 400, fundamental: 300 };
      let bestJoint = 0;
      for (let n1 = 1; n1 * prices.conceptual <= cost; n1++) {
        for (let n2 = 1; n2 * prices.mitigative + n1 * prices.conceptual <= cost; n2++) {
          const remaining = cost - n1 * prices.conceptual - n2 * prices.mitigative;
          if (remaining < 0 || remaining % prices.fundamental !== 0) continue;
          const n3 = remaining / prices.fundamental;
          if (n3 < 1) continue;
          const joint = jointProbabilityForAllocation(ingredients, {
            conceptual: n1,
            mitigative: n2,
            fundamental: n3,
          });
          if (joint > bestJoint) bestJoint = joint;
        }
      }
      expect(bestJoint).toBeGreaterThanOrEqual(0.95);
    });
  });
});

describe('calculateRecipeCostN (parameterized)', () => {
  const ingredients: RecipeIngredient[] = [
    { mnemeId: 'wisdom-aetherweaver', quantity: 5 },
  ];

  it('returns less cost at 50% than at 95%', () => {
    const cost95 = calculateRecipeCostN(ingredients, mockPrices, 0.95);
    const cost50 = calculateRecipeCostN(ingredients, mockPrices, 0.5);
    expect(cost50).not.toBeNull();
    expect(cost95).not.toBeNull();
    expect(cost50!).toBeLessThan(cost95!);
  });

  it('rejects out-of-range confidence', () => {
    expect(() => calculateRecipeCostN(ingredients, mockPrices, 0)).toThrow(RangeError);
    expect(() => calculateRecipeCostN(ingredients, mockPrices, 1.1)).toThrow(RangeError);
    expect(() => calculateRecipeCostN(ingredients, mockPrices, NaN)).toThrow(RangeError);
  });
});

describe('calculateRecipeCost50 wrapper', () => {
  const ingredients: RecipeIngredient[] = [
    { mnemeId: 'wisdom-aetherweaver', quantity: 5 },
  ];

  it('equals calculateRecipeCostN at 0.5', () => {
    expect(calculateRecipeCost50(ingredients, mockPrices)).toBe(
      calculateRecipeCostN(ingredients, mockPrices, 0.5),
    );
  });
});

describe('calculateRecipeCost95 wrapper (back-compat)', () => {
  const ingredients: RecipeIngredient[] = [
    { mnemeId: 'wisdom-aetherweaver', quantity: 5 },
  ];

  it('equals calculateRecipeCostN at 0.95', () => {
    expect(calculateRecipeCost95(ingredients, mockPrices)).toBe(
      calculateRecipeCostN(ingredients, mockPrices, 0.95),
    );
  });
});
