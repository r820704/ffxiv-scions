import { describe, it, expect } from 'vitest';
import { getNextStage, hasEnoughMaterials, deductMaterials, findCost, filterChains, costBetween, getJobProgress } from './eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../data/eureka-stage-costs';
import type { EurekaChain, GearFilterState, EurekaStage, EurekaInventoryV3 } from '../types/eureka-gear';

describe('getNextStage', () => {
  it('returns next stage for mid chain', () => {
    expect(getNextStage('pagos')).toBe('pagos+1');
    expect(getNextStage('anemos+2')).toBe('anemos');
  });
  it('returns null for physeos (end)', () => {
    expect(getNextStage('physeos')).toBeNull();
  });
  it('returns anemos-base for antiquated', () => {
    expect(getNextStage('antiquated')).toBe('anemos-base');
  });
});

describe('findCost', () => {
  it('returns the upgrade cost for a stage with a next stage', () => {
    const cost = findCost('antiquated', STAGE_UPGRADE_COSTS);
    expect(cost).not.toBeNull();
    expect(cost?.to).toBe('anemos-base');
  });
  it('returns null for physeos', () => {
    expect(findCost('physeos', STAGE_UPGRADE_COSTS)).toBeNull();
  });
});

describe('hasEnoughMaterials', () => {
  it('returns true when all materials present', () => {
    // antiquated → anemos-base needs PROTEAN_CRYSTAL (21801) × 100
    const inv = { 21801: 100 };
    expect(hasEnoughMaterials('antiquated', inv, STAGE_UPGRADE_COSTS)).toBe(true);
  });
  it('returns false when insufficient', () => {
    const inv = { 21801: 99 };
    expect(hasEnoughMaterials('antiquated', inv, STAGE_UPGRADE_COSTS)).toBe(false);
  });
  it('returns false at physeos (no next stage)', () => {
    expect(hasEnoughMaterials('physeos', {}, STAGE_UPGRADE_COSTS)).toBe(false);
  });
  it('requires ALL materials for multi-material upgrades', () => {
    // pagos → pagos+1 needs FROSTED_PROTEAN (23309) × 10 AND PAGOS_CRYSTAL (22976) × 500
    expect(hasEnoughMaterials('pagos', { 23309: 10, 22976: 499 }, STAGE_UPGRADE_COSTS)).toBe(false);
    expect(hasEnoughMaterials('pagos', { 23309: 10, 22976: 500 }, STAGE_UPGRADE_COSTS)).toBe(true);
  });
});

describe('deductMaterials', () => {
  it('subtracts cost materials from inventory', () => {
    const inv = { 21801: 500, 23309: 50 };
    const next = deductMaterials(inv, [{ materialId: 21801, quantity: 100 }]);
    expect(next).toEqual({ 21801: 400, 23309: 50 });
  });
  it('never goes below zero', () => {
    const inv = { 21801: 5 };
    const next = deductMaterials(inv, [{ materialId: 21801, quantity: 100 }]);
    expect(next[21801]).toBe(0);
  });
});

const sampleChains: EurekaChain[] = [
  { chainId: 'drg-ryunohige', job: 'DRG', isShield: false, displayName: '龍騎士 · 龍鬚' },
  { chainId: 'pld-galatyn', job: 'PLD', isShield: false, displayName: '騎士 · 神聖劍' },
  { chainId: 'pld-galatyn-shield', job: 'PLD', isShield: true, displayName: '騎士 · 神聖盾' },
];

function emptyFilter(): GearFilterState {
  return {
    search: '', jobs: new Set(), stages: new Set(),
    onlyUpgradable: false, onlyCompleted: false, sort: 'role',
  };
}

