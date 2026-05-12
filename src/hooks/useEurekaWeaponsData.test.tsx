import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useEurekaWeaponsData } from './useEurekaWeaponsData';

afterEach(() => cleanup());

describe('useEurekaWeaponsData', () => {
  it('returns bundled weapons and materials data synchronously', () => {
    const { result } = renderHook(() => useEurekaWeaponsData());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.weapons.length).toBeGreaterThan(0);
    expect(result.current.materials.length).toBeGreaterThan(0);
  });
});
