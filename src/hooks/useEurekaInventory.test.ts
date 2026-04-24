import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEurekaInventory } from './useEurekaInventory';

const KEY_V5 = 'eureka-inventory-v5';
const KEY_V2 = 'eureka-inventory-v2';

describe('useEurekaInventory (v5)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty inventory on first mount', () => {
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.inventory.schemaVersion).toBe(5);
    expect(result.current.inventory.weapons).toEqual({});
  });

  it('migrates v2 → v5 on first read', () => {
    localStorage.setItem(KEY_V2, JSON.stringify({
      materials: { 21801: 100 },
      chains: { 'pld-galatyn': { stage: 'anemos' } },
    }));
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.inventory.schemaVersion).toBe(5);
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos');
    expect(localStorage.getItem(KEY_V2)).toBeNull();
    expect(localStorage.getItem(KEY_V5)).toBeTruthy();
  });

  it('setCurrent on weapon updates currentStage and clears target', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'weapon', chainId: 'pld-galatyn' }, 'anemos');
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos');
  });

  it('setTarget on weapon updates targetStage', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setTarget({ kind: 'weapon', chainId: 'pld-galatyn' }, 'pyros');
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.targetStage).toBe('pyros');
  });

  it('performUpgrade on weapon advances stage and deducts materials', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(21801, 100);
      result.current.setCurrent({ kind: 'weapon', chainId: 'pld-galatyn' }, 'antiquated');
      result.current.setTarget({ kind: 'weapon', chainId: 'pld-galatyn' }, 'anemos-base');
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let outcome: any = null;
    act(() => {
      outcome = result.current.performUpgrade({ kind: 'weapon', chainId: 'pld-galatyn' });
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos-base');
    expect(result.current.inventory.materials[21801]).toBe(0);
    expect(outcome?.hadEnough).toBe(true);
  });

  it('performUpgrade still works when materials insufficient', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'weapon', chainId: 'pld-galatyn' }, 'antiquated');
      result.current.setTarget({ kind: 'weapon', chainId: 'pld-galatyn' }, 'anemos-base');
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let outcome: any = null;
    act(() => {
      outcome = result.current.performUpgrade({ kind: 'weapon', chainId: 'pld-galatyn' });
    });
    expect(result.current.inventory.weapons['pld-galatyn']?.currentStage).toBe('anemos-base');
    expect(outcome?.hadEnough).toBe(false);
  });

  it('setCurrent on armor-anemos targets the job, not a role set', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'armor-anemos', job: 'PLD', slot: 'head' }, 'anemos');
    });
    expect(result.current.inventory.armor.anemos.PLD?.head?.currentStage).toBe('anemos');
    // Anemos armor is per-job — WAR should not be affected
    expect(result.current.inventory.armor.anemos.WAR).toBeUndefined();
  });

  it('setCurrent on armor-elemental targets the role set (shared)', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setCurrent({ kind: 'armor-elemental', set: 'fending', slot: 'head' }, 'elemental+1');
    });
    expect(result.current.inventory.armor.elemental.fending.head?.currentStage).toBe('elemental+1');
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
