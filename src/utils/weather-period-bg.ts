import { WEATHER_PERIOD_MS, toEorzeaTime } from './eorzea-time';
import { isDayTime } from './game-day-night';

export type PeriodKind = 'dawn' | 'day' | 'dusk';

// Each weather period spans 8 ET hours, aligned to ET 0/8/16 boundaries.
// Day = ET 6-18, Night = ET 18-6 (next day).
//   dawn cell (ET 0-8): ET 0-6 night (75%) → ET 6-8 day (25%)
//   day cell  (ET 8-16): all day
//   dusk cell (ET 16-24): ET 16-18 day (25%) → ET 18-24 night (75%)
// Whether a cell is "night-time" for filtering purposes. Without realNow, uses
// the cell midpoint (matches getActiveNms heuristic). With realNow, uses the
// player's actual ET hour — useful for the current cell where midpoint can lie
// across the day/night boundary (cf. M3 sub-fix in Phase 2).
export function isCellNight(periodStart: number, realNow?: number): boolean {
  const reference = realNow ?? periodStart + WEATHER_PERIOD_MS / 2;
  return !isDayTime(toEorzeaTime(reference));
}

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
      return 'bg-[linear-gradient(90deg,rgba(67,56,202,0.27)_0%,rgba(67,56,202,0.27)_73%,rgba(254,243,199,0.13)_77%,rgba(254,243,199,0.13)_100%)]';
    case 'day':
      return 'bg-[linear-gradient(180deg,rgba(254,243,199,0.13)_0%,rgba(254,243,199,0.20)_100%)]';
    case 'dusk':
      // day→night transition at ET 18 = 25% of cell width; ±2% soft edge
      return 'bg-[linear-gradient(90deg,rgba(254,243,199,0.13)_0%,rgba(254,243,199,0.13)_23%,rgba(67,56,202,0.27)_27%,rgba(67,56,202,0.27)_100%)]';
  }
}
