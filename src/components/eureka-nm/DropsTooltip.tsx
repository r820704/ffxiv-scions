import { Package } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { getNotableDrops } from '@/data/eureka-nm-drops';

interface Props { nmId: string; }

export function DropsTooltip({ nmId }: Props) {
  const drops = getNotableDrops(nmId);
  if (drops.length === 0) return null;

  const label = (
    <ul className="space-y-0.5 list-none m-0 p-0">
      {drops.map((d, i) => (
        <li key={i}>{d.nameTw}</li>
      ))}
    </ul>
  );

  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={`${nmId} drops`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center text-muted-foreground/60 hover:text-foreground"
      >
        <Package className="h-3 w-3" />
      </button>
    </Tooltip>
  );
}
