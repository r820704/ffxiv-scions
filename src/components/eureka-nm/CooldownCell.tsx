// STUB — Task 12 will replace with CD countdown + next weather window.
import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord } from '@/types/nm-tracker';
import { cdRemainMs } from '@/utils/nm-tracker-state';

interface Props { nm: EurekaNm; record?: NmRecord; now: number; }

export function CooldownCell({ record, now }: Props) {
  const remain = cdRemainMs(record?.popAt, now);
  if (remain === null) return <span className="text-xs">--</span>;
  if (remain === 0) return <span className="text-xs">可打</span>;
  return <span className="text-xs tabular-nums">{Math.ceil(remain / 60_000)}m</span>;
}
