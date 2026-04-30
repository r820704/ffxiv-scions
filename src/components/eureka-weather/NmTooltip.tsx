import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import { formatNmTrigger, type EurekaNm } from '@/data/eureka-nm-data';
import { preloadEurekaMap } from '@/utils/preload-eureka-map';

interface NmTooltipState {
  activeId: string | null;
  pinnedId: string | null;
  setActive: (id: string | null, pinned: boolean) => void;
}

const NmTooltipContext = createContext<NmTooltipState | null>(null);

export function NmTooltipProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const setActive = (id: string | null, pinned: boolean) => {
    setActiveId(id);
    setPinnedId(pinned ? id : null);
  };
  return (
    <NmTooltipContext.Provider value={{ activeId, pinnedId, setActive }}>
      {children}
    </NmTooltipContext.Provider>
  );
}

const HOVER_MEDIA_QUERY = '(hover: hover) and (pointer: fine)';

// Subscribes to the hover-capability media query. Returns true when the user
// has a real pointing device (mouse / trackpad). Touch-only devices return false
// so we don't auto-open tooltips on tap-emulated mouseenter events.
function useCanHover(): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(HOVER_MEDIA_QUERY);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => {
      if (typeof window === 'undefined' || !window.matchMedia) return true;
      return window.matchMedia(HOVER_MEDIA_QUERY).matches;
    },
    () => true,
  );
}

interface NmTooltipProps {
  nms: EurekaNm[];
  children: ReactNode;
  onOpenDetail?: (nmId: string) => void;
}

const HOVER_CLOSE_DELAY_MS = 120;

export default function NmTooltip({ nms, children, onOpenDetail }: NmTooltipProps) {
  const id = useId();
  const ctx = useContext(NmTooltipContext);
  const canHover = useCanHover();
  const [localState, setLocalState] = useState<{ open: boolean; pinned: boolean }>({ open: false, pinned: false });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const open = ctx ? ctx.activeId === id : localState.open;
  const pinned = ctx ? ctx.pinnedId === id : localState.pinned;

  const setOpenPinned = (nextOpen: boolean, nextPinned: boolean) => {
    if (ctx) ctx.setActive(nextOpen ? id : null, nextOpen && nextPinned);
    else setLocalState({ open: nextOpen, pinned: nextOpen && nextPinned });
  };

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      // Re-check pinned state at fire time — user may have pinned during the delay.
      if (ctx) {
        if (ctx.pinnedId !== id) ctx.setActive(null, false);
      } else {
        setLocalState((s) => (s.pinned ? s : { open: false, pinned: false }));
      }
    }, HOVER_CLOSE_DELAY_MS);
  };

  useEffect(() => () => cancelScheduledClose(), []);

  if (nms.length === 0) return <>{children}</>;

  const handleTriggerEnter = () => {
    if (!canHover) return; // touch device — explicit tap required
    cancelScheduledClose();
    if (!open) setOpenPinned(true, false);
  };

  const handleTriggerLeave = () => {
    if (!canHover) return;
    if (!pinned) scheduleClose();
  };

  const handleContentEnter = () => {
    cancelScheduledClose();
  };

  const handleContentLeave = () => {
    if (!canHover) return;
    if (!pinned) scheduleClose();
  };

  const handleTriggerClick = () => {
    cancelScheduledClose();
    if (open && pinned) setOpenPinned(false, false);
    else setOpenPinned(true, true);
  };

  const handleClose = () => {
    cancelScheduledClose();
    setOpenPinned(false, false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <Popover.Anchor asChild>
        <div
          ref={anchorRef}
          onMouseEnter={handleTriggerEnter}
          onMouseLeave={handleTriggerLeave}
          onClick={handleTriggerClick}
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
          onPointerDownOutside={(e) => {
            // Suppress Radix's auto-close when the pointerdown is on our trigger;
            // the trigger's own onClick handler is the single source of truth for
            // pin/unpin transitions there.
            if (anchorRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
          onMouseEnter={handleContentEnter}
          onMouseLeave={handleContentLeave}
        >
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-muted-foreground text-[10px]">可能出現</span>
            <button
              type="button"
              aria-label="關閉"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
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
                      handleClose();
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
