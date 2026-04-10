import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLogogramPrices } from './universalis';

const mockMultiResponse = {
  itemIDs: [24007, 24008],
  items: {
    '24007': {
      itemID: 24007,
      listings: [
        { pricePerUnit: 500, quantity: 1, hq: false, worldName: 'Shinryu', worldID: 94 },
        { pricePerUnit: 600, quantity: 3, hq: false, worldName: 'Mandragora', worldID: 92 },
      ],
      lastUploadTime: 1700000000000,
    },
    '24008': {
      itemID: 24008,
      listings: [],
      lastUploadTime: 1700000000000,
    },
  },
  unresolvedItems: [],
};

describe('fetchLogogramPrices', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return cheapest price and world for each item', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockMultiResponse,
    } as Response);

    const result = await fetchLogogramPrices([24007, 24008]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      itemId: 24007,
      price: 500,
      worldName: 'Shinryu',
      lastUpdated: 1700000000000,
    });
    expect(result[1]).toEqual({
      itemId: 24008,
      price: null,
      worldName: null,
      lastUpdated: 1700000000000,
    });
  });

  it('should return empty prices on fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await fetchLogogramPrices([24007]);

    expect(result).toHaveLength(1);
    expect(result[0]?.price).toBeNull();
  });

  it('should return empty prices on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchLogogramPrices([24007]);

    expect(result).toHaveLength(1);
    expect(result[0]?.price).toBeNull();
  });

  it('should handle single-item flat response format', async () => {
    const singleResponse = {
      itemID: 24007,
      listings: [
        { pricePerUnit: 999, quantity: 65, hq: false, worldName: 'Ramuh', worldID: 60 },
      ],
      lastUploadTime: 1700000000000,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => singleResponse,
    } as Response);

    const result = await fetchLogogramPrices([24007]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      itemId: 24007,
      price: 999,
      worldName: 'Ramuh',
      lastUpdated: 1700000000000,
    });
  });
});
