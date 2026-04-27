import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WeatherSummaryBar from './WeatherSummaryBar';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';

afterEach(cleanup);

const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

describe('WeatherSummaryBar', () => {
  it('renders nothing when selected is empty', () => {
    const { container } = render(
      <WeatherSummaryBar selected={new Set()} now={fixedNow} forecastCount={48} onScrollToCell={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders one row per selected weather', () => {
    render(
      <WeatherSummaryBar
        selected={new Set(['Gales', 'Fog'])}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByText(/強風/)).toBeTruthy();
    expect(screen.getByText(/薄霧/)).toBeTruthy();
  });

  it('renders night filter row with 🌙 marker', () => {
    render(
      <WeatherSummaryBar
        selected={new Set([NIGHT_FILTER_KEY])}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByText(/夜間/)).toBeTruthy();
  });

  it('shows empty-state message when filter has no hits in any zone', () => {
    render(
      <WeatherSummaryBar
        selected={new Set(['NonExistentWeather'])}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByText(/張地圖無此/)).toBeTruthy();
  });

  it('calls onScrollToCell with zone + cellIndex when a hit is clicked', () => {
    const onScrollToCell = vi.fn();
    render(
      <WeatherSummaryBar
        selected={new Set(['Gales'])}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={onScrollToCell}
      />,
    );
    // Find a hit button (contains zone name) and click it
    const hits = screen.getAllByRole('button');
    expect(hits.length).toBeGreaterThan(0);
    fireEvent.click(hits[0]!);
    expect(onScrollToCell).toHaveBeenCalled();
  });
});
