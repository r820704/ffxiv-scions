import { useState } from 'react';

const STORAGE_KEY = 'eureka-gear-onboarding-dismissed';

export function OnboardingBanner() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
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
      <h2 className="font-semibold text-gray-100 mb-2">禁地兵裝有 3 個進度軸：</h2>
      <ul className="text-sm space-y-1 text-gray-300">
        <li>
          · <strong>武器</strong>（依職業，16 階段）
        </li>
        <li>
          · <strong>常風防具</strong>（外觀專用，5 階段，依職業）
        </li>
        <li>
          · <strong>元素防具</strong>（戰鬥用，4 階段，依職能共用）
        </li>
      </ul>
    </div>
  );
}
