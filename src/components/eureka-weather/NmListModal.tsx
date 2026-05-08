import { useMemo } from 'react';
import { eurekaNms, type EurekaNm } from '@/data/eureka-nm-data';
import { zoneShortNamesTw, weatherNamesTw, type EurekaZone } from '@/data/weather-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NmListModalProps {
  zone: EurekaZone | null;
  onClose: () => void;
  onOpenDetail: (nmId: string) => void;
}

function getNmCondLabel(nm: EurekaNm): string {
  const weather = nm.trigger?.nm?.weather;
  if (!weather || weather.length === 0) return '—';
  return weather.map((w) => weatherNamesTw[w] ?? w).join('/');
}

function getMobCondLabel(nm: EurekaNm): string {
  const mobCond = nm.trigger?.mob;
  if (!mobCond) return '—';
  if (mobCond.weather && mobCond.weather.length > 0) {
    return mobCond.weather.map((w) => weatherNamesTw[w] ?? w).join('/');
  }
  if (mobCond.timeOfDay === 'night') return '夜間';
  if (mobCond.timeOfDay === 'day') return '白天';
  return '—';
}

export default function NmListModal({ zone, onClose, onOpenDetail }: NmListModalProps) {
  const sorted = useMemo(() => {
    if (!zone) return [];
    return eurekaNms
      .filter((n) => n.zone === zone)
      .slice()
      .sort((a, b) => a.level - b.level);
  }, [zone]);

  const zoneShort = zone ? (zoneShortNamesTw[zone] ?? zone) : '';
  const minLv = sorted[0]?.level ?? 0;
  const maxLv = sorted[sorted.length - 1]?.level ?? 0;

  return (
    <Dialog open={!!zone} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85dvh] overflow-hidden p-0 gap-0 flex flex-col">
        <DialogHeader className="flex flex-row items-baseline gap-2 flex-wrap p-3 border-b border-border/50 space-y-0">
          {zone && (
            <>
              <DialogTitle className="text-base font-semibold text-foreground">
                {zoneShort} · 全部 NM
              </DialogTitle>
              <span className="text-xs text-muted-foreground">
                Lv.{minLv}-{maxLv}・共 {sorted.length} 隻
              </span>
              <DialogDescription className="sr-only">
                {zoneShort} 區域 Lv.{minLv}-{maxLv} 共 {sorted.length} 隻 NM 的清單與觸發條件
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {zone && (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[36px_1fr_72px_72px] items-center gap-2 px-2 py-1.5 border-b border-border/30 text-[10px] text-muted-foreground/50">
              <span />
              <span />
              <span className="whitespace-nowrap text-right">NM 條件</span>
              <span className="whitespace-nowrap text-right">觸發怪條件</span>
            </div>

            <ul className="flex-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sorted.map((nm) => {
                const nmLabel = getNmCondLabel(nm);
                const mobLabel = getMobCondLabel(nm);
                return (
                  <li key={nm.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenDetail(nm.id);
                        onClose();
                      }}
                      className="w-full grid grid-cols-[36px_1fr_72px_72px] items-center gap-2 p-2 rounded text-left cursor-pointer border border-transparent hover:bg-muted/30 hover:border-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <span
                        data-testid="nm-level-chip"
                        className="text-center text-[11px] font-bold rounded bg-indigo-950/50 text-primary py-0.5"
                      >
                        {nm.level}
                      </span>
                      <span className="text-sm text-foreground truncate">{nm.nameTw}</span>
                      <span
                        className={`text-xs whitespace-nowrap text-right ${
                          nmLabel !== '—' ? 'text-amber-300/85' : 'text-muted-foreground/40'
                        }`}
                      >
                        {nmLabel}
                      </span>
                      <span
                        className={`text-xs whitespace-nowrap text-right ${
                          mobLabel !== '—' ? 'text-amber-300/85' : 'text-muted-foreground/40'
                        }`}
                      >
                        {mobLabel}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
