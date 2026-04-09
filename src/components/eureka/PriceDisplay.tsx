interface PriceDisplayProps {
  price: number | null;
  worldName: string | null;
  loading?: boolean;
}

export default function PriceDisplay({ price, worldName, loading }: PriceDisplayProps) {
  if (loading) {
    return <span className="inline-block h-4 w-20 bg-muted animate-pulse rounded" />;
  }

  if (price == null) {
    return <span className="text-muted-foreground text-xs">價格未知</span>;
  }

  return (
    <span className="text-xs">
      <span className="text-amber-400 font-medium">{price.toLocaleString()} gil</span>
      {worldName && (
        <span className="text-muted-foreground ml-1">@ {worldName}</span>
      )}
    </span>
  );
}
