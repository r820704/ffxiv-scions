import type { ReactNode } from 'react';
import type { ConditionStatus } from '@/types/nm-tracker';
import { Check, Hourglass, Clock } from 'lucide-react';

interface ConditionChipProps {
  icon: ReactNode;
  label: string;
  status: ConditionStatus;
  remainText: string;
  nextText?: string;
}

const COLOR: Record<ConditionStatus, string> = {
  met: 'border-owned/50 bg-owned/10 text-foreground',
  soon: 'border-warning/50 bg-warning/10 text-foreground',
  distant: 'border-border text-muted-foreground',
  idle: 'border-border text-muted-foreground',
};

export function ConditionChip({ icon, label, status, remainText, nextText }: ConditionChipProps) {
  const statusIcon =
    status === 'met' ? <Check className="translate-y-px h-2.5 w-2.5 text-owned" />
    : status === 'soon' ? <Hourglass className="translate-y-px h-2.5 w-2.5 text-warning" />
    : status === 'distant' ? <Clock className="translate-y-px h-2.5 w-2.5 text-sky-500" />
    : null;

  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${COLOR[status]}`}>
      {icon}
      <span>{label}</span>
      {statusIcon}
      {remainText && <span className="tabular-nums text-muted-foreground">{remainText}</span>}
      {nextText && <span className="tabular-nums text-muted-foreground">· {nextText}</span>}
    </span>
  );
}
