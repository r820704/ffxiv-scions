import { Star } from 'lucide-react';

interface PinStarProps {
  isPinned: boolean;
  onToggle: () => void;
  nmName: string;
}

export function PinStar({ isPinned, onToggle, nmName }: PinStarProps) {
  return (
    <button
      type="button"
      aria-pressed={isPinned}
      aria-label={isPinned ? `Unpin ${nmName}` : `Pin ${nmName}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={
        'p-1 transition-colors ' +
        (isPinned
          ? 'text-primary'
          : 'text-muted-foreground/40 hover:text-muted-foreground')
      }
    >
      <Star className={'h-4 w-4 ' + (isPinned ? 'fill-current' : '')} />
    </button>
  );
}
