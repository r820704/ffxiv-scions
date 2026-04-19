import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import { useEurekaWeaponsData } from './useEurekaWeaponsData';

afterEach(() => cleanup());

describe('useEurekaWeaponsData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      const body = url.includes('weapons')
        ? [{ id: 1, chainId: 'drg-ryunohige', job: 'DRG', isShield: false, stage: 'anemos', itemLevel: 355, tcName: '龍鬚·常風', enName: 'Ryunohige Anemos', iconId: 0 }]
        : [{ id: 21801, tcName: '異質結晶', enName: 'Protean Crystal', iconId: 0, category: 'crystal' }];
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    }));
  });

  it('loads weapons and materials', async () => {
    const { result } = renderHook(() => useEurekaWeaponsData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weapons).toHaveLength(1);
    expect(result.current.materials).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });
});
