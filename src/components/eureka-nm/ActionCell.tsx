import { Check, RotateCcw } from 'lucide-react';

interface ActionCellProps {
  hasRecord: boolean;
  onPop: () => void;
  onClear: () => void;
  nmName: string;
}

export function ActionCell({ hasRecord, onPop, onClear, nmName }: ActionCellProps) {
  return (
    <div className="flex items-center">
      {hasRecord ? (
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
