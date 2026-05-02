import { useEffect, useRef } from 'react';
import { eurekaNms, type EurekaNm } from '@/data/eureka-nm-data';
import { zoneShortNamesTw, weatherNamesTw } from '@/data/weather-data';
import { nmSpawnInfo } from '@/data/eureka-nm-spawn-data';
import { triggerMobAttrs } from '@/data/eureka-trigger-mob-data';
import NmDetailMap from './NmDetailMap';
import TriggerMobChips from './TriggerMobChips';

function getNmCondLabel(nm: EurekaNm): string {
  const weather = nm.trigger?.nm?.weather;
  if (!weather || weather.length === 0) return '—';
  return weather.map((w) => weatherNamesTw[w] ?? w).join('/');
}

function getMobCondLabel(nm: EurekaNm): string {
  const mobCond = nm.trigger?.mob;
  if (!mobCond) return '—';
  if (mobCond.weather && mobCond.weather.length > 0)
    return mobCond.weather.map((w) => weatherNamesTw[w] ?? w).join('/');
  if (mobCond.timeOfDay === 'night') return '夜間';
  if (mobCond.timeOfDay === 'day') return '白天';
  return '—';
}

interface NmDetailModalProps {
  nmId: string | null;
  onClose: () => void;
}

export default function NmDetailModal({ nmId, onClose }: NmDetailModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!nmId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [nmId, onClose]);

  if (!nmId) return null;
  const nm = eurekaNms.find((n) => n.id === nmId);
  if (!nm) return null;

  const spawn = nmSpawnInfo[nmId];
  const zoneShort = zoneShortNamesTw[nm.zone] ?? nm.zone;
  const nmCondLabel = getNmCondLabel(nm);
  const mobCondLabel = getMobCondLabel(nm);

  // Build pin list: NM pin first (red, "NM" label), then each trigger mob coord
  // gets a sequentially-numbered amber pin.
  const triggerPins = spawn
    ? spawn.trigger.flatMap((mob, mobIdx) =>
        mob.coords.map((c, coordIdx) => {
          const baseLabel = spawn.trigger
            .slice(0, mobIdx)
            .reduce((sum, m) => sum + m.coords.length, 0);
          return {
            x: c.x,
            y: c.y,
            label: String(baseLabel + coordIdx + 1),
            kind: 'trigger' as const,
          };
        }),
      )
    : [];
  const pins = spawn
    ? [
        { x: spawn.nmCoord.x, y: spawn.nmCoord.y, label: 'NM', kind: 'nm' as const },
        ...triggerPins,
      ]
    : [];

  return (
    <div
      data-testid="detail-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nm-detail-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl bg-card border border-border rounded-t-lg sm:rounded-lg shadow-xl flex flex-col max-h-[85dvh] overflow-y-auto"
      >
        <div className="flex items-baseline justify-between gap-2 p-3 border-b border-border/50">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 id="nm-detail-title" className="text-base font-semibold text-foreground">
              {nm.nameTw}
            </h2>
            <span className="text-xs text-muted-foreground">{nm.nameEn}</span>
            <span className="text-xs text-muted-foreground">Lv.{nm.level}</span>
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

        <div className="p-3 flex flex-col gap-3 text-sm">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">NM 出現條件</div>
              <div className={nmCondLabel !== '—' ? 'text-amber-300/90' : 'text-muted-foreground/50'}>
                {nmCondLabel}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">觸發怪條件</div>
              <div className={mobCondLabel !== '—' ? 'text-amber-300/90' : 'text-muted-foreground/50'}>
                {mobCondLabel}
              </div>
            </div>
          </div>

          {!spawn ? (
            <div className="text-xs text-muted-foreground/70">
              尚未收錄此 NM 的觸發資料
            </div>
          ) : (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-1">NM 座標</div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/40 text-xs">
                  <span className="text-rose-400 font-bold">NM</span>
                  <span className="text-muted-foreground">
                    📍 {zoneShort} ({spawn.nmCoord.x.toFixed(1)}, {spawn.nmCoord.y.toFixed(1)})
                  </span>
                </span>
              </div>

              <div>
                <div className="text-foreground mb-2">在以下地點擊殺：</div>
                <ul className="flex flex-col gap-1">
                  {spawn.trigger.map((mob, mobIdx) => {
                    const baseLabel = spawn.trigger
                      .slice(0, mobIdx)
                      .reduce((sum, m) => sum + m.coords.length, 0);
                    const mobAttrs = triggerMobAttrs[mob.nameEn];
                    return (
                      <li key={mobIdx} className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-foreground">{mob.nameTw}</span>
                        {mobAttrs && <TriggerMobChips attrs={mobAttrs} />}
                        {mob.coords.map((c, coordIdx) => (
                          <span
                            key={coordIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground"
                          >
                            <span className="text-amber-400 font-bold">
                              {baseLabel + coordIdx + 1}
                            </span>
                            <span>📍 {zoneShort} ({c.x.toFixed(1)}, {c.y.toFixed(1)})</span>
                          </span>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <NmDetailMap zone={nm.zone} pins={pins} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
