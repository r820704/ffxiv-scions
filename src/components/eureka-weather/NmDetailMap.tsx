import { useState } from 'react';
import type { EurekaZone } from '@/data/weather-data';
import { mapCoordToPercent, EUREKA_ZONE_BOUNDS } from '@/utils/eureka-map-coords';

interface Pin {
  x: number;
  y: number;
  label: string;
  highlighted?: boolean;
}

interface NmDetailMapProps {
  zone: EurekaZone;
  pins: Pin[];
}

const ZONE_TO_KEY: Record<EurekaZone, string> = {
  'Eureka Anemos': 'anemos',
  'Eureka Pagos': 'pagos',
  'Eureka Pyros': 'pyros',
  'Eureka Hydatos': 'hydatos',
};

const ZONE_TO_TW: Record<EurekaZone, string> = {
  'Eureka Anemos': '優雷卡常風之地',
  'Eureka Pagos': '優雷卡恆冰之地',
  'Eureka Pyros': '優雷卡湧火之地',
  'Eureka Hydatos': '優雷卡豐水之地',
};

export default function NmDetailMap({ zone, pins }: NmDetailMapProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const key = ZONE_TO_KEY[zone];
  const tw = ZONE_TO_TW[zone];
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
        return (
          <div
            key={idx}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-md ${
              pin.highlighted ? 'animate-pulse ring-2 ring-amber-300' : ''
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
