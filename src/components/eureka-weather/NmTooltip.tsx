import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { formatNmTrigger, type EurekaNm } from '@/data/eureka-nm-data';
import { preloadEurekaMap } from '@/utils/preload-eureka-map';

interface NmTooltipProps {
  nms: EurekaNm[];
  children: ReactNode;
  onOpenDetail?: (nmId: string) => void;
}

export default function NmTooltip({ nms, children, onOpenDetail }: NmTooltipProps) {
  const [open, setOpen] = useState(false);

  if (nms.length === 0) return <>{children}</>;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onClick={() => setOpen((o) => !o)}
        >
          {children}
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          updatePositionStrategy="always"
          className="z-50 bg-card border border-border rounded-lg p-2 shadow-xl text-xs max-w-[240px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="text-muted-foreground text-[10px] mb-1">可能出現</div>
          <ul className="flex flex-col gap-1">
            {nms.map((nm) => (
              <li key={nm.id} className="flex items-center gap-2 whitespace-nowrap">
                {onOpenDetail ? (
                  <button
                    type="button"
                    onMouseEnter={() => preloadEurekaMap(nm.zone)}
                    onFocus={() => preloadEurekaMap(nm.zone)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(nm.id);
                      setOpen(false);
                    }}
                    className="text-foreground underline-offset-2 hover:underline hover:text-primary cursor-pointer text-left"
                  >
                    {nm.nameTw}
                  </button>
                ) : (
                  <span className="text-foreground">{nm.nameTw}</span>
                )}
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
