import { ZONE_TC_NAME } from '../../types/eureka-gear';
import type { EurekaZone } from '../../types/eureka-gear';

export type ZoneGroupItem = {
  materialId: number;
  totalNeeded: number;
  shortage: number;
};

export type ZoneGroupProps = {
  zone: EurekaZone;
  items: ZoneGroupItem[];
  materialsMap: Record<number, { nameTC: string; icon: number }>;
};

const ZONE_EMOJI: Record<EurekaZone, string> = {
  anemos: '🌬',
  pagos: '❄️',
  pyros: '🔥',
  hydatos: '💧',
};

export function ZoneGroup({ zone, items, materialsMap }: ZoneGroupProps) {
  const totalShortage = items.reduce((s, i) => s + i.shortage, 0);
  const allDone = items.every((i) => i.shortage === 0);

  return (
    <section className="mb-3">
      <header className="font-bold text-sm mb-2">
        {ZONE_EMOJI[zone]} {ZONE_TC_NAME[zone]} — {allDone ? '已足夠' : `缺 ${totalShortage} 單位素材`}
      </header>
      {!allDone && (
        <ul className="bg-gray-900 rounded p-3 text-sm space-y-1">
          {items.map((it) => {
            const name = materialsMap[it.materialId]?.nameTC ?? `#${it.materialId}`;
            return (
              <li key={it.materialId} className="flex justify-between">
                <span>{name}</span>
                <span className={it.shortage > 0 ? 'text-red-400' : 'text-green-400'}>
                  缺 {it.shortage} / 總需 {it.totalNeeded}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
