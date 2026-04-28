import type { EurekaZone } from '@/data/weather-data';
import { ZONE_MAP_FILE_KEY } from '@/utils/eureka-map-coords';

const preloaded = new Set<string>();

// Trigger the browser to fetch the zone's map image into cache. Idempotent:
// repeat calls for the same zone are a no-op.
export function preloadEurekaMap(zone: EurekaZone | undefined): void {
  if (!zone || typeof window === 'undefined') return;
  const key = ZONE_MAP_FILE_KEY[zone];
  if (!key || preloaded.has(key)) return;
  preloaded.add(key);
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}data/eureka-maps/${key}.webp`;
}
