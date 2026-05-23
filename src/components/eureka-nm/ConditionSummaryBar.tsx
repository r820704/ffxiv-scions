import { useMemo } from 'react';
import type { EurekaNm } from '@/data/eureka-nm-data';
import type { EurekaZone } from '@/data/weather-data';
import { weatherNamesTw, zoneShortNamesTw, EUREKA_ZONES } from '@/data/weather-data';
import { eurekaNms } from '@/data/eureka-nm-data';
import { isWeatherActive, msUntilWeather, nextWeatherStart } from '@/utils/weather-data-runtime';
import { isDayTime, getNextTransition } from '@/utils/game-day-night';
import { toEorzeaTime } from '@/utils/eorzea-time';
import { currentRunRemaining } from '@/utils/weather-engine';
import WeatherIcon from '@/components/WeatherIcon';
import { ConditionChip } from './ConditionChip';
import type { ConditionStatus } from '@/types/nm-tracker';
import { NM_SOON_THRESHOLD_MS } from '@/types/nm-tracker';
import { formatRemain } from './TriggerCell';

function statusFromMs(currentlyActive: boolean, msToNext: number): ConditionStatus {
  if (currentlyActive) return 'met';
  if (msToNext > 0 && msToNext <= NM_SOON_THRESHOLD_MS) return 'soon';
  if (Number.isFinite(msToNext) && msToNext > NM_SOON_THRESHOLD_MS) return 'distant';
  return 'idle';
}

const STATUS_ORDER: Record<ConditionStatus, number> = {
  met: 0,
  soon: 1,
  distant: 2,
  idle: 3,
};


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

  const activeTimeOfDayChip = (
    <ConditionChip
      key={isNightNow ? 'night' : 'day'}
      icon={<span aria-hidden="true">{isNightNow ? '🌙' : '☀'}</span>}
      label={isNightNow ? '夜間' : '白天'}
      status="met"
      remainText={formatRemain(msToTransition, '剩')}
    />
  );

  const weatherEntries = weathers.map(w => {
    const active = isWeatherActive(zone, w, now);
    const msToNext = msUntilWeather(zone, w, now);
    const status = statusFromMs(active, msToNext);
    const remain = active
      ? formatRemain(currentRunRemaining(zone, w, now) ?? 0, '剩')
      : formatRemain(msToNext, '再');
    const tw = weatherNamesTw[w] ?? w;
    const nextTs = active ? nextWeatherStart(zone, w, now) : null;
    const nextText = nextTs != null ? formatRemain(nextTs - now, '再') : undefined;
    return { w, status, remain, tw, nextText: nextText || undefined };
  });
  const sortedWeather = weatherEntries.slice().sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const weatherChips = sortedWeather.map(e => (
    <ConditionChip
      key={e.w}
      icon={<WeatherIcon weatherEn={e.w} weatherTw={e.tw} size={14} />}
      label={e.tw}
      status={e.status}
      remainText={e.remain}
      nextText={e.nextText}
    />
  ));

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-2 mb-2">
      {activeTimeOfDayChip}
      {weatherChips}
    </div>
  );
}

interface CustomProps { nms: EurekaNm[]; now: number; }

export function CustomConditionSummaryBar({ nms, now }: CustomProps) {
  const { needsTimeOfDay, weatherPairs } = useMemo(() => {
    let needsTimeOfDay = false;
    const seen = new Set<string>();
    const pairs: { zone: EurekaZone; weather: string }[] = [];
    for (const nm of nms) {
      if (nm.trigger?.mob?.timeOfDay || nm.trigger?.nm?.timeOfDay) {
        needsTimeOfDay = true;
      }
      const collect = (ws?: string[]) => {
        ws?.forEach(w => {
          const key = `${nm.zone}|${w}`;
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push({ zone: nm.zone, weather: w });
          }
        });
      };
      collect(nm.trigger?.mob?.weather);
      collect(nm.trigger?.nm?.weather);
    }
    pairs.sort((a, b) => {
      const za = EUREKA_ZONES.indexOf(a.zone);
      const zb = EUREKA_ZONES.indexOf(b.zone);
      if (za !== zb) return za - zb;
      return a.weather.localeCompare(b.weather);
    });
    return { needsTimeOfDay, weatherPairs: pairs };
  }, [nms]);

  if (!needsTimeOfDay && weatherPairs.length === 0) return null;

  const uniqueZones = new Set(weatherPairs.map(p => p.zone));
  const multiZone = uniqueZones.size > 1;

  const et = toEorzeaTime(now);
  const isNightNow = !isDayTime(et);
  const msToTransition = getNextTransition(now);

  const activeTimeOfDayChip = needsTimeOfDay ? (
    <ConditionChip
      key={isNightNow ? 'night' : 'day'}
      icon={<span aria-hidden="true">{isNightNow ? '🌙' : '☀'}</span>}
      label={isNightNow ? '夜間' : '白天'}
      status="met"
      remainText={formatRemain(msToTransition, '剩')}
    />
  ) : null;

  const weatherEntries = weatherPairs.map(({ zone, weather }) => {
    const active = isWeatherActive(zone, weather, now);
    const msToNext = msUntilWeather(zone, weather, now);
    const status = statusFromMs(active, msToNext);
    const remain = active
      ? formatRemain(currentRunRemaining(zone, weather, now) ?? 0, '剩')
      : formatRemain(msToNext, '再');
    const tw = weatherNamesTw[weather] ?? weather;
    const zoneTw = zoneShortNamesTw[zone] ?? zone;
    const label = multiZone ? `${tw}（${zoneTw}）` : tw;
    const nextTs = active ? nextWeatherStart(zone, weather, now) : null;
    const nextText = nextTs != null ? formatRemain(nextTs - now, '再') : undefined;
    return {
      key: `${zone}|${weather}`,
      weather,
      tw,
      label,
      status,
      remain,
      nextText: nextText || undefined,
    };
  });
  const sortedWeather = weatherEntries.slice().sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const weatherChips = sortedWeather.map(e => (
    <ConditionChip
      key={e.key}
      icon={<WeatherIcon weatherEn={e.weather} weatherTw={e.tw} size={14} />}
      label={e.label}
      status={e.status}
      remainText={e.remain}
      nextText={e.nextText}
    />
  ));

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-2 mb-2">
      {activeTimeOfDayChip}
      {weatherChips}
    </div>
  );
}
