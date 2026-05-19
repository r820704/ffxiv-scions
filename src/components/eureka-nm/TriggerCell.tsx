// STUB — Task 11 will replace with full mob/NM condition segments + status icons.
import type { EurekaNm } from '@/data/eureka-nm-data';

interface Props { nm: EurekaNm; now: number; }

export function TriggerCell({ nm }: Props) {
  if (!nm.trigger?.mob && !nm.trigger?.nm) {
    return <span className="text-xs text-muted-foreground">常駐</span>;
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}
