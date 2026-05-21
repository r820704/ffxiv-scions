import { Tooltip } from '@/components/ui/Tooltip';
import { getNotableDrops } from '@/data/eureka-nm-drops';

interface Props { nmId: string; }

function ChestIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10 C 3 7, 5 5, 12 5 C 19 5, 21 7, 21 10 V 11 H 3 Z" />
      <rect x="3" y="11" width="18" height="9" rx="1" />
      <rect x="10.5" y="9" width="3" height="4" rx="0.5" />
      <circle cx="12" cy="11.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function DropsTooltip({ nmId }: Props) {
  const drops = getNotableDrops(nmId);
  if (drops.length === 0) return null;

  const label = (
    <ul className="space-y-0.5 list-none m-0 p-0">
      {drops.map((d, i) => (
        <li key={i}>
          {d.nameTw}
          {d.labelTw && `（${d.labelTw}）`}
        </li>
      ))}
    </ul>
  );

  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={`${nmId} drops`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center text-glow/80 hover:text-glow"
      >
        <ChestIcon className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  );
}
