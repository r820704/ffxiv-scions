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
        'p-0.5 md:p-1 transition-colors ' +
        (isPinned
          ? 'text-primary'
          : 'text-muted-foreground/40 hover:text-muted-foreground')
      }
    >
      <Star className={'h-3.5 w-3.5 md:h-4 md:w-4 ' + (isPinned ? 'fill-current' : '')} />
    </button>
  );
}
