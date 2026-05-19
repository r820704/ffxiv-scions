import type { EurekaNm } from '@/data/eureka-nm-data';
import type { NmRecord } from '@/types/nm-tracker';
import { cdRemainMs } from '@/utils/nm-tracker-state';
import { isWeatherActive, msUntilWeather } from '@/utils/weather-data-runtime';

interface Props { nm: EurekaNm; record?: NmRecord; now: number; }

function formatHHMMSS(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatMinutes(ms: number): string {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${m % 60}m`;
}

export function CooldownCell({ nm, record, now }: Props) {
  const remain = cdRemainMs(record?.popAt, now);

  let cdLabel: JSX.Element;
  if (remain === null) {
    cdLabel = <span>--</span>;
  } else if (remain === 0) {
    cdLabel = <span className="font-medium text-emerald-500">可打</span>;
  } else {
    cdLabel = <span className="tabular-nums">{formatHHMMSS(remain)}</span>;
  }

  let weatherLabel: JSX.Element | null = null;
  const nmWeathers = nm.trigger?.nm?.weather;
  if (nmWeathers && nmWeathers.length > 0) {
    const firstWeather = nmWeathers[0]!;
    if (!isWeatherActive(nm.zone, firstWeather, now)) {
      const ms = msUntilWeather(nm.zone, firstWeather, now);
      if (Number.isFinite(ms)) {
        weatherLabel = (
          <span className="hidden md:inline text-muted-foreground"> · {formatMinutes(ms)}</span>
        );
      }
    }
  }

  return (
    <span className="text-xs">
      {cdLabel}
      {weatherLabel}
    </span>
  );
}
