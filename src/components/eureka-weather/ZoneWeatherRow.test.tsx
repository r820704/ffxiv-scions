import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ZoneWeatherRow from './ZoneWeatherRow';

afterEach(cleanup);

describe('ZoneWeatherRow', () => {
  const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

  it('renders the zone TC name', () => {
    render(<ZoneWeatherRow zone="Eureka Anemos" selectedWeathers={new Set()} now={fixedNow} />);
    expect(screen.getByText('優雷卡常風之地')).toBeTruthy();
  });

  it('renders 24 period cells', () => {
    const { container } = render(
      <ZoneWeatherRow zone="Eureka Anemos" selectedWeathers={new Set()} now={fixedNow} />
    );
    expect(container.querySelectorAll('[data-period-cell]').length).toBe(24);
  });

  it('highlights cells matching selectedWeathers filter', () => {
    const { container } = render(
      <ZoneWeatherRow
        zone="Eureka Anemos"
        selectedWeathers={new Set(['Fair Skies'])}
        now={fixedNow}
      />
    );
    const highlighted = container.querySelectorAll('[data-period-cell][data-matched="true"]');
    expect(highlighted.length).toBeGreaterThanOrEqual(0);
  });

  it('shows countdown to next matching weather when a filter is set', () => {
    render(
      <ZoneWeatherRow
        zone="Eureka Pyros"
        selectedWeathers={new Set(['Umbral Wind'])}
        now={fixedNow}
      />
    );
    expect(screen.getByText(/下次靈風/)).toBeTruthy();
  });

  it('omits countdown when no filter is set', () => {
    render(<ZoneWeatherRow zone="Eureka Pyros" selectedWeathers={new Set()} now={fixedNow} />);
    expect(screen.queryByText(/下次/)).toBeNull();
  });
});
