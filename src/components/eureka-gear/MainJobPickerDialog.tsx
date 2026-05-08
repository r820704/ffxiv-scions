import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  JOB_TC_NAME,
  JOBS_FOR_ARMOR_SET,
  type AnyJobId,
} from '../../data/eureka-armor-sets';
import type { ArmorSetId } from '../../types/eureka-gear';

const ROLE_GROUPS: Array<{ label: string; setIds: ArmorSetId[] }> = [
  { label: '坦克', setIds: ['fending'] },
  { label: '近戰', setIds: ['maiming', 'striking', 'scouting'] },
  { label: '遠程', setIds: ['aiming'] },
  { label: '治療', setIds: ['healing'] },
  { label: '法職', setIds: ['casting'] },
];

export type MainJobPickerDialogProps = {
  isOpen: boolean;
  initial: AnyJobId[];
  onConfirm: (jobs: AnyJobId[]) => void;
  onCancel: () => void;
};

export function MainJobPickerDialog({ isOpen, initial, onConfirm, onCancel }: MainJobPickerDialogProps) {
  const [selected, setSelected] = useState<Set<AnyJobId>>(() => new Set(initial));

  // Reset selection when dialog reopens with a different initial set.
  useEffect(() => {
    if (isOpen) setSelected(new Set(initial));
  }, [isOpen, initial]);

  const toggle = (job: AnyJobId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(job)) next.delete(job);
      else next.add(job);
      return next;
    });
  };

  const handleSave = () => {
    onConfirm(Array.from(selected));
  };

  const handleClear = () => {
    setSelected(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">⭐ 設定我的職業</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            選一個或多個自己常玩的職業，總覽會多一個「我的職業」chip 可以一鍵篩選。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {ROLE_GROUPS.map(({ label, setIds }) => {
            const jobs = setIds.flatMap((setId) => JOBS_FOR_ARMOR_SET[setId]);
            return (
              <div key={label}>
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {jobs.map((job) => {
                    const active = selected.has(job);
                    const tc = JOB_TC_NAME[job] ?? job;
                    return (
                      <button
                        key={job}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(job)}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary text-secondary-foreground border-border hover:border-primary'
                        }`}
                      >
                        {tc}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded border border-border text-muted-foreground text-sm hover:text-foreground"
          >
            全部清空
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded border border-border text-muted-foreground text-sm hover:text-foreground hover:border-primary transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded font-bold text-sm bg-primary text-primary-foreground"
            >
              儲存（{selected.size}）
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
