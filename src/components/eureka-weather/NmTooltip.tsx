import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { formatNmTrigger, type EurekaNm } from '@/data/eureka-nm-data';
import { preloadEurekaMap } from '@/utils/preload-eureka-map';

interface NmTooltipState {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const NmTooltipContext = createContext<NmTooltipState | null>(null);

export function NmTooltipProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  return (
    <NmTooltipContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </NmTooltipContext.Provider>
  );
}

interface NmTooltipProps {
  nms: EurekaNm[];
  children: ReactNode;
  onOpenDetail?: (nmId: string) => void;
}

export default function NmTooltip({ nms, children, onOpenDetail }: NmTooltipProps) {
  const id = useId();
  const ctx = useContext(NmTooltipContext);
  const [localOpen, setLocalOpen] = useState(false);

  const open = ctx ? ctx.activeId === id : localOpen;
  const setOpen = (next: boolean) => {
    if (ctx) ctx.setActiveId(next ? id : null);
    else setLocalOpen(next);
  };

  if (nms.length === 0) return <>{children}</>;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onClick={() => setOpen(!open)}
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
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-muted-foreground text-[10px]">可能出現</span>
            <button
              type="button"
              aria-label="關閉"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-none"
            >
              ✕
            </button>
          </div>
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
