export interface ZoneBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface PixelPercent {
  left: string;
  top: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function mapCoordToPercent(
  coord: { x: number; y: number },
  bounds: ZoneBounds,
): PixelPercent {
  const xRange = bounds.xMax - bounds.xMin;
  const yRange = bounds.yMax - bounds.yMin;
  const xClamped = clamp(coord.x, bounds.xMin, bounds.xMax);
  const yClamped = clamp(coord.y, bounds.yMin, bounds.yMax);
  const xPct = ((xClamped - bounds.xMin) / xRange) * 100;
  const yPct = ((yClamped - bounds.yMin) / yRange) * 100;
  return {
    left: `${xPct}%`,
    top: `${yPct}%`,
  };
}

// 4 個 Eureka zone 的座標邊界
export const EUREKA_ZONE_BOUNDS: Record<string, ZoneBounds> = {
  'Eureka Anemos': { xMin: 1, xMax: 42, yMin: 1, yMax: 42 },
  'Eureka Pagos': { xMin: 1, xMax: 42, yMin: 1, yMax: 42 },
  'Eureka Pyros': { xMin: 1, xMax: 42, yMin: 1, yMax: 42 },
  'Eureka Hydatos': { xMin: 1, xMax: 42, yMin: 1, yMax: 42 },
};
