import { cn } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/types/eureka';
import type { LogosCategory } from '@/types/eureka';

interface CategoryFilterProps {
  selected: LogosCategory | null;
  onSelect: (category: LogosCategory | null) => void;
}

const categories: (LogosCategory | null)[] = [
  null, 'wisdom', 'spirit', 'offensive', 'defensive', 'healing', 'utility', 'movement',
];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <button
          key={cat ?? 'all'}
          onClick={() => onSelect(cat)}
          className={cn(
            'px-3 py-1 text-xs rounded-md border transition-colors cursor-pointer',
            selected === cat
              ? 'bg-secondary border-primary text-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
          )}
        >
          {cat ? CATEGORY_LABELS[cat] : '全部'}
        </button>
      ))}
    </div>
  );
}