describe('filterChains', () => {
  it('returns all when filter is empty', () => {
    expect(filterChains(sampleChains, emptyFilter(), {}, {}, []).length).toBe(3);
  });
  it('filters by search match on displayName', () => {
    const f: GearFilterState = { ...emptyFilter(), search: '龍鬚' };
    const out = filterChains(sampleChains, f, {}, {}, []);
    expect(out).toHaveLength(1);
    expect(out[0]?.chainId).toBe('drg-ryunohige');
  });
  it('filters by job set', () => {
    const f: GearFilterState = { ...emptyFilter(), jobs: new Set(['PLD']) };
    const out = filterChains(sampleChains, f, {}, {}, []);
    expect(out).toHaveLength(2);
  });
  it('filters by stage set (matches current progress)', () => {
    const progress: Record<string, EurekaStage | null> = {
      'drg-ryunohige': 'pagos',
      'pld-galatyn': 'anemos',
    };
    const f: GearFilterState = { ...emptyFilter(), stages: new Set(['pagos']) };
    const out = filterChains(sampleChains, f, progress, {}, []);
    expect(out).toHaveLength(1);
    expect(out[0]?.chainId).toBe('drg-ryunohige');
  });
  it('onlyCompleted filters physeos only', () => {
    const progress: Record<string, EurekaStage | null> = {
      'drg-ryunohige': 'physeos',
      'pld-galatyn': 'eureka',
    };
    const f: GearFilterState = { ...emptyFilter(), onlyCompleted: true };
    const out = filterChains(sampleChains, f, progress, {}, []);
    expect(out).toHaveLength(1);
  });
});

describe('costBetween', () => {
  it('returns empty array when from === to', () => {
    expect(costBetween('anemos', 'anemos', STAGE_UPGRADE_COSTS)).toEqual([]);
  });

  it('returns single-edge cost for adjacent stages', () => {
    const cost = costBetween('antiquated', 'anemos-base', STAGE_UPGRADE_COSTS);
    expect(cost).toHaveLength(1);
    expect(cost[0]?.quantity).toBe(100); // Protean Crystal
  });

  it('aggregates multi-edge cost antiquated → anemos+2', () => {
    const cost = costBetween('antiquated', 'anemos+2', STAGE_UPGRADE_COSTS);
    // 100 + 400 + 800 = 1300 Protean Crystal, all same materialId
    const total = cost.find((c) => c.materialId === 21801)?.quantity ?? 0;
    expect(total).toBe(1300);
  });

  it('merges different materials from multiple edges', () => {
    // pagos → pagos+1: 10 Frosted Protean + 500 Pagos Crystal
    // pagos+1 → elemental: 16 Frosted Protean + 5 Louhi's Ice
    const cost = costBetween('pagos', 'elemental', STAGE_UPGRADE_COSTS);
    const frosted = cost.find((c) => c.materialId === 23309)?.quantity ?? 0;
    expect(frosted).toBe(26); // 10 + 16
    const pagos = cost.find((c) => c.materialId === 22976)?.quantity ?? 0;
    expect(pagos).toBe(500);
    const louhi = cost.find((c) => c.materialId === 22975)?.quantity ?? 0;
    expect(louhi).toBe(5);
  });

  it('handles reverse direction by returning empty (rollback has 0 cost)', () => {
    expect(costBetween('pyros', 'anemos', STAGE_UPGRADE_COSTS)).toEqual([]);
  });
});

describe('getJobProgress', () => {
  const baseInv: EurekaInventoryV3 = {
    schemaVersion: 3,
    weapons: {
      'pld-galatyn': { currentStage: 'anemos', targetStage: 'pagos' },
      'pld-galatyn-shield': { currentStage: 'antiquated' },
      'war-farsha': { currentStage: 'pyros' },
    },
    armor: {
      fending: { head: { currentStage: 'pagos' }, body: { currentStage: 'anemos' } },
      maiming: {}, striking: {}, scouting: {}, aiming: {}, healing: {}, casting: {},
    },
    materials: {},
  };

  it('PLD has 2 weapon chains + fending armor', () => {
    const p = getJobProgress('PLD', baseInv);
    expect(p.weapons).toHaveLength(2);
    expect(p.weapons[0]?.chainId).toBe('pld-galatyn');
    expect(p.armor.set).toBe('fending');
    expect(p.armor.pieces.head?.currentStage).toBe('pagos');
  });

  it('WAR shares fending armor with PLD (same pieces)', () => {
    const p = getJobProgress('WAR', baseInv);
    expect(p.armor.set).toBe('fending');
    expect(p.armor.pieces.head?.currentStage).toBe('pagos');
  });

  it('DRG gets maiming armor (empty in this fixture)', () => {
    const p = getJobProgress('DRG', baseInv);
    expect(p.armor.set).toBe('maiming');
    expect(p.armor.pieces).toEqual({});
  });
});
