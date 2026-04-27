import { useLocalStorageBool } from '@/hooks/useLocalStorageBool';

export default function OnboardingHint() {
  const [dismissed, setDismissed] = useLocalStorageBool(
    'eureka-weather-onboarding-dismissed',
    false,
  );
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs px-3 py-2 rounded-md">
      <span>💡 點任一格子（紅 NM 徽章）可以看到該格可能出現的 NM 名單；點一下釘住、再點取消</span>
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
