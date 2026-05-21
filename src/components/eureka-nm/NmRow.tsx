import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord, NmRowState } from '@/types/nm-tracker';
import { hasNotableDrops } from '@/data/eureka-nm-drops';
import { zoneShortNamesTw } from '@/data/weather-data';
import { PinStar } from './PinStar';
import { MobConditionCell, NmConditionCell, MergedConditionCellMobile } from './TriggerCell';
import { CooldownCell } from './CooldownCell';
import { ActionCell } from './ActionCell';
import { DropsTooltip } from './DropsTooltip';

interface NmRowProps {
  nm: EurekaNm;
  record?: NmRecord;
  state: NmRowState;
  isPinned: boolean;
  showZoneChip?: boolean;
  now: number;
  onTogglePin: () => void;
  onPop: () => void;
  onClear: () => void;
  onSetCustom: (popAt: number) => void;
  onOpenDetail?: () => void;
}

const ROW_BG: Record<NmRowState, string> = {
  green: 'bg-owned/10',
  amber: 'bg-warning/10',
  neutral: '',
};
const ACCENT: Record<NmRowState, string> = {
  green: 'border-l-owned',
  amber: 'border-l-warning',
  neutral: 'border-l-transparent',
};

export function NmRow(props: NmRowProps) {
  return (
    <tr
      className={`border-l-4 transition-colors cursor-pointer md:cursor-default ${ACCENT[props.state]} ${ROW_BG[props.state]}`}
      onClick={() => props.onOpenDetail?.()}
    >
      <td className="px-2 py-0.5 md:py-0.5 align-middle">
        <div className="flex items-center gap-1">
          <PinStar isPinned={props.isPinned} onToggle={props.onTogglePin} nmName={props.nm.nameTw} />
          <span className="text-xs text-muted-foreground tabular-nums">{props.nm.level}</span>
        </div>
      </td>
      <td className="px-2 py-0.5 md:py-0.5 align-middle">
        <div className="flex items-center gap-1 min-w-0">
          {props.showZoneChip && (
            <span className="rounded bg-muted px-1 text-xs text-muted-foreground whitespace-nowrap">
              {zoneShortNamesTw[props.nm.zone] ?? props.nm.zone}
            </span>
          )}
          <span className="text-xs md:text-sm truncate">{props.nm.nameTw}</span>
          {hasNotableDrops(props.nm.id) && <DropsTooltip nmId={props.nm.id} />}
        </div>
      </td>
      {/* Desktop only: 觸發怪 column */}
      <td className="px-2 py-0.5 md:py-0.5 align-middle hidden md:table-cell">
        <MobConditionCell nm={props.nm} now={props.now} />
      </td>
      {/* Desktop only: NM 條件 + 天氣窗 column */}
      <td className="px-2 py-0.5 md:py-0.5 align-middle hidden md:table-cell">
        <NmConditionCell nm={props.nm} now={props.now} />
      </td>
      {/* Mobile only: merged condition cell */}
      <td className="px-2 py-0.5 align-middle md:hidden">
        <MergedConditionCellMobile nm={props.nm} now={props.now} />
      </td>
      <td className="px-2 py-0.5 md:py-0.5 align-middle">
        <CooldownCell
          nm={props.nm}
          record={props.record}
          state={props.state}
          now={props.now}
          onSetCustom={props.onSetCustom}
        />
      </td>
      <td className="pl-1 pr-2 py-0.5 md:px-2 md:py-0.5 align-middle text-right md:text-left">
        <ActionCell
          hasRecord={props.record != null}
          onPop={props.onPop}
          onClear={props.onClear}
          nmName={props.nm.nameTw}
        />
      </td>
    </tr>
  );
}
