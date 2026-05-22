import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord } from '@/types/nm-tracker';
import { NmRow } from './NmRow';
import { computeRowState } from '@/utils/nm-tracker-state';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';
import { isDayTime, getNextTransition } from '@/utils/game-day-night';
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
  const msToTransition = getNextTransition(props.now);

  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full text-sm table-fixed">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-2 py-0.5 text-left w-[44px] md:w-[60px]">等級</th>
            <th className="px-2 py-0.5 text-left md:w-[210px]">NM 名稱</th>
            <th className="px-2 py-0.5 text-left hidden md:table-cell">觸發怪</th>
            <th className="px-2 py-0.5 text-left hidden md:table-cell">NM 條件</th>
            {/* Mobile: merged condition column header. The inner grid mirrors
                MergedConditionCellMobile so the ｜ separator lines up with the
                cell ｜ regardless of which side has content. */}
            <th className="px-2 py-0.5 text-left md:hidden whitespace-nowrap w-[100px]">
              <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                <span className="justify-self-start">觸發</span>
                <span className="text-muted-foreground">｜</span>
                <span className="justify-self-start">NM</span>
              </span>
            </th>
            <th className="px-2 py-0.5 text-left w-[72px] md:w-[130px]">冷卻</th>
            <th className="pl-1 pr-2 py-0.5 md:px-2 text-right md:text-left w-[44px] md:w-[80px]">記錄</th>
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
              msToTransition,
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
