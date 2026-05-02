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
import { type EurekaNm } from '@/data/eureka-nm-data';
import { weatherNamesTw } from '@/data/weather-data';
import { triggerMobAttrs, type TriggerMobAttrs } from '@/data/eureka-trigger-mob-data';
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
  cellWeather?: string;
  children: ReactNode;
  onOpenDetail?: (nmId: string) => void;
}

const HOVER_CLOSE_DELAY_MS = 120;

// Reverse-lookup map: TC NM name → trigger mob data
const mobByNmTw = new Map<string, TriggerMobAttrs>(
  Object.values(triggerMobAttrs).map((m) => [m.nmTw, m]),
);

function weatherLabel(weathers: string[]): string {
  return weathers.map((w) => weatherNamesTw[w] ?? w).join('/');
}

interface NmRowDisplay {
  condLabel: string | null;
  subRowMob: TriggerMobAttrs | null;
  subRowLabel: string | null;
}

// Determines how to display a single NM row, including whether to show a trigger-mob sub-row.
function getNmRowDisplay(nm: EurekaNm, cellWeather: string | undefined): NmRowDisplay {
  const nmCond = nm.trigger?.nm;
  const mobCond = nm.trigger?.mob;
  const triggerMob = mobByNmTw.get(nm.nameTw) ?? null;

  // Is the NM's own spawn condition currently met by the cell's weather?
  const nmCondMet = nmCond?.weather ? nmCond.weather.includes(cellWeather ?? '') : false;

  if (nmCond && nmCondMet && mobCond) {
    // nm condition met AND mob condition exists (e.g. Pazuzu in a Gales cell):
    // show nm condition on main line, mob as sub-row pre-farm hint.
    const condLabel = nmCond.weather ? weatherLabel(nmCond.weather) : null;
    const subRowLabel = mobCond.timeOfDay === 'night'
      ? '夜間'
      : mobCond.weather ? weatherLabel(mobCond.weather) : null;
    return { condLabel, subRowMob: triggerMob, subRowLabel };
  }

  if (nmCond && !nmCondMet && mobCond) {
    // nm condition NOT met but mob condition is met (e.g. Pazuzu in a night cell):
    // single contextual line showing both conditions so player knows what's needed.
    const nmLabel = nmCond.weather ? weatherLabel(nmCond.weather) : null;
    const mobLabel = mobCond.timeOfDay === 'night'
      ? '夜間'
      : mobCond.weather ? weatherLabel(mobCond.weather) : null;
    return {
      condLabel: nmLabel && mobLabel ? `NM：${nmLabel} 觸發怪：${mobLabel}` : null,
      subRowMob: null,
      subRowLabel: null,
    };
  }

  if (!nmCond && mobCond?.weather) {
    // Mob has weather condition, no nm condition (e.g. Jahannam):
    // the mob's window IS the action window — show mob as sub-row.
    return {
      condLabel: null,
      subRowMob: triggerMob,
      subRowLabel: weatherLabel(mobCond.weather),
    };
  }

  if (!nmCond && mobCond?.timeOfDay) {
    // Simple night/day mob-only condition (e.g. White Rider):
    // show condition inline, no sub-row needed.
    return {
      condLabel: mobCond.timeOfDay === 'night' ? '夜間' : '白天',
      subRowMob: null,
      subRowLabel: null,
    };
  }

  // Standard nm-weather-only condition (e.g. King Arthro, Copycat Cassie):
  return {
    condLabel: nmCond?.weather ? weatherLabel(nmCond.weather) : null,
    subRowMob: null,
    subRowLabel: null,
  };
}

export default function NmTooltip({ nms, cellWeather, children, onOpenDetail }: NmTooltipProps) {
  const id = useId();
  const ctx = useContext(NmTooltipContext);
  const canHover = useCanHover();
  const [localState, setLocalState] = useState<{ open: boolean; pinned: boolean }>({ open: false, pinned: false });
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  // Always points to the latest ctx so timer callbacks don't close the wrong tooltip.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

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
      // Use ctxRef (latest) so we don't accidentally close a different tooltip
      // that became active while this timer was pending (e.g. user moved to
      // another cell before the 120ms elapsed).
      const latestCtx = ctxRef.current;
      if (latestCtx) {
        if (latestCtx.activeId === id && latestCtx.pinnedId !== id) latestCtx.setActive(null, false);
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
          className="z-50 bg-card border border-border rounded-lg p-2 shadow-xl text-xs max-w-[280px]"
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
            <span className="text-muted-foreground text-[10px]">符合觸發條件</span>
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
            {nms.map((nm) => {
              const { condLabel, subRowMob, subRowLabel } = getNmRowDisplay(nm, cellWeather);
              return (
                <li key={nm.id} className="flex flex-col gap-0.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
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
                    {condLabel && <span className="text-amber-300/80 ml-auto">{condLabel}</span>}
                  </div>
                  {subRowMob && subRowLabel && (
                    <div className="flex items-center gap-1.5 pl-3 text-[10px] text-muted-foreground/60">
                      <span>↳</span>
                      <span>{subRowMob.nameTw}</span>
                      <span>Lv.{subRowMob.level}</span>
                      <span className="ml-auto text-amber-300/60">{subRowLabel}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Popover.Arrow className="fill-border" width={10} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
