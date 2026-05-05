export type StartChainDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function StartChainDialog({ isOpen, onConfirm, onCancel }: StartChainDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-green-600 rounded-lg p-5 max-w-sm">
        <h2 className="text-lg font-bold text-green-400 mb-3">標記為已開始</h2>
        <p className="text-sm text-gray-200 mb-4 leading-relaxed">
          起點裝備（antiquated）需透過 70 級職業任務取得，或從 Sundry Splendors 兌換。<br />
          確認你已持有，將此裝備鏈標記為已開始？
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-gray-600 text-gray-400 text-sm"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded bg-green-700 text-white text-sm hover:bg-green-600"
          >
            確認已持有，標記為已開始
          </button>
        </div>
      </div>
    </div>
  );
}
