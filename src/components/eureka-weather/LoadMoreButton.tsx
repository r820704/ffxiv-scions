interface LoadMoreButtonProps {
  count: number;
  step: number;
  max: number;
  onLoadMore: (newCount: number) => void;
}

export default function LoadMoreButton({ count, step, max, onLoadMore }: LoadMoreButtonProps) {
  if (count >= max) return null;
  const next = Math.min(count + step, max);
  const increment = next - count;
  return (
    <button
      type="button"
      onClick={() => onLoadMore(next)}
      className="self-center mt-1 text-xs px-3 py-1 rounded border border-border/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      ↓ 載入更多 +{increment}
    </button>
  );
}
