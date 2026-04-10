import type { LogogramPrice } from '@/types/eureka';

const UNIVERSALIS_BASE = 'https://universalis.app/api/v2';
const DATA_CENTER = '陸行鳥';

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

export async function fetchLogogramPrices(itemIds: number[]): Promise<LogogramPrice[]> {
  const emptyResults: LogogramPrice[] = itemIds.map((id) => ({
    itemId: id,
    price: null,
    worldName: null,
    lastUpdated: null,
  }));

  try {
    const ids = itemIds.join(',');
    const url = `${UNIVERSALIS_BASE}/${DATA_CENTER}/${ids}?listings=5&entries=0`;
    const response = await fetch(url);

    if (!response.ok) {
      return emptyResults;
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
        };
      }

      const cheapest = item.listings[0]!;
      return {
        itemId,
        price: cheapest.pricePerUnit,
        worldName: cheapest.worldName,
        lastUpdated: item.lastUploadTime,
      };
    });
  } catch {
    return emptyResults;
  }
}
