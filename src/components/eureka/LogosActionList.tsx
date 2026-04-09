import { useState, useMemo } from 'react';
import { eurekaData } from '@/data/eureka-data';
import type { LogosCategory, LogogramPrice } from '@/types/eureka';
import CategoryFilter from './CategoryFilter';
import LogosActionCard from './LogosActionCard';

interface LogosActionListProps {
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function LogosActionList({ prices, priceLoading }: LogosActionListProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LogosCategory | null>(null);

  const filtered = useMemo(() => {
    return eurekaData.logosActions.filter((action) => {
      if (category && action.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !action.nameTw.toLowerCase().includes(q) &&
          !action.descriptionTw.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [search, category]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="搜尋技能名稱或說明..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <CategoryFilter selected={category} onSelect={setCategory} />
      <div className="text-xs text-muted-foreground">
        顯示 {filtered.length} / {eurekaData.logosActions.length} 個技能
      </div>
      <div className="space-y-3">
        {filtered.map((action) => (
          <LogosActionCard
            key={action.id}
            action={action}
            prices={prices}
            priceLoading={priceLoading}
          />
        ))}
      </div>
    </div>
  );
}
