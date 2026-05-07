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

const MATERIAL_ICON_MODULES = import.meta.glob('../../assets/material-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const MATERIAL_ICONS: Record<number, string> = Object.fromEntries(
  Object.entries(MATERIAL_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/(\d+)\.png$/);
    return [match ? Number(match[1]) : 0, url];
  }),
);

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
            const meta = materialsMap[it.materialId];
            const name = meta?.nameTC ?? `#${it.materialId}`;
            const icon = MATERIAL_ICONS[meta?.icon ?? 0];
            return (
              <li key={it.materialId} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  {icon && <img src={icon} alt="" aria-hidden="true" className="w-5 h-5 shrink-0" loading="lazy" />}
                  <span className="truncate">{name}</span>
                </span>
                <span className={`shrink-0 ${it.shortage > 0 ? 'text-red-400' : 'text-green-400'}`}>
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
