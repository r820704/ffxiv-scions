import { describe, it, expect } from 'vitest';
import { migrateInventory } from './eureka-gear-migrate';

describe('migrateInventory', () => {
  it('returns empty v5 when input is null', () => {
    const result = migrateInventory(null);
    expect(result.schemaVersion).toBe(5);
    expect(result.weapons).toEqual({});
    expect(result.materials).toEqual({});
  });

  it('migrates v2 chain.stage → v5 weapons[chainId].currentStage', () => {
    const v2 = JSON.stringify({
      materials: { 21801: 50 },
      chains: {
        'pld-galatyn': { stage: 'anemos' },
      },
    });
    const result = migrateInventory(v2);
    expect(result.schemaVersion).toBe(5);
    expect(result.weapons['pld-galatyn']?.currentStage).toBe('anemos');
    expect(result.materials[21801]).toBe(50);
  });

  it('v3 → v5 preserves weapons and drops armor (single-track cannot be safely remapped)', () => {
    const v3 = JSON.stringify({
      schemaVersion: 3,
      weapons: { 'pld-galatyn': { currentStage: 'eureka' } },
      armor: { fending: { head: { currentStage: 'pagos' } } },
      materials: { 21801: 100 },
    });
    const result = migrateInventory(v3);
    expect(result.schemaVersion).toBe(5);
    expect(result.weapons['pld-galatyn']?.currentStage).toBe('eureka');
    expect(result.armor.anemos).toEqual({});
    expect(result.armor.elemental.fending).toEqual({});
  });

  it('v4 → v5 keeps elemental armor, drops anemos', () => {
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
    expect(result.armor.elemental.fending.head?.currentStage).toBe('elemental+1');
    expect(result.armor.anemos).toEqual({});
  });

  it('returns v5 data as-is when schemaVersion=5', () => {
    const v5 = JSON.stringify({
      schemaVersion: 5,
      weapons: { 'pld-galatyn': { currentStage: 'eureka' } },
      armor: {
        anemos: { PLD: { head: { currentStage: 'anemos' } } },
        elemental: { fending: { head: { currentStage: 'elemental+1' } } },
      },
      materials: { 21801: 100 },
    });
    const result = migrateInventory(v5);
    expect(result.armor.anemos.PLD?.head?.currentStage).toBe('anemos');
    expect(result.armor.elemental.fending.head?.currentStage).toBe('elemental+1');
  });

  it('returns empty v5 when JSON is corrupted', () => {
    const result = migrateInventory('not valid json {{{{');
    expect(result.schemaVersion).toBe(5);
    expect(result.weapons).toEqual({});
  });

  it('fills all 7 armor sets with empty objects in elemental branch', () => {
    const result = migrateInventory(null);
    expect(Object.keys(result.armor.elemental).sort()).toEqual(
      ['aiming', 'casting', 'fending', 'healing', 'maiming', 'scouting', 'striking'],
    );
  });
});
