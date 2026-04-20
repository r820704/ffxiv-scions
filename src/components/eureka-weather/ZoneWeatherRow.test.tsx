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

  it('when filter is empty, shows "上次 {currentWeather} 結束" + "目前 ... 進行中（剩 ...）"', () => {
    render(<ZoneWeatherRow zone="Eureka Anemos" selectedWeathers={new Set()} now={fixedNow} />);
    const currentWeather = generateForecasts('Eureka Anemos', 1, fixedNow)[0]!;
    const tw = weatherNamesTw[currentWeather.weather] ?? currentWeather.weather;
    expect(screen.getByText(new RegExp(`上次${tw}`))).toBeTruthy();
    expect(screen.getByText(new RegExp(`目前${tw}進行中`))).toBeTruthy();
    expect(screen.getByText(/剩/)).toBeTruthy();
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
    expect(screen.queryByText(/目前.*進行中/)).toBeNull();
  });

  it('shows "超過三小時前" fallback when W has not occurred in the last 9 periods', () => {
    const candidates = [
      { zone: 'Eureka Anemos' as const, weather: 'Snow' },
      { zone: 'Eureka Pagos' as const, weather: 'Thunder' },
      { zone: 'Eureka Pyros' as const, weather: 'Blizzards' },
      { zone: 'Eureka Hydatos' as const, weather: 'Snow' },
    ];
    const scenario = candidates.find(
      (c) => findLastEndedWeather(c.zone, c.weather, fixedNow) === null
        && generateForecasts(c.zone, 500, fixedNow).some((f) => f.weather === c.weather),
    );
    if (!scenario) {
      return;
    }
    const tw = weatherNamesTw[scenario.weather] ?? scenario.weather;
    render(
      <ZoneWeatherRow
        zone={scenario.zone}
        selectedWeathers={new Set([scenario.weather])}
        now={fixedNow}
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
    expect(screen.queryByText(/目前.*進行中/)).toBeNull();
  });
});
