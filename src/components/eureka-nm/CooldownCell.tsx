import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord } from '@/types/nm-tracker';
import { cdRemainMs } from '@/utils/nm-tracker-state';
import { CustomTimeDialog } from './CustomTimeDialog';

interface Props {
  nm: EurekaNm;
  record?: NmRecord;
  now: number;
  onSetCustom: (popAt: number) => void;
}

function formatHHMMSS(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function CooldownCell({ nm, record, now, onSetCustom }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const remain = cdRemainMs(record?.popAt, now);

  let cdLabel: JSX.Element;
  if (remain === null) {
    cdLabel = <span>--</span>;
  } else if (remain === 0) {
    cdLabel = <span className="font-medium text-owned">可打</span>;
  } else {
    cdLabel = <span className="tabular-nums">{formatHHMMSS(remain)}</span>;
  }

  return (
    <>
      <button
        type="button"
        aria-label={`自訂 ${nm.nameTw} 出現時間`}
        onClick={(e) => {
          e.stopPropagation();
          setCustomOpen(true);
        }}
        className="group inline-flex items-center gap-1 text-xs text-left hover:text-foreground transition-colors"
      >
        {cdLabel}
        <Pencil className="hidden md:inline-block h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
      </button>
      <CustomTimeDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        nmName={nm.nameTw}
        onConfirm={(t) => {
          onSetCustom(t);
          setCustomOpen(false);
        }}
      />
    </>
  );
}
