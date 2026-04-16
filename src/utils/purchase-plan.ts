import type { LogogramListing } from '@/types/eureka';

export interface PurchasePlan {
  entries: { worldName: string; quantity: number; pricePerUnit: number }[];
  totalCost: number;
  fulfilled: boolean;
}

export function buildPurchasePlan(
  listings: LogogramListing[],
  need: number,
): PurchasePlan {
  const entries: PurchasePlan['entries'] = [];
  let remaining = need;
  let totalCost = 0;

  for (const listing of listings) {
    if (remaining <= 0) break;
    const take = Math.min(listing.quantity, remaining);
    entries.push({
      worldName: listing.worldName,
      quantity: take,
      pricePerUnit: listing.pricePerUnit,
    });
    totalCost += take * listing.pricePerUnit;
    remaining -= take;
  }

  return { entries, totalCost, fulfilled: remaining <= 0 };
}
