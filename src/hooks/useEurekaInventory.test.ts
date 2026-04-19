import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useEurekaInventory } from './useEurekaInventory';
import { STAGE_UPGRADE_COSTS } from '../data/eureka-stage-costs';

afterEach(() => cleanup());

describe('useEurekaInventory', () => {
  beforeEach(() => localStorage.clear());

  it('starts with empty materials and progress', () => {
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.materials).toEqual({});
    expect(result.current.chainProgress).toEqual({});
  });

  it('setMaterial stores the value', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => result.current.setMaterial(21801, 50));
    expect(result.current.materials[21801]).toBe(50);
  });

  it('setChainStage advances a chain', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => result.current.setChainStage('drg-ryunohige', 'anemos'));
    expect(result.current.chainProgress['drg-ryunohige']).toBe('anemos');
  });

  it('upgradeChain advances stage and deducts materials', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(21801, 100);
      result.current.setChainStage('drg-ryunohige', 'antiquated');
    });
    act(() => result.current.upgradeChain('drg-ryunohige', STAGE_UPGRADE_COSTS));
    expect(result.current.chainProgress['drg-ryunohige']).toBe('anemos-base');
    expect(result.current.materials[21801]).toBe(0);
  });

  it('upgradeChain refuses when materials insufficient', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(21801, 50);
      result.current.setChainStage('drg-ryunohige', 'antiquated');
    });
    act(() => result.current.upgradeChain('drg-ryunohige', STAGE_UPGRADE_COSTS));
    expect(result.current.chainProgress['drg-ryunohige']).toBe('antiquated');
    expect(result.current.materials[21801]).toBe(50);
  });

  it('clearAll wipes state', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(21801, 100);
      result.current.setChainStage('pld-galatyn', 'pagos');
    });
    act(() => result.current.clearAll());
    expect(result.current.materials).toEqual({});
    expect(result.current.chainProgress).toEqual({});
  });
});
