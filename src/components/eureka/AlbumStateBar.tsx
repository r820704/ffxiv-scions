import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface AlbumStateBarProps {
  learnedCount: number;
  total: number;
  disabled: boolean;
  onLearnAll: () => void;
  onReset: () => void;
}

export default function AlbumStateBar({
  learnedCount,
  total,
  disabled,
  onLearnAll,
  onReset,
}: AlbumStateBarProps) {
  const pct = (learnedCount / total) * 100;
  return (
    <Tooltip label={disabled ? '切換到「圖鑑全開計算」模式才可編輯' : undefined}>
    <div
      className={cn(
        'flex items-center gap-2 w-full md:flex-1 md:min-w-0',
        disabled && 'opacity-50',
      )}
    >
      <div className="flex-1 min-w-0 bg-muted rounded h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-dark to-primary rounded transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {learnedCount} / {total}
      </span>
      <button
        onClick={onLearnAll}
        disabled={disabled}
        className="text-xs px-2 py-1 rounded bg-primary-dark/80 text-primary-foreground hover:bg-primary-dark transition-colors cursor-pointer whitespace-nowrap font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        全開
      </button>
      <button
        onClick={onReset}
        disabled={disabled}
        className="text-xs px-2 py-1 rounded bg-destructive/70 text-destructive-foreground hover:bg-destructive transition-colors cursor-pointer whitespace-nowrap font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        重置
      </button>
    </div>
    </Tooltip>
  );
}
