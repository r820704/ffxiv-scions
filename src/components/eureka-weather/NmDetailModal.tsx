import { eurekaNms, type EurekaNm } from '@/data/eureka-nm-data';
import { zoneShortNamesTw, weatherNamesTw } from '@/data/weather-data';
import { nmSpawnInfo } from '@/data/eureka-nm-spawn-data';
import { triggerMobAttrs } from '@/data/eureka-trigger-mob-data';
import { getNotableDrops } from '@/data/eureka-nm-drops';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const nm = nmId ? eurekaNms.find((n) => n.id === nmId) : null;
  const spawn = nmId ? nmSpawnInfo[nmId] : undefined;

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

  const zoneShort = nm ? (zoneShortNamesTw[nm.zone] ?? nm.zone) : '';
  const nmCondLabel = nm ? getNmCondLabel(nm) : '—';
  const mobCondLabel = nm ? getMobCondLabel(nm) : '—';

  return (
    <Dialog open={!!nm} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85dvh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="flex flex-row items-baseline gap-2 flex-wrap p-3 border-b border-border/50 space-y-0">
          {nm && (
            <>
              <DialogTitle className="text-base font-semibold text-foreground">
                {nm.nameTw}
              </DialogTitle>
              <span className="text-xs text-muted-foreground">{nm.nameEn}</span>
              <span className="text-xs text-muted-foreground">Lv.{nm.level}</span>
              <DialogDescription className="sr-only">
                此 NM 的觸發條件、座標、觸發怪詳情
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {nm && (
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="sm:flex-1">
                    <div className="text-xs text-muted-foreground mb-1">NM 座標</div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-nm/15 text-xs">
                      <span className="text-nm-foreground font-bold">NM</span>
                      <span className="text-muted-foreground">
                        📍 {zoneShort} ({spawn.nmCoord.x.toFixed(1)}, {spawn.nmCoord.y.toFixed(1)})
                      </span>
                    </span>
                  </div>

                  {(() => {
                    const drops = getNotableDrops(nm.id);
                    if (drops.length === 0) return null;
                    return (
                      <div className="sm:flex-1">
                        <div className="text-xs text-muted-foreground mb-1">特殊掉落</div>
                        <ul className="flex flex-col gap-1 text-xs">
                          {drops.map((d, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="text-foreground">
                                {d.nameTw}
                                {d.labelTw && `（${d.labelTw}）`}
                              </span>
                              {d.nameTw !== d.nameEn && (
                                <span className="text-muted-foreground">{d.nameEn}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="text-foreground mb-2">觸發方式：在以下地點擊殺</div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
