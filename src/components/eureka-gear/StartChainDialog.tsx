export type StartChainDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function StartChainDialog({ isOpen, onConfirm, onCancel }: StartChainDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-5 max-w-sm">
        <h2 className="text-lg font-bold text-primary mb-3">標記為已開始</h2>
        <p className="text-sm text-foreground mb-4 leading-relaxed">
          起點裝備（antiquated）需透過 70 級職業任務取得，或從 Sundry Splendors 兌換。<br />
          確認你已持有，將此裝備鏈標記為已開始？
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-border text-muted-foreground text-sm hover:text-foreground hover:border-primary transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-500"
          >
            確認已持有，標記為已開始
          </button>
        </div>
      </div>
    </div>
  );
}
