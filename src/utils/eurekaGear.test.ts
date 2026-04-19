import { describe, it, expect } from 'vitest';
import { getNextStage, canUpgrade, deductMaterials, findCost } from './eurekaGear';
import { STAGE_UPGRADE_COSTS } from '../data/eureka-stage-costs';

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

describe('canUpgrade', () => {
  it('returns true when all materials present', () => {
    // antiquated → anemos-base needs PROTEAN_CRYSTAL (21801) × 100
    const inv = { 21801: 100 };
    expect(canUpgrade('antiquated', inv, STAGE_UPGRADE_COSTS)).toBe(true);
  });
  it('returns false when insufficient', () => {
    const inv = { 21801: 99 };
    expect(canUpgrade('antiquated', inv, STAGE_UPGRADE_COSTS)).toBe(false);
  });
  it('returns false at physeos (no next stage)', () => {
    expect(canUpgrade('physeos', {}, STAGE_UPGRADE_COSTS)).toBe(false);
  });
  it('requires ALL materials for multi-material upgrades', () => {
    // pagos → pagos+1 needs FROSTED_PROTEAN (23309) × 10 AND PAGOS_CRYSTAL (22976) × 500
    expect(canUpgrade('pagos', { 23309: 10, 22976: 499 }, STAGE_UPGRADE_COSTS)).toBe(false);
    expect(canUpgrade('pagos', { 23309: 10, 22976: 500 }, STAGE_UPGRADE_COSTS)).toBe(true);
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
