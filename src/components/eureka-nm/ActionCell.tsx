// STUB — Task 13 will replace with ✓出現 / ↺重置 / ✏自訂輸入 + dialog.

interface Props {
  onPop: () => void;
  onClear: () => void;
  onSetCustom: (popAt: number) => void;
  nmName: string;
}

export function ActionCell({ onPop, nmName }: Props) {
  return (
    <button
      type="button"
      aria-label={`記錄 ${nmName} 出現`}
      onClick={(e) => { e.stopPropagation(); onPop(); }}
      className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary hover:bg-primary/20"
    >
      ✓ 出現
    </button>
  );
}
