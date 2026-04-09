import { eurekaData } from '@/data/eureka-data';
import type { LogogramPrice, LogosAction } from '@/types/eureka';
import { findActionsForMnemes } from '@/utils/eureka-helpers';
import LogosActionCard from './LogosActionCard';
import { cn } from '@/lib/utils';

interface MnemeSelectorProps {
  selectedMnemes: Set<string>;
  onToggleMneme: (mnemeId: string) => void;
  prices: LogogramPrice[];
  priceLoading: boolean;
}

export default function MnemeSelector({
  selectedMnemes,
  onToggleMneme,
  prices,
  priceLoading,
}: MnemeSelectorProps) {
  const matchedActions: LogosAction[] = findActionsForMnemes(selectedMnemes);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {eurekaData.logograms.map((logogram) => {
          const mnemes = eurekaData.mnemes.filter(
            (m) => m.sourceLogogramId === logogram.id
          );
          return (
            <div key={logogram.id} className="rounded-lg border border-border bg-card p-3">
              <h3 className="text-xs font-medium text-primary mb-2">{logogram.nameTw}</h3>
              <div className="flex flex-wrap gap-2">
                {mnemes.map((mneme) => (
                  <label
                    key={mneme.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors',
                      selectedMnemes.has(mneme.id)
                        ? 'bg-secondary border-primary text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMnemes.has(mneme.id)}
                      onChange={() => onToggleMneme(mneme.id)}
                      className="sr-only"
                    />
                    {mneme.nameTw}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          可合成的技能（{matchedActions.length}）
        </h2>
        {matchedActions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            請勾選擁有的記憶來查看可合成的技能
          </p>
        ) : (
          <div className="space-y-3">
            {matchedActions.map((action) => (
              <LogosActionCard
                key={action.id}
                action={action}
                prices={prices}
                priceLoading={priceLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
