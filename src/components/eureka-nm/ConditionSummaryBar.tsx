import { useMemo } from 'react';
import type { EurekaZone } from '@/data/weather-data';
import { weatherNamesTw } from '@/data/weather-data';
import { eurekaNms } from '@/data/eureka-nm-data';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';
import { isDayTime, getNextTransition } from '@/utils/game-day-night';
import { toEorzeaTime } from '@/utils/eorzea-time';
import WeatherIcon from '@/components/WeatherIcon';
import { ConditionChip } from './ConditionChip';
import type { ConditionStatus } from '@/types/nm-tracker';

function formatMinutes(ms: number): string {
  if (!Number.isFinite(ms)) return '∞';
  const m = Math.max(0, Math.round(ms / 60_000));
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${m % 60}m`;
}

function statusFromMs(currentlyActive: boolean, msToNext: number): ConditionStatus {
  if (currentlyActive) return 'met';
  if (msToNext > 0 && msToNext <= 5 * 60_000) return 'soon';
  return 'idle';
}

interface Props { zone: EurekaZone; now: number; }

export function ConditionSummaryBar({ zone, now }: Props) {
  const weathers = useMemo(() => {
    const set = new Set<string>();
    for (const nm of eurekaNms) {
      if (nm.zone !== zone) continue;
      nm.trigger?.mob?.weather?.forEach(w => set.add(w));
      nm.trigger?.nm?.weather?.forEach(w => set.add(w));
    }
    return Array.from(set);
  }, [zone]);

  const et = toEorzeaTime(now);
  const isNightNow = !isDayTime(et);
  const msToTransition = getNextTransition(now);

  const dayChip = (
    <ConditionChip
      key="day"
      icon={<span aria-hidden="true">☀</span>}
      label="白天"
      status={!isNightNow ? 'met' : 'idle'}
      remainText={!isNightNow ? `剩 ${formatMinutes(msToTransition)}` : `還要 ${formatMinutes(msToTransition)}`}
    />
  );
  const nightChip = (
    <ConditionChip
      key="night"
      icon={<span aria-hidden="true">🌙</span>}
      label="夜間"
      status={isNightNow ? 'met' : 'idle'}
      remainText={isNightNow ? `剩 ${formatMinutes(msToTransition)}` : `還要 ${formatMinutes(msToTransition)}`}
    />
  );

  const weatherChips = weathers.map(w => {
    const active = isWeatherActive(zone, w, now);
    const msToNext = msUntilWeather(zone, w, now);
    const status = statusFromMs(active, msToNext);
    const remain = active ? `現在` : `還要 ${formatMinutes(msToNext)}`;
    const tw = weatherNamesTw[w] ?? w;
    return (
      <ConditionChip
        key={w}
        icon={<WeatherIcon weatherEn={w} weatherTw={tw} size={14} />}
        label={tw}
        status={status}
        remainText={remain}
      />
    );
  });

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-2 mb-2 border-y border-border bg-muted/20">
      {dayChip}
      {nightChip}
      {weatherChips}
    </div>
  );
}
