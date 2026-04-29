// ⚠️ TEMPORARY — manual-verification helper for M11 PR-1.
// Click → creates a one-shot reminder targeting `now + 3 min`. Because the
// scheduler's lead time is 90s, this fires the notification ~1.5 minutes
// after click. Same code path as production: permission → useReminders.add()
// → scheduleReminder → BroadcastChannel claim → new Notification.
// REMOVE THIS FILE + the import in EurekaWeatherPage.tsx before final cleanup.

import { useReminders, type PermissionState } from '@/hooks/useReminders';

interface TempTestReminderButtonProps {
  onToast: (msg: string) => void;
}

export default function TempTestReminderButton({ onToast }: TempTestReminderButtonProps) {
  const { add, requestPermission, permission, isSupported } = useReminders();

  async function handleClick() {
    if (!isSupported) {
      onToast('您的瀏覽器不支援桌面通知。');
      return;
    }
    if (permission === 'denied') {
      onToast('通知權限已拒絕，請在瀏覽器設定重新啟用。');
      return;
    }
    let p: PermissionState = permission;
    if (p === 'default') {
      p = await requestPermission();
    }
    if (p !== 'granted') {
      onToast('未授權通知，提醒未建立。');
      return;
    }
    const targetMs = Date.now() + 180_000;
    const outcome = add({
      id: `__test_${Date.now()}`,
      zone: 'Eureka Anemos',
      weather: 'Gales',
      targetMs,
      recurring: false,
      source: 'm9-zone-hit',
      createdAt: Date.now(),
    });
    if (!outcome.ok) {
      onToast(`新增失敗：${outcome.reason}`);
    } else {
      onToast('🧪 已設測試提醒，約 1.5 分鐘後會 fire 通知');
    }
  }

  return (
    <button
      type="button"
      aria-label="測試提醒（3 分鐘後 fire）"
      onClick={handleClick}
      title="TEMP: 3 分鐘後 fire 測試通知（lead 90s → 約 1.5 分鐘後看到）"
      className="w-8 h-8 rounded-full border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 transition-colors text-sm"
    >
      🧪
    </button>
  );
}
