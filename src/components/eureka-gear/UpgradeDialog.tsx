import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { EurekaStage } from '../../types/eureka-gear';

export type UpgradeDialogProps = {
  isOpen: boolean;
  direction: 'up' | 'down';
  targetStage: EurekaStage;
  sharedJobs: string[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function UpgradeDialog({
  isOpen,
  direction,
  targetStage,
  sharedJobs,
  onConfirm,
  onCancel,
}: UpgradeDialogProps) {
  const isShared = sharedJobs.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">
            📍 設為目前階段：{targetStage}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {direction === 'down' ? `降回 ${targetStage}，會捨棄之後的進度` : `設為 ${targetStage}`}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-foreground leading-relaxed">
          {direction === 'down' ? (
            <p className="text-destructive">這會捨棄 {targetStage} 之後的進度。確定嗎？</p>
          ) : (
            <p>將此部位設為 {targetStage}。</p>
          )}
          {isShared && (
            <>
              <p className="mt-3">此更動會同步反映到：</p>
              <ul className="list-disc list-inside mt-1">
                {sharedJobs.map((job) => (
                  <li key={job} className="inline-block mr-2">
                    <span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs">
                      {job}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-1">（這些職業共用防具）</p>
            </>
          )}
        </div>
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
            className={`px-3 py-1.5 rounded font-bold text-sm ${
              direction === 'down'
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-success text-success-foreground hover:bg-success/90'
            }`}
          >
            確定
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
