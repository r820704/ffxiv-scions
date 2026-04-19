import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEurekaGearData } from './useEurekaGearData';

const GEAR_FIXTURE = [
  { id: 100, name: '測試裝備', iconId: 1, stage: 'anemos', slot: 'weapon', jobs: [], itemLevel: 370, source: { npcId: 1, npcName: 'NPC', zone: '', specialShopId: 1 }, cost: { materials: [] }, tags: [] },
];
const MATERIALS_FIXTURE = [
  { id: 200, name: '常風水晶', iconId: 2, category: 'crystal' },
];

describe('useEurekaGearData', () => {
  beforeEach(() => {
    const fetchMock = vi.fn((url: string) => {
      const body = url.includes('eureka-gear') ? GEAR_FIXTURE : MATERIALS_FIXTURE;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  it('starts with loading=true and empty arrays', () => {
    const { result } = renderHook(() => useEurekaGearData());
    expect(result.current.loading).toBe(true);
    expect(result.current.gear).toEqual([]);
    expect(result.current.materials).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('resolves gear + materials from fetch', async () => {
    const { result } = renderHook(() => useEurekaGearData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.gear).toEqual(GEAR_FIXTURE);
    expect(result.current.materials).toEqual(MATERIALS_FIXTURE);
  });

  it('surfaces error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 500 })),
    );
    const { result } = renderHook(() => useEurekaGearData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.gear).toEqual([]);
  });
});
