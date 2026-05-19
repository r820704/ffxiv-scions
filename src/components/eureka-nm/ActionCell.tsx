import { useState } from 'react';
import { Check, RotateCcw, Pencil } from 'lucide-react';
import { CustomTimeDialog } from './CustomTimeDialog';

interface ActionCellProps {
  onPop: () => void;
  onClear: () => void;
  onSetCustom: (popAt: number) => void;
  nmName: string;
}

export function ActionCell({ onPop, onClear, onSetCustom, nmName }: ActionCellProps) {
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`記錄 ${nmName} 出現`}
        onClick={(e) => { e.stopPropagation(); onPop(); }}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary hover:bg-primary/20"
      >
        <Check className="h-3 w-3" /> <span className="hidden md:inline">出現</span>
      </button>
      <button
        type="button"
        aria-label={`重置 ${nmName} 記錄`}
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        className="hidden md:inline-flex items-center rounded p-0.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="h-3 w-3" />
      </button>
      <button
        type="button"
        aria-label={`自訂 ${nmName} 出現時間`}
        onClick={(e) => { e.stopPropagation(); setCustomOpen(true); }}
        className="hidden md:inline-flex items-center rounded p-0.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <CustomTimeDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        nmName={nmName}
        onConfirm={(t) => {
          onSetCustom(t);
          setCustomOpen(false);
        }}
      />
    </div>
  );
}
