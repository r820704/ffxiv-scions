import { useEffect, useMemo, useRef } from 'react';
import { eurekaNms, formatNmTrigger } from '@/data/eureka-nm-data';
import { zoneShortNamesTw, type EurekaZone } from '@/data/weather-data';

interface NmListModalProps {
  zone: EurekaZone | null;
  onClose: () => void;
  onOpenDetail: (nmId: string) => void;
}

export default function NmListModal({ zone, onClose, onOpenDetail }: NmListModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!zone) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [zone, onClose]);

  const sorted = useMemo(() => {
    if (!zone) return [];
    return eurekaNms
      .filter((n) => n.zone === zone)
      .slice()
      .sort((a, b) => a.level - b.level);
  }, [zone]);

  if (!zone) return null;

  const zoneShort = zoneShortNamesTw[zone] ?? zone;
  const minLv = sorted[0]?.level ?? 0;
  const maxLv = sorted[sorted.length - 1]?.level ?? 0;

  return (
    <div
      data-testid="list-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nm-list-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl bg-card border border-border rounded-t-lg sm:rounded-lg shadow-xl flex flex-col max-h-[85dvh] overflow-hidden"
      >
        <div className="flex items-baseline justify-between gap-2 p-3 border-b border-border/50">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 id="nm-list-title" className="text-base font-semibold text-foreground">
              {zoneShort} · 全部 NM
            </h2>
            <span className="text-xs text-muted-foreground">
              Lv.{minLv}-{maxLv}・共 {sorted.length} 隻
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="關閉"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {sorted.map((nm) => {
            const isUnconditional = !nm.trigger;
            return (
              <li
                key={nm.id}
                onClick={() => {
                  onOpenDetail(nm.id);
                  onClose();
                }}
                className="grid grid-cols-[36px_1fr_auto] items-center gap-2 p-2 rounded cursor-pointer border border-transparent hover:bg-muted/30 hover:border-border/50"
              >
                <span className="text-center text-[11px] font-bold rounded bg-indigo-950/50 text-primary py-0.5">
                  {nm.level}
                </span>
                <span className="text-sm text-foreground">{nm.nameTw}</span>
                <span
                  className={`text-xs whitespace-nowrap ${
                    isUnconditional ? 'text-muted-foreground' : 'text-amber-300/85'
                  }`}
                >
                  {isUnconditional ? '常駐' : formatNmTrigger(nm)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
