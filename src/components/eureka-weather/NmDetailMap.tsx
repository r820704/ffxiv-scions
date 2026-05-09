import { useState } from 'react';
import type { EurekaZone } from '@/data/weather-data';
import { zoneNamesTw } from '@/data/weather-data';
import { mapCoordToPercent, EUREKA_ZONE_BOUNDS, ZONE_MAP_FILE_KEY } from '@/utils/eureka-map-coords';

interface Pin {
  x: number;
  y: number;
  label: string;
  kind?: 'nm' | 'trigger';
  highlighted?: boolean;
}

interface NmDetailMapProps {
  zone: EurekaZone;
  pins: Pin[];
}

// % distance below which an NM pin is considered to overlap a trigger pin
// and gets nudged to a non-overlapping spot.
const NM_OFFSET_THRESHOLD = 5;
// % offset applied (upper-left) when overlap is detected. Picked to clear pin
// radii at typical desktop modal width while keeping the leader line short.
const NM_OFFSET_DELTA = 6;
// Clamp the displaced position so the pin never lands flush with the map edge.
const EDGE_CLAMP = 4;

export default function NmDetailMap({ zone, pins }: NmDetailMapProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const key = ZONE_MAP_FILE_KEY[zone];
  const tw = zoneNamesTw[zone] ?? zone;
  const bounds = EUREKA_ZONE_BOUNDS[zone];
  const src = `${import.meta.env.BASE_URL}data/eureka-maps/${key}.webp`;

  if (imgFailed) {
    return (
      <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
        地圖暫不可用
      </div>
    );
  }

  if (!bounds) {
    return (
      <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
        地圖暫不可用
      </div>
    );
  }

  // Resolve each pin to a numeric % position so we can detect overlap and
  // (if needed) draw a leader line from the displaced display position back
  // to the actual coord.
  const resolved = pins.map((pin) => {
    const raw = mapCoordToPercent({ x: pin.x, y: pin.y }, bounds);
    return {
      pin,
      actualX: parseFloat(raw.left),
      actualY: parseFloat(raw.top),
    };
  });
  const triggerPositions = resolved.filter((p) => p.pin.kind !== 'nm');
  const placed = resolved.map((p) => {
    if (p.pin.kind !== 'nm') return { ...p, displayX: p.actualX, displayY: p.actualY, offset: false };
    const overlaps = triggerPositions.some((t) => {
      const dx = t.actualX - p.actualX;
      const dy = t.actualY - p.actualY;
      return Math.sqrt(dx * dx + dy * dy) < NM_OFFSET_THRESHOLD;
    });
    if (!overlaps) return { ...p, displayX: p.actualX, displayY: p.actualY, offset: false };
    return {
      ...p,
      displayX: Math.max(EDGE_CLAMP, p.actualX - NM_OFFSET_DELTA),
      displayY: Math.max(EDGE_CLAMP, p.actualY - NM_OFFSET_DELTA),
      offset: true,
    };
  });

  return (
    <div className="relative aspect-square bg-muted/20 rounded-lg overflow-hidden">
      <img
        src={src}
        alt={tw}
        onError={() => setImgFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <marker
            id="nm-leader-arrow"
            markerWidth="3"
            markerHeight="3"
            refX="2.5"
            refY="1.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L3,1.5 L0,3 Z" fill="rgb(244 63 94)" />
          </marker>
        </defs>
        {placed
          .filter((p) => p.offset)
          .map((p, i) => (
            <line
              key={`leader-${i}`}
              x1={p.displayX}
              y1={p.displayY}
              x2={p.actualX}
              y2={p.actualY}
              stroke="rgb(244 63 94)"
              strokeWidth={1}
              strokeDasharray="2,1.2"
              strokeLinecap="round"
              markerEnd="url(#nm-leader-arrow)"
            />
          ))}
      </svg>
      {placed.map((p, idx) => {
        const isNm = p.pin.kind === 'nm';
        const bg = isNm ? 'bg-nm' : 'bg-trigger-mob';
        const ringHi = isNm ? 'ring-nm-foreground' : 'ring-trigger-mob-foreground';
        const size = isNm ? 'w-7 h-7' : 'w-6 h-6';
        return (
          <div
            key={idx}
            data-pin-kind={p.pin.kind ?? 'trigger'}
            data-pin-offset={p.offset ? 'true' : 'false'}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${size} rounded-full ${bg} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-md ${
              p.pin.highlighted ? `animate-pulse ring-2 ${ringHi}` : ''
            }`}
            style={{ left: `${p.displayX}%`, top: `${p.displayY}%` }}
          >
            {p.pin.label}
          </div>
        );
      })}
    </div>
  );
}
