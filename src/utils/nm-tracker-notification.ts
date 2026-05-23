import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord } from '@/types/nm-tracker';
import type { StateCtx } from './nm-tracker-state';
import {
  isCdReady,
  isCdSoon,
  isMobConditionMet,
  isNmConditionMet,
  isNmConditionSoon,
} from './nm-tracker-state';
export type NotificationTrigger = 'T1' | 'T2';

export interface NotificationEntry {
  nmId: string;
  trigger: NotificationTrigger;
  at: number;  // Unix ms
  label: string;
  body: string;
}

const LOOKAHEAD_MS = 24 * 60 * 60 * 1000;
const FINE_STEP_MS = 60_000;  // 1 minute

/**
 * For each pinned NM, find the next T1 and T2 trigger time within 24h.
 * - T1: (CD ready OR CD ≤ NM_SOON_THRESHOLD_MS away) AND mob condition ✓ AND
 *       NM condition opens within NM_SOON_THRESHOLD_MS (預備). Aligns with the
 *       amber row state in computeRowState.
 * - T2: all conditions ✓ (CD ready + mob ✓ + nm ✓). Aligns with the green row.
 *
 * Strategy: fine 1-min scan across 24h lookahead (1440 steps per NM).
 * Returns at most 1 T1 + 1 T2 per NM (the next occurrence).
 *
 * 常駐 NMs (no trigger) are skipped — they don't have meaningful "windows".
 */
export function computeNextNotifications(
  pinnedNms: EurekaNm[],
  records: Record<string, NmRecord>,
  now: number,
  ctxAt: (nm: EurekaNm, ms: number) => StateCtx,
): NotificationEntry[] {
  const out: NotificationEntry[] = [];
  const horizonEnd = now + LOOKAHEAD_MS;

  for (const nm of pinnedNms) {
    if (!nm.trigger) continue;  // 常駐 NM 不在 push 範圍

    let foundT1: number | null = null;
    let foundT2: number | null = null;

    // Use fine 1-min steps throughout for correctness — 24h × 60 = 1440 evals per NM,
    // for ≤30 pinned NMs ≈ 43k evals; ctxAt is cheap, this completes in single-digit ms.
    let t = Math.ceil(now / FINE_STEP_MS) * FINE_STEP_MS;
    while (t < horizonEnd && (foundT1 === null || foundT2 === null)) {
      const ctx = ctxAt(nm, t);
      const cdReady = isCdReady(records[nm.id]?.popAt, t);
      const cdSoon = isCdSoon(records[nm.id]?.popAt, t);
      const mobMet = isMobConditionMet(nm, ctx);
      const nmMet = isNmConditionMet(nm, ctx);
      const nmSoon = isNmConditionSoon(nm, ctx);

      if (cdReady && mobMet && nmMet && foundT2 === null) {
        foundT2 = t;
      }
      if ((cdReady || cdSoon) && mobMet && !nmMet && nmSoon && foundT1 === null) {
        foundT1 = t;
      }
      t += FINE_STEP_MS;
    }

    if (foundT1 !== null) {
      out.push({
        nmId: nm.id,
        trigger: 'T1',
        at: foundT1,
        label: `預備：${nm.nameTw}`,
        body: '觸發怪條件已符合、即將進入 NM 條件窗',
      });
    }
    if (foundT2 !== null) {
      out.push({
        nmId: nm.id,
        trigger: 'T2',
        at: foundT2,
        label: `可打：${nm.nameTw}`,
        body: '所有條件齊備，前往現場',
      });
    }
  }
  return out;
}
