import { useEffect, useRef, useState } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { weatherNamesTw, zoneNamesTw } from '@/data/weather-data';
import { formatLocalHHMM } from '@/utils/notification-engine';
import { cn } from '@/lib/utils';

export default function RemindersHeaderButton() {
  const { reminders, remove, toggleRecurring, clearAll, isSupported } = useReminders();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(ev: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(ev.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(ev.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="已設提醒"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary transition-colors text-sm"
      >
        🔔
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-day text-[10px] text-day-foreground font-bold flex items-center justify-center">
            {reminders.length}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="已設提醒列表"
          className="absolute right-0 top-10 w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-3 text-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">已設提醒</h3>
            {reminders.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                全部清除
              </button>
            )}
          </div>
          {!isSupported ? (
            <p className="text-muted-foreground">
              您的瀏覽器不支援桌面通知。iPhone 使用者可將網頁加入主畫面後啟用。
            </p>
          ) : reminders.length === 0 ? (
            <p className="text-muted-foreground">尚未設定任何提醒。</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 truncate">
                    {r.nmName ? (
                      <span className="text-amber-300">{r.nmName}</span>
                    ) : (
                      <span>
                        {weatherNamesTw[r.weather] ?? r.weather} ·{' '}
                        {(zoneNamesTw[r.zone] ?? r.zone).replace('優雷卡', '')}
                      </span>
                    )}
                    <span className="text-muted-foreground"> {formatLocalHHMM(r.targetMs)}</span>
                  </span>
                  <button
                    type="button"
                    aria-label="重複"
                    aria-pressed={r.recurring}
                    onClick={() => toggleRecurring(r.id)}
                    className={cn(
                      'w-6 h-6 rounded transition-colors',
                      r.recurring
                        ? 'bg-day/20 text-day-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    🔁
                  </button>
                  <button
                    type="button"
                    aria-label="移除"
                    onClick={() => remove(r.id)}
                    className="w-6 h-6 rounded text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
