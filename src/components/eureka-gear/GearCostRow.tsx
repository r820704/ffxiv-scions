interface GearCostRowProps {
  materialName: string;
  need: number;
  owned: number;
}

export default function GearCostRow({ materialName, need, owned }: GearCostRowProps) {
  const ok = owned >= need;
  return (
    <div
      data-sufficient={ok ? 'true' : 'false'}
      className={`flex items-center gap-2 text-xs ${ok ? 'text-foreground' : 'text-red-400'}`}
    >
      <span className="min-w-[80px]">{materialName}</span>
      <span>× {need}</span>
      <span className="text-muted-foreground">持有 {owned}</span>
      <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{ok ? '✓' : '✗'}</span>
    </div>
  );
}
