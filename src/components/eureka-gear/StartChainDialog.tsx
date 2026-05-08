import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type StartChainDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function StartChainDialog({ isOpen, onConfirm, onCancel }: StartChainDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">標記為已開始</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground leading-relaxed">
          起點裝備（antiquated）需透過 70 級職業任務取得，或從 Sundry Splendors 兌換。<br />
          確認你已持有，將此裝備鏈標記為已開始？
        </p>
        <DialogFooter>
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
            className="px-3 py-1.5 rounded bg-success text-success-foreground text-sm hover:bg-success/90"
          >
            確認已持有，標記為已開始
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
