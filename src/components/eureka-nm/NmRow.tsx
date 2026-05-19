import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord, NmRowState } from '@/types/nm-tracker';
import { nmSpawnInfo } from '@/data/eureka-nm-spawn-data';
import { hasNotableDrops } from '@/data/eureka-nm-drops';
import { PinStar } from './PinStar';
import { TriggerCell } from './TriggerCell';
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
  green: 'bg-emerald-500/10',   // Task 22 will swap to var(--tracker-ready)
  amber: 'bg-amber-500/10',     // Task 22 will swap to var(--tracker-amber)
  neutral: '',
};
const ACCENT: Record<NmRowState, string> = {
  green: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  neutral: 'border-l-transparent',
};

export function NmRow(props: NmRowProps) {
  const coords = nmSpawnInfo[props.nm.id]?.nmCoord;

  return (
    <tr
      className={`border-l-4 transition-colors cursor-pointer md:cursor-default ${ACCENT[props.state]} ${ROW_BG[props.state]}`}
      onClick={() => props.onOpenDetail?.()}
    >
      <td className="px-2 py-0.5 md:py-1 align-middle">
        <div className="flex items-center gap-1">
          <PinStar isPinned={props.isPinned} onToggle={props.onTogglePin} nmName={props.nm.nameTw} />
          <span className="text-xs text-muted-foreground tabular-nums">LV{props.nm.level}</span>
        </div>
      </td>
      <td className="px-2 py-0.5 md:py-1 align-middle">
        <div className="flex items-center gap-1">
          {props.showZoneChip && (
            <span className="rounded bg-muted px-1 text-xs text-muted-foreground">
              {props.nm.zone.replace('Eureka ', '')}
            </span>
          )}
          <span className="text-sm">{props.nm.nameTw}</span>
          {hasNotableDrops(props.nm.id) && <DropsTooltip nmId={props.nm.id} />}
        </div>
      </td>
      <td className="px-2 py-0.5 md:py-1 align-middle hidden md:table-cell text-xs text-muted-foreground tabular-nums">
        {coords ? `X${coords.x.toFixed(1)} Y${coords.y.toFixed(1)}` : '—'}
      </td>
      <td className="px-2 py-0.5 md:py-1 align-middle">
        <TriggerCell nm={props.nm} now={props.now} />
      </td>
      <td className="px-2 py-0.5 md:py-1 align-middle">
        <CooldownCell nm={props.nm} record={props.record} now={props.now} />
      </td>
      <td className="px-2 py-0.5 md:py-1 align-middle">
        <ActionCell
          onPop={props.onPop}
          onClear={props.onClear}
          onSetCustom={props.onSetCustom}
          nmName={props.nm.nameTw}
        />
      </td>
    </tr>
  );
}
