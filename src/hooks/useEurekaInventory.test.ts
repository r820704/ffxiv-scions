import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEurekaInventory } from './useEurekaInventory';

const KEY_V2 = 'eureka-inventory-v2';

describe('useEurekaInventory (v3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty inventory on first mount', () => {
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.inventory.schemaVersion).toBe(4);
    expect(result.current.inventory.weapons).toEqual({});
  });

  it('migrates v2 → v4 on first read', () => {
    localStorage.setItem(KEY_V2, JSON.stringify({
      materials: { 21801: 100 },
      chains: { 'pld-galatyn': { stage: 'anemos' } },
    }));
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.inventory.schemaVersion).toBe(4);
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos');
    expect(result.current.inventory.materials[21801]).toBe(100);
    expect(localStorage.getItem(KEY_V2)).toBeNull();
    expect(localStorage.getItem('eureka-inventory-v4')).toBeTruthy();
  });

  it('setCurrent updates weapon currentStage and clears target', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'weapon', chainId: 'pld-galatyn' }, 'anemos');
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos');
    expect(result.current.inventory.weapons['pld-galatyn']?.targetStage).toBeUndefined();
  });

  it('setTarget updates weapon targetStage', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setTarget({ kind: 'weapon', chainId: 'pld-galatyn' }, 'pyros');
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.targetStage).toBe('pyros');
  });

  it('performUpgrade advances current, clears target, deducts materials', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(21801, 100);
      result.current.setCurrent({ kind: 'weapon', chainId: 'pld-galatyn' }, 'antiquated');
      result.current.setTarget({ kind: 'weapon', chainId: 'pld-galatyn' }, 'anemos-base');
    });
    let outcome: ReturnType<typeof result.current.performUpgrade> | undefined;
    act(() => {
      outcome = result.current.performUpgrade({ kind: 'weapon', chainId: 'pld-galatyn' });
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos-base');
    expect(result.current.inventory.weapons['pld-galatyn']?.targetStage).toBeUndefined();
    expect(result.current.inventory.materials[21801]).toBe(0);
    expect(outcome?.hadEnough).toBe(true);
  });

  it('performUpgrade still works when materials insufficient (no block)', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'weapon', chainId: 'pld-galatyn' }, 'antiquated');
      result.current.setTarget({ kind: 'weapon', chainId: 'pld-galatyn' }, 'anemos-base');
    });
    let outcome: ReturnType<typeof result.current.performUpgrade> | undefined;
    act(() => {
      outcome = result.current.performUpgrade({ kind: 'weapon', chainId: 'pld-galatyn' });
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos-base');
    expect(outcome?.hadEnough).toBe(false);
  });

  it('setCurrent on armor slot with anemos track targets armor set, not job', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'armor', set: 'fending', slot: 'head', track: 'anemos' }, 'anemos');
    });
    expect(result.current.inventory.armor.fending.head?.anemos?.currentStage).toBe('anemos');
  });

  it('setCurrent on elemental track is independent from anemos track', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'armor', set: 'fending', slot: 'body', track: 'anemos' }, 'anemos');
      result.current.setCurrent({ kind: 'armor', set: 'fending', slot: 'body', track: 'elemental' }, 'elemental+1');
    });
    expect(result.current.inventory.armor.fending.body?.anemos?.currentStage).toBe('anemos');
    expect(result.current.inventory.armor.fending.body?.elemental?.currentStage).toBe('elemental+1');
  });

  it('clearAll resets inventory to empty', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(21801, 50);
      result.current.clearAll();
    });
    expect(result.current.inventory.materials).toEqual({});
  });
});
