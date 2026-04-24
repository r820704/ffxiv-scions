import { describe, it, expect } from 'vitest';
import { migrateInventory } from './eureka-gear-migrate';

describe('migrateInventory', () => {
  it('returns empty v4 when input is null', () => {
    const result = migrateInventory(null);
    expect(result.schemaVersion).toBe(4);
    expect(result.weapons).toEqual({});
    expect(result.materials).toEqual({});
  });

  it('migrates v2 chain.stage → v4 weapons[chainId].currentStage', () => {
    const v2 = JSON.stringify({
      materials: { 21801: 50 },
      chains: {
        'pld-galatyn': { stage: 'anemos' },
        'war-farsha': { stage: 'pyros' },
      },
    });
    const result = migrateInventory(v2);
    expect(result.schemaVersion).toBe(4);
    expect(result.weapons['pld-galatyn']?.currentStage).toBe('anemos');
    expect(result.weapons['war-farsha']?.currentStage).toBe('pyros');
    expect(result.weapons['pld-galatyn']?.targetStage).toBeUndefined();
    expect(result.materials[21801]).toBe(50);
  });

  it('migrates v3 armor SlotProgress → v4 anemos-track SlotProgress', () => {
    const v3 = JSON.stringify({
      schemaVersion: 3,
      weapons: { 'pld-galatyn': { currentStage: 'eureka' } },
      armor: { fending: { head: { currentStage: 'pagos' } } },
      materials: { 21801: 100 },
    });
    const result = migrateInventory(v3);
    expect(result.schemaVersion).toBe(4);
    expect(result.weapons['pld-galatyn']?.currentStage).toBe('eureka');
    expect(result.armor.fending.head?.anemos?.currentStage).toBe('pagos');
    expect(result.armor.fending.head?.elemental).toBeUndefined();
  });

  it('returns v4 data as-is when schemaVersion=4', () => {
    const v4 = JSON.stringify({
      schemaVersion: 4,
      weapons: { 'pld-galatyn': { currentStage: 'eureka' } },
      armor: {
        fending: {
          head: {
            anemos: { currentStage: 'anemos' },
            elemental: { currentStage: 'elemental+1' },
          },
        },
      },
      materials: { 21801: 100 },
    });
    const result = migrateInventory(v4);
    expect(result.weapons['pld-galatyn']?.currentStage).toBe('eureka');
    expect(result.armor.fending.head?.anemos?.currentStage).toBe('anemos');
    expect(result.armor.fending.head?.elemental?.currentStage).toBe('elemental+1');
  });

  it('returns empty v4 when JSON is corrupted', () => {
    const result = migrateInventory('not valid json {{{{');
    expect(result.schemaVersion).toBe(4);
    expect(result.weapons).toEqual({});
  });

  it('fills all 7 armor sets with empty objects when missing', () => {
    const result = migrateInventory(null);
    expect(Object.keys(result.armor).sort()).toEqual(
      ['aiming', 'casting', 'fending', 'healing', 'maiming', 'scouting', 'striking'],
    );
  });
});
