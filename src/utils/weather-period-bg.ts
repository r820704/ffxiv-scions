import { toEorzeaTime } from './eorzea-time';

export type PeriodKind = 'dawn' | 'day' | 'dusk';

// Each weather period spans 8 ET hours, aligned to ET 0/8/16 boundaries.
// Day = ET 6-18, Night = ET 18-6 (next day).
//   dawn cell (ET 0-8): ET 0-6 night (75%) → ET 6-8 day (25%)
//   day cell  (ET 8-16): all day
//   dusk cell (ET 16-24): ET 16-18 day (25%) → ET 18-24 night (75%)
export function getPeriodKind(periodStart: number): PeriodKind {
  const et = toEorzeaTime(periodStart);
  if (et.hours < 8) return 'dawn';
  if (et.hours < 16) return 'day';
  return 'dusk';
}

export function getPeriodBgClass(kind: PeriodKind): string {
  switch (kind) {
    case 'dawn':
      // night→day transition at ET 6 = 75% of cell width; ±2% soft edge
      return 'bg-[linear-gradient(90deg,rgba(67,56,202,0.18)_0%,rgba(67,56,202,0.18)_73%,rgba(254,243,199,0.05)_77%,rgba(254,243,199,0.05)_100%)]';
    case 'day':
      return 'bg-[linear-gradient(180deg,rgba(254,243,199,0.10)_0%,rgba(254,243,199,0.14)_100%)]';
    case 'dusk':
      // day→night transition at ET 18 = 25% of cell width; ±2% soft edge
      return 'bg-[linear-gradient(90deg,rgba(254,243,199,0.05)_0%,rgba(254,243,199,0.05)_23%,rgba(67,56,202,0.18)_27%,rgba(67,56,202,0.18)_100%)]';
  }
}
