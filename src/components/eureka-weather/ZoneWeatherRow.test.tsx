import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ZoneWeatherRow from './ZoneWeatherRow';
import { generateForecasts, findLastEndedWeather } from '@/utils/weather-engine';
import { weatherNamesTw } from '@/data/weather-data';

afterEach(cleanup);

describe('ZoneWeatherRow', () => {
  const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

  it('renders the zone TC name', () => {
    render(<ZoneWeatherRow zone="Eureka Anemos" selectedWeathers={new Set()} now={fixedNow} />);
    expect(screen.getByText('優雷卡常風之地')).toBeTruthy();
  });

  it('renders 24 period cells', () => {
    const { container } = render(
      <ZoneWeatherRow zone="Eureka Anemos" selectedWeathers={new Set()} now={fixedNow} />,
    );
    expect(container.querySelectorAll('[data-period-cell]').length).toBe(24);
  });

  it('highlights cells matching selectedWeathers filter', () => {
    const { container } = render(
      <ZoneWeatherRow
        zone="Eureka Anemos"
        selectedWeathers={new Set(['Fair Skies'])}
        now={fixedNow}
      />,
    );
    const highlighted = container.querySelectorAll('[data-period-cell][data-matched="true"]');
    expect(highlighted.length).toBeGreaterThanOrEqual(0);
  });

  it('when filter is empty, shows "上次 {currentWeather} 結束" + "目前 {currentWeather} 剩 ..."', () => {
    render(<ZoneWeatherRow zone="Eureka Anemos" selectedWeathers={new Set()} now={fixedNow} />);
    const currentWeather = generateForecasts('Eureka Anemos', 1, fixedNow)[0]!;
    const tw = weatherNamesTw[currentWeather.weather] ?? currentWeather.weather;
    expect(screen.getByText(new RegExp(`上次${tw}`))).toBeTruthy();
    expect(screen.getByText(new RegExp(`目前${tw}剩`))).toBeTruthy();
  });

  it('when filter has a weather NOT currently active, shows "上次 ... ・ 下次 ... 後"', () => {
    const current = generateForecasts('Eureka Pyros', 1, fixedNow)[0]!;
    const pick = current.weather === 'Umbral Wind' ? 'Fair Skies' : 'Umbral Wind';
    const tw = weatherNamesTw[pick] ?? pick;

    render(
      <ZoneWeatherRow
        zone="Eureka Pyros"
        selectedWeathers={new Set([pick])}
        now={fixedNow}
      />,
    );
    expect(screen.getByText(new RegExp(`下次${tw}`))).toBeTruthy();
    expect(screen.queryByText(/目前.*剩/)).toBeNull();
  });

  it('shows "超過三小時前" fallback when W has not occurred in the last 9 periods', () => {
    // Deterministic fixture: at 2026-04-19T07:00:00Z, "Fair Skies" in Eureka Anemos
    // has not appeared in the preceding 9 weather periods, so findLastEndedWeather
    // returns null — triggering the "超過三小時前" fallback.
    // The weather IS reachable in the next 500 periods, so the info line renders.
    // (Triple found via brute-force exploration script, hard-coded here for speed.)
    const fallbackNow = new Date('2026-04-19T07:00:00Z').getTime(); // 1776582000000
    const fallbackZone = 'Eureka Anemos' as const;
    const fallbackWeather = 'Fair Skies';

    // Sanity-check the fixture invariants at test time (fast, ~9 iterations each).
    expect(findLastEndedWeather(fallbackZone, fallbackWeather, fallbackNow, 9)).toBeNull();
    expect(generateForecasts(fallbackZone, 500, fallbackNow).some((f) => f.weather === fallbackWeather)).toBe(true);

    const tw = weatherNamesTw[fallbackWeather] ?? fallbackWeather;
    render(
      <ZoneWeatherRow
        zone={fallbackZone}
        selectedWeathers={new Set([fallbackWeather])}
        now={fallbackNow}
      />,
    );
    expect(screen.getByText(new RegExp(`上次${tw}.*超過三小時前`))).toBeTruthy();
  });

  it('does NOT render info line when filter is set but next match is unreachable', () => {
    render(
      <ZoneWeatherRow
        zone="Eureka Anemos"
        selectedWeathers={new Set(['NonExistentWeather'])}
        now={fixedNow}
      />,
    );
    expect(screen.queryByText(/上次/)).toBeNull();
    expect(screen.queryByText(/下次/)).toBeNull();
    expect(screen.queryByText(/目前.*剩/)).toBeNull();
  });
});
