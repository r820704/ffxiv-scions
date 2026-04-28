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

export default function NmDetailMap({ zone, pins }: NmDetailMapProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const key = ZONE_MAP_FILE_KEY[zone];
  const tw = zoneNamesTw[zone] ?? zone;
  const bounds = EUREKA_ZONE_BOUNDS[zone];
  const src = `${import.meta.env.BASE_URL}data/eureka-maps/${key}.jpg`;

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

  return (
    <div className="relative aspect-square bg-muted/20 rounded-lg overflow-hidden">
      <img
        src={src}
        alt={tw}
        onError={() => setImgFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {pins.map((pin, idx) => {
        const pos = mapCoordToPercent({ x: pin.x, y: pin.y }, bounds);
        const isNm = pin.kind === 'nm';
        const bg = isNm ? 'bg-rose-600' : 'bg-amber-500';
        const ringHi = isNm ? 'ring-rose-300' : 'ring-amber-300';
        const size = isNm ? 'w-7 h-7' : 'w-6 h-6';
        return (
          <div
            key={idx}
            data-pin-kind={pin.kind ?? 'trigger'}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${size} rounded-full ${bg} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-md ${
              pin.highlighted ? `animate-pulse ring-2 ${ringHi}` : ''
            }`}
            style={{ left: pos.left, top: pos.top }}
          >
            {pin.label}
          </div>
        );
      })}
    </div>
  );
}
