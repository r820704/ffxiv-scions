import type { EurekaMaterial } from '@/types/eureka-gear';

interface MaterialTileProps {
  material: EurekaMaterial;
  count: number;
  onChange: (next: number) => void;
}

export default function MaterialTile({ material, count, onChange }: MaterialTileProps) {
  return (
    <div className="flex flex-col items-center gap-1 w-20 rounded border border-border/50 p-2 bg-card">
      <span className="text-xs text-foreground text-center truncate w-full">
        {material.name}
      </span>
      <input
        type="number"
        min={0}
        value={count}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full text-center text-sm bg-transparent border-b border-border/50 outline-none"
      />
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="-1"
          onClick={() => onChange(Math.max(0, count - 1))}
          className="px-2 rounded bg-muted text-xs hover:bg-muted/80"
        >
          −
        </button>
        <button
          type="button"
          aria-label="+1"
          onClick={() => onChange(count + 1)}
          className="px-2 rounded bg-muted text-xs hover:bg-muted/80"
        >
          +
        </button>
      </div>
    </div>
  );
}
