import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord } from '@/types/nm-tracker';
import { NmRow } from './NmRow';
import { computeRowState } from '@/utils/nm-tracker-state';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';
import { isDayTime } from '@/utils/game-day-night';
import { toEorzeaTime } from '@/utils/eorzea-time';

interface NmTableProps {
  nms: EurekaNm[];
  records: Record<string, NmRecord>;
  pinned: string[];
  now: number;
  showZoneChips?: boolean;
  onTogglePin: (nmId: string) => void;
  onPop: (nmId: string) => void;
  onClear: (nmId: string) => void;
  onSetCustom: (nmId: string, popAt: number) => void;
  onOpenDetail?: (nmId: string) => void;
}

export function NmTable(props: NmTableProps) {
  const isNight = !isDayTime(toEorzeaTime(props.now));

  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-2 py-0.5 md:py-1 text-left">等級</th>
            <th className="px-2 py-0.5 md:py-1 text-left">NM 名稱</th>
            <th className="px-2 py-0.5 md:py-1 text-left hidden md:table-cell">觸發怪</th>
            <th className="px-2 py-0.5 md:py-1 text-left hidden md:table-cell">NM 條件</th>
            {/* Mobile: merged condition column header */}
            <th className="px-2 py-0.5 text-left md:hidden whitespace-nowrap">觸發｜NM</th>
            <th className="px-2 py-0.5 md:py-1 text-left">冷卻</th>
            <th className="pl-1 pr-2 py-0.5 md:px-2 md:py-1 text-right md:text-left">記錄</th>
          </tr>
        </thead>
        <tbody>
          {props.nms.map(nm => {
            const record = props.records[nm.id];
            const ctx = {
              isNight,
              isWeather: (w: string) => isWeatherActive(nm.zone, w, props.now),
              minutesToWeather: (w: string) =>
                msUntilWeather(nm.zone, w, props.now) / 60_000,
            };
            const state = computeRowState(nm, { popAt: record?.popAt }, props.now, ctx);
            return (
              <NmRow
                key={nm.id}
                nm={nm}
                record={record}
                state={state}
                isPinned={props.pinned.includes(nm.id)}
                showZoneChip={props.showZoneChips}
                now={props.now}
                onTogglePin={() => props.onTogglePin(nm.id)}
                onPop={() => props.onPop(nm.id)}
                onClear={() => props.onClear(nm.id)}
                onSetCustom={(popAt) => props.onSetCustom(nm.id, popAt)}
                onOpenDetail={() => props.onOpenDetail?.(nm.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
