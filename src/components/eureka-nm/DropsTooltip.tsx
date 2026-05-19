// STUB — Task 15 will replace with real Tooltip showing drop list.
import { Package } from 'lucide-react';

interface Props { nmId: string; }

export function DropsTooltip({ nmId }: Props) {
  return (
    <button
      type="button"
      aria-label={`${nmId} drops`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center text-muted-foreground/60 hover:text-foreground"
    >
      <Package className="h-3 w-3" />
    </button>
  );
}
