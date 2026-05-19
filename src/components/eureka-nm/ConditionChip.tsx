import type { ReactNode } from 'react';
import type { ConditionStatus } from '@/types/nm-tracker';
import { Check, Hourglass } from 'lucide-react';

interface ConditionChipProps {
  icon: ReactNode;
  label: string;
  status: ConditionStatus;
  remainText: string;
}

const COLOR: Record<ConditionStatus, string> = {
  met: 'border-emerald-500/50 bg-emerald-500/10 text-foreground',
  soon: 'border-amber-500/50 bg-amber-500/10 text-foreground',
  idle: 'border-border text-muted-foreground',
};

export function ConditionChip({ icon, label, status, remainText }: ConditionChipProps) {
  const statusIcon =
    status === 'met' ? <Check className="h-3 w-3 text-emerald-500" />
    : status === 'soon' ? <Hourglass className="h-3 w-3 text-amber-500" />
    : null;

  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${COLOR[status]}`}>
      {icon}
      <span>{label}</span>
      {statusIcon}
      {remainText && <span className="tabular-nums text-muted-foreground">{remainText}</span>}
    </span>
  );
}
