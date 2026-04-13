import { describe, it, expect } from 'vitest';
import { calculateRecipeCost, findActionsForMnemes } from './eureka-helpers';
import type { LogogramPrice } from '@/types/eureka';

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

describe('findActionsForMnemes', () => {
  it('should find actions that can be crafted with given mnemes', () => {
    const actions = findActionsForMnemes(new Set(['wisdom-aetherweaver']));
    const ids = actions.map((a) => a.id);
    expect(ids).toContain('wisdom-aetherweaver');
  });

  it('should find actions with multi-mneme recipes', () => {
    const actions = findActionsForMnemes(new Set(['wisdom-platebearer', 'protect-l']));
    const ids = actions.map((a) => a.id);
    expect(ids).toContain('wisdom-guardian');
    expect(ids).toContain('wisdom-platebearer');
    expect(ids).toContain('protect-l');
  });

  it('should return empty for no matching mnemes', () => {
    const actions = findActionsForMnemes(new Set());
    expect(actions).toHaveLength(0);
  });
});
