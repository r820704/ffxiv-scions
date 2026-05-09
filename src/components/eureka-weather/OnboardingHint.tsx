import { useLocalStorageBool } from '@/hooks/useLocalStorageBool';

export default function OnboardingHint() {
  const [dismissed, setDismissed] = useLocalStorageBool(
    'eureka-weather-onboarding-dismissed',
    false,
  );
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-2 bg-day/10 border border-day/30 text-day-foreground text-xs px-3 py-2 rounded-md">
      <span>💡 移到標有 🔴NM 或 🌙 的格子，可查看該時段滿足天氣或時間條件的可觸發 NM</span>
      <button
        type="button"
        aria-label="關閉提示"
        onClick={() => setDismissed(true)}
        className="ml-auto hover:text-amber-100 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
