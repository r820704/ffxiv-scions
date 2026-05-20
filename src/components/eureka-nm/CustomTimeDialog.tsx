import { useEffect, useState } from 'react';
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

function nowHHMM(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Convert "HH:MM" (24-hour, today in local timezone) to a Unix ms.
 * Picks "today at HH:MM" if that is in the past; otherwise treats it as
 * yesterday (NM CD is 2 hours so the input always refers to <24h ago).
 */
function hhmmToPopAt(hhmm: string): number | null {
  const [hStr, mStr] = hhmm.split(':');
  if (!hStr || !mStr) return null;
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);
  if (candidate.getTime() > now.getTime()) {
    candidate.setDate(candidate.getDate() - 1);
  }
  return candidate.getTime();
}

export function CustomTimeDialog({
  open,
  onOpenChange,
  nmName,
  onConfirm,
}: CustomTimeDialogProps) {
  const [timeValue, setTimeValue] = useState<string>(nowHHMM);

  // Reset the value to "now" each time the dialog opens, so it's always a
  // fresh starting point rather than carrying over a stale picked time.
  useEffect(() => {
    if (open) setTimeValue(nowHHMM());
  }, [open]);

  function applyTime() {
    const t = hhmmToPopAt(timeValue);
    if (t !== null) onConfirm(t);
  }

  // Swallow clicks inside the dialog so they don't bubble to the underlying
  // <tr onClick> in NmRow (which would open NmDetailModal as a side effect).
  function stopRowPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={stopRowPropagation}>
        <DialogHeader>
          <DialogTitle>自訂 {nmName} 出現時間</DialogTitle>
          <DialogDescription>
            輸入 NM 上次出現的時間（24 小時制），系統會自動算 2 小時 CD。
            若輸入時間在未來，會自動視為昨天同時刻。
          </DialogDescription>
        </DialogHeader>
        <div>
          <label
            htmlFor="custom-pop-time"
            className="block text-sm text-muted-foreground mb-1"
          >
            出現時間（HH:MM）：
          </label>
          <input
            id="custom-pop-time"
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1 text-sm tabular-nums"
            required
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={applyTime}>使用此時間</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
