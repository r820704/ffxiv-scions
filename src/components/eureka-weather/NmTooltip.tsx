import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { formatNmTrigger, type EurekaNm } from '@/data/eureka-nm-data';

interface NmTooltipProps {
  nms: EurekaNm[];
  children: ReactNode;
}

export default function NmTooltip({ nms, children }: NmTooltipProps) {
  const [open, setOpen] = useState(false);

  if (nms.length === 0) return <>{children}</>;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={() => setOpen((v) => !v)}
        >
          {children}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          className="z-50 bg-card border border-border rounded-lg p-2 shadow-xl text-xs max-w-[240px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="text-muted-foreground text-[10px] mb-1">可能出現</div>
          <ul className="flex flex-col gap-1">
            {nms.map((nm) => (
              <li key={nm.id} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-foreground">{nm.nameTw}</span>
                <span className="text-muted-foreground">Lv.{nm.level}</span>
                <span className="text-amber-300/80 ml-auto">{formatNmTrigger(nm)}</span>
              </li>
            ))}
          </ul>
          <Popover.Arrow className="fill-border" width={10} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
