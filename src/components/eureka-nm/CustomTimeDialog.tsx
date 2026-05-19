import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CustomTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nmName: string;
  onConfirm: (popAt: number) => void;
}

const PRESETS: Array<{ label: string; minutes: number }> = [
  { label: '10 分前', minutes: 10 },
  { label: '30 分前', minutes: 30 },
  { label: '1 小時前', minutes: 60 },
  { label: '90 分前', minutes: 90 },
];

function nowDatetimeLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function CustomTimeDialog({
  open,
  onOpenChange,
  nmName,
  onConfirm,
}: CustomTimeDialogProps) {
  const [datetimeValue, setDatetimeValue] = useState<string>(nowDatetimeLocal());

  function applyPreset(minutesAgo: number) {
    onConfirm(Date.now() - minutesAgo * 60_000);
  }
  function applyDatetime() {
    const t = new Date(datetimeValue).getTime();
    if (Number.isFinite(t)) onConfirm(t);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>自訂 {nmName} 出現時間</DialogTitle>
          <DialogDescription>
            選擇 NM 上次出現的時間，系統會自動算 2 小時 CD。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(p.minutes)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div>
            <label
              htmlFor="custom-pop-time"
              className="block text-sm text-muted-foreground mb-1"
            >
              或選具體時間：
            </label>
            <input
              id="custom-pop-time"
              type="datetime-local"
              value={datetimeValue}
              onChange={(e) => setDatetimeValue(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={applyDatetime}>使用此時間</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
