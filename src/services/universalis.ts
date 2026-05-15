import type { LogogramPrice } from '@/types/eureka';

const UNIVERSALIS_BASE = 'https://universalis.app/api/v2';
const DATA_CENTER = '陸行鳥';
const TIMEOUT_MS = 15_000;

interface UniversalisListing {
  pricePerUnit: number;
  quantity: number;
  hq: boolean;
  worldName: string;
  worldID: number;
}

interface UniversalisItem {
  itemID: number;
  listings: UniversalisListing[];
  lastUploadTime: number;
}

interface UniversalisMultiResponse {
  items: Record<string, UniversalisItem>;
}

interface UniversalisSingleResponse extends UniversalisItem {}

/**
 * Throws on network error, request timeout, or non-OK HTTP response so the
 * caller can show a retry affordance. A successful response with empty
 * `listings` per item is NOT an error — those items resolve to `price: null`
 * inside the returned array.
 */
export async function fetchLogogramPrices(itemIds: number[]): Promise<LogogramPrice[]> {
  const ids = itemIds.join(',');
  const url = `${UNIVERSALIS_BASE}/${DATA_CENTER}/${ids}?listings=30&entries=0`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Universalis HTTP ${response.status}`);
  }

  const raw = await response.json();

  // Single-item response is flat; multi-item wraps in { items: { "id": ... } }
  const itemMap: Record<string, UniversalisItem> =
    itemIds.length === 1 ? { [String(itemIds[0])]: raw as UniversalisSingleResponse } : (raw as UniversalisMultiResponse).items ?? {};

  return itemIds.map((itemId) => {
    const item = itemMap[String(itemId)];
    if (!item || !item.listings || item.listings.length === 0) {
      return {
        itemId,
        price: null,
        worldName: null,
        lastUpdated: item?.lastUploadTime ?? null,
        listings: [],
      };
    }

    const cheapest = item.listings[0]!;
    return {
      itemId,
      price: cheapest.pricePerUnit,
      worldName: cheapest.worldName,
      lastUpdated: item.lastUploadTime,
      listings: item.listings.map((l) => ({
        pricePerUnit: l.pricePerUnit,
        quantity: l.quantity,
        worldName: l.worldName,
      })),
    };
  });
}
