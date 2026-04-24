import type { EurekaMaterial } from '@/types/eureka-gear';

interface MaterialTileProps {
  material: EurekaMaterial;
  count: number;
  onChange: (next: number) => void;
}

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

export default function MaterialTile({ material, count, onChange }: MaterialTileProps) {
  const iconSrc = MATERIAL_ICONS[material.iconId];
  return (
    <div
      className="flex flex-col items-center gap-0.5 w-full rounded border border-border/50 p-1 bg-card"
      title={material.tcName}
    >
      {iconSrc && (
        <img src={iconSrc} alt={material.tcName} className="w-7 h-7" loading="lazy" />
      )}
      <span className="text-[10px] text-foreground text-center truncate w-full leading-tight">
        {material.tcName}
      </span>
      <input
        type="number"
        min={0}
        value={count}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full text-center text-xs bg-transparent border-b border-border/50 outline-none"
      />
      <div className="flex gap-0.5 w-full">
        <button
          type="button"
          aria-label="-1"
          onClick={() => onChange(Math.max(0, count - 1))}
          className="flex-1 rounded bg-muted text-[10px] hover:bg-muted/80 leading-tight"
        >
          −
        </button>
        <button
          type="button"
          aria-label="+1"
          onClick={() => onChange(count + 1)}
          className="flex-1 rounded bg-muted text-[10px] hover:bg-muted/80 leading-tight"
        >
          +
        </button>
      </div>
    </div>
  );
}
