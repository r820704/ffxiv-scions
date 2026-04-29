import { useMemo } from 'react';
import type { EurekaZone } from '@/data/weather-data';
import type { ReminderSource } from '@/types/reminder';
import { useReminders, type PermissionState } from '@/hooks/useReminders';
import { cn } from '@/lib/utils';

interface AddReminderButtonProps {
  zone: EurekaZone;
  weather: string;
  targetMs: number;
  source: ReminderSource;
  nmName?: string;
  onToast: (msg: string) => void;
  className?: string;
}

function reminderId(zone: string, weather: string, targetMs: number, nmName?: string): string {
  const nmPart = nmName ? `:${nmName}` : '';
  return `${zone}:${weather}:${targetMs}${nmPart}`;
}

export default function AddReminderButton({
  zone,
  weather,
  targetMs,
  source,
  nmName,
  onToast,
  className,
}: AddReminderButtonProps) {
  const { reminders, add, remove, isSupported, permission, isFull, requestPermission } =
    useReminders();

  const id = useMemo(
    () => reminderId(zone, weather, targetMs, nmName),
    [zone, weather, targetMs, nmName],
  );
  const isSet = reminders.some((r) => r.id === id);

  const label = isSet ? '已設提醒' : '提醒我';

  async function handleClick() {
    if (!isSupported) {
      onToast('您的瀏覽器不支援桌面通知。iPhone 使用者可加入主畫面後再啟用。');
      return;
    }
    if (permission === 'denied') {
      onToast('通知權限已拒絕，請在瀏覽器設定重新啟用。');
      return;
    }
    if (isSet) {
      remove(id);
      return;
    }
    if (isFull) {
      onToast('已設提醒已達上限 50 筆，請先移除一些再加。');
      return;
    }
    let p: PermissionState = permission;
    if (p === 'default') {
      p = await requestPermission();
    }
    if (p !== 'granted') {
      if (p === 'denied') {
        onToast('通知權限已拒絕，請在瀏覽器設定重新啟用。');
      }
      return;
    }
    const outcome = add({
      id,
      zone,
      weather,
      targetMs,
      recurring: false,
      source,
      nmName,
      createdAt: Date.now(),
    });
    if (!outcome.ok) {
      if (outcome.reason === 'cap') onToast('已設提醒已達上限 50 筆，請先移除一些再加。');
      else if (outcome.reason === 'unsupported') onToast('您的瀏覽器不支援桌面通知。');
      else if (outcome.reason === 'too-soon') onToast('離目標時間不到 2 分鐘，無法設定提醒。');
      // duplicate / denied: silent
    }
  }

  const visualState =
    !isSupported || permission === 'denied' ? 'disabled' : isSet ? 'set' : 'default';

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSet}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded transition-colors text-xs',
        visualState === 'set' && 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30',
        visualState === 'default' && 'text-muted-foreground hover:text-amber-300',
        visualState === 'disabled' && 'text-muted-foreground/50 cursor-not-allowed',
        className,
      )}
    >
      <span aria-hidden>{isSet ? '🔔' : '🔕'}</span>
    </button>
  );
}
