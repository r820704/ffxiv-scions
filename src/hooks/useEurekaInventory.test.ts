import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEurekaInventory } from './useEurekaInventory';

const KEY = 'eureka-gear-inventory-v1';

describe('useEurekaInventory', () => {
  beforeEach(() => localStorage.clear());

  it('starts with empty state', () => {
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.materials).toEqual({});
    expect(result.current.ownedGear).toEqual({});
  });

  it('sets and reads material count', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => result.current.setMaterial(100, 5));
    expect(result.current.materials[100]).toBe(5);
  });

  it('clamps negative material counts to zero', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => result.current.setMaterial(100, -3));
    expect(result.current.materials[100]).toBe(0);
  });

  it('adjusts material by delta', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => result.current.setMaterial(100, 5));
    act(() => result.current.adjustMaterial(100, 2));
    expect(result.current.materials[100]).toBe(7);
    act(() => result.current.adjustMaterial(100, -10));
    expect(result.current.materials[100]).toBe(0);
  });

  it('toggles owned gear — true adds, false deletes the key', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => result.current.setOwned(42, true));
    expect(result.current.ownedGear[42]).toBe(true);
    act(() => result.current.setOwned(42, false));
    expect(42 in result.current.ownedGear).toBe(false);
  });

  it('persists to localStorage under versioned key', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(100, 5);
      result.current.setOwned(42, true);
    });
    const raw = localStorage.getItem(KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.materials).toEqual({ 100: 5 });
    expect(parsed.ownedGear).toEqual({ 42: true });
    expect(typeof parsed.updatedAt).toBe('string');
  });

  it('loads existing state from localStorage', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ materials: { 7: 3 }, ownedGear: { 9: true }, updatedAt: 'x' }),
    );
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.materials[7]).toBe(3);
    expect(result.current.ownedGear[9]).toBe(true);
  });

  it('falls back to empty on malformed storage', () => {
    localStorage.setItem(KEY, 'not-json');
    const { result } = renderHook(() => useEurekaInventory());
    expect(result.current.materials).toEqual({});
    expect(result.current.ownedGear).toEqual({});
  });

  it('clearAll wipes materials and ownedGear', () => {
    const { result } = renderHook(() => useEurekaInventory());
    act(() => {
      result.current.setMaterial(100, 5);
      result.current.setOwned(42, true);
    });
    act(() => result.current.clearAll());
    expect(result.current.materials).toEqual({});
    expect(result.current.ownedGear).toEqual({});
  });
});
