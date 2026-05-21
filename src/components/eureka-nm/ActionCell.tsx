import { Check, RotateCcw } from 'lucide-react';
import type { NmRowState } from '@/types/nm-tracker';

interface ActionCellProps {
  hasRecord: boolean;
  state: NmRowState;
  onPop: () => void;
  onClear: () => void;
  nmName: string;
}

export function ActionCell({ hasRecord, state, onPop, onClear, nmName }: ActionCellProps) {
  // Show 重置 only when an active record blocks recording a new pop —
  // i.e. cooldown still running. Once the row turns green the old record
  // is stale, so flip back to 出現 (which overwrites popAt on click).
  const showClear = hasRecord && state !== 'green';
  return (
    <div className="flex items-center justify-end md:justify-start">
      {showClear ? (
        <button
          type="button"
          aria-label={`重置 ${nmName} 記錄`}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" /> <span className="hidden md:inline">重置</span>
        </button>
      ) : (
        <button
          type="button"
          aria-label={`記錄 ${nmName} 出現`}
          onClick={(e) => {
            e.stopPropagation();
            onPop();
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary hover:bg-primary/20"
        >
          <Check className="h-3 w-3" /> <span className="hidden md:inline">出現</span>
        </button>
      )}
    </div>
  );
}
