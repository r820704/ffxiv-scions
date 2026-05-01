import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'eureka-gear-onboarding-dismissed';
const EXPANDED_KEY = 'eureka-gear-onboarding-expanded';
const REOPEN_EVENT = 'eureka-gear-onboarding-reopen';

/** Trigger a re-display of a banner that was previously dismissed. Mirrors the
 *  weather page's `?` header button → opens HelpModal pattern, but here the
 *  banner is the help surface so we just flip its dismissed state back. */
export function reopenOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DISMISSED_KEY);
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
}

export function OnboardingBanner() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISMISSED_KEY) === '1';
  });

  // Listen for external "reopen" calls (the page-header `?` button).
  useEffect(() => {
    const handler = () => setDismissed(false);
    window.addEventListener(REOPEN_EVENT, handler);
    return () => window.removeEventListener(REOPEN_EVENT, handler);
  }, []);

  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    // First visit (key absent) → start expanded; subsequent visits respect last toggle.
    const raw = localStorage.getItem(EXPANDED_KEY);
    return raw === null ? true : raw === '1';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem(EXPANDED_KEY, next ? '1' : '0');
  };

  return (
    <div
      role="region"
      aria-label="禁地兵裝說明"
      className="relative bg-blue-950/50 border border-blue-700/50 rounded p-4 mb-4"
    >
      <button
        type="button"
        aria-label="關閉說明"
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
      >
        ✕
      </button>
      <p className="text-sm text-gray-100 pr-8">
        <strong>禁地兵裝</strong>是 4.x（紅蓮之狂潮）的傳說武器與外觀套裝，玩家在優雷卡 4 個區域累積 elemental level 與素材，把職業武器一路升級到 iL400 的最終形態。
      </p>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={toggleExpanded}
        className="mt-2 text-xs text-blue-300 hover:text-blue-100 transition-colors flex items-center gap-1"
      >
        <span>{expanded ? '▾' : '▸'}</span>
        <span>{expanded ? '收合三軌說明' : '展開三軌說明'}</span>
      </button>
      {expanded && (
        <ul className="mt-2 text-sm space-y-1 text-gray-300">
          <li>
            · <strong>武器</strong>（依職業，16 階段，最終形態 iL400）
          </li>
          <li>
            · <strong>常風防具</strong>（外觀專用、不影響戰力，5 階段，依職業）
          </li>
          <li>
            · <strong>元素防具</strong>（戰鬥用，4 階段，依職能共用——同職能玩家分享同一套外觀）
          </li>
        </ul>
      )}
    </div>
  );
}
