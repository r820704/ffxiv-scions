import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'eureka-gear-onboarding-dismissed';
const TOGGLE_EVENT = 'eureka-gear-onboarding-toggle';

/** Toggle the banner's visibility from outside (the page-header `?` button).
 *  - If the banner is hidden — whether via the X dismiss button (persisted) or
 *    by an earlier toggle (transient) — bring it back. The persisted dismiss
 *    flag is cleared so a hard reload also keeps it visible.
 *  - If the banner is currently visible, hide it transiently (no flag write),
 *    so the next `?` click re-shows without resurrecting an X-dismissed flag.
 *
 *  X dismissal stays "permanent until ? is pressed"; ? toggle is the soft
 *  show/hide affordance the user expects from a single header help button. */
export function toggleOnboarding(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOGGLE_EVENT));
}

export function OnboardingBanner() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISSED_KEY) !== '1';
  });

  useEffect(() => {
    const handler = () => {
      setVisible((prev) => {
        const next = !prev;
        if (next) localStorage.removeItem(DISMISSED_KEY);
        return next;
      });
    };
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="禁地兵裝說明"
      className="relative bg-secondary/60 border border-border rounded p-4 mb-4"
    >
      <button
        type="button"
        aria-label="關閉說明"
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        ✕
      </button>
      <p className="text-sm text-foreground pr-8">
        <strong>禁地兵裝</strong>是 4.x（紅蓮解放者）的武器與套裝系列，玩家在禁地優雷卡的四個區域累積元素等級與素材，最終可獲得帶有優雷卡元素加持屬性的武器及裝備，部分形態具有發光特效。
      </p>
      <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
        <li>
          · <strong className="text-foreground">武器</strong>（依職業，共 16 階段，最終階段 iL405，帶有優雷卡元素加持屬性）
        </li>
        <li>
          · <strong className="text-foreground">常風防具</strong>（外觀專用，不影響角色能力值，各職業獨立，共 5 階段，最終階段為可染色的 Lv.70 職業套裝）
        </li>
        <li>
          · <strong className="text-foreground">元素防具</strong>（戰鬥用，共 3 階段，依職能共用——同職能玩家共享同一套外觀，最終階段 iL390，帶有優雷卡元素加持屬性）
        </li>
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        優雷卡元素加持：在優雷卡區域內均衡提升六種元素屬性，影響傷害計算。
      </p>
    </div>
  );
}
