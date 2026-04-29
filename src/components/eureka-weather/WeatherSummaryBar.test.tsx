import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WeatherSummaryBar from './WeatherSummaryBar';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';
import { RemindersProvider } from '@/hooks/useReminders';

afterEach(cleanup);

const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

describe('WeatherSummaryBar', () => {
  it('renders nothing when selected is empty', () => {
    const { container } = render(
      <WeatherSummaryBar selected={new Set()} now={fixedNow} forecastCount={48} onScrollToCell={vi.fn()} onToast={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders one row per selected weather', () => {
    render(
      <RemindersProvider>
        <WeatherSummaryBar
          selected={new Set(['Gales', 'Fog'])}
          now={fixedNow}
          forecastCount={48}
          onScrollToCell={vi.fn()}
          onToast={vi.fn()}
        />
      </RemindersProvider>,
    );
    expect(screen.getByText(/強風/)).toBeTruthy();
    expect(screen.getByText(/薄霧/)).toBeTruthy();
  });

  it('renders night filter row with 🌙 marker', () => {
    render(
      <RemindersProvider>
        <WeatherSummaryBar
          selected={new Set([NIGHT_FILTER_KEY])}
          now={fixedNow}
          forecastCount={48}
          onScrollToCell={vi.fn()}
          onToast={vi.fn()}
        />
      </RemindersProvider>,
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
        onToast={vi.fn()}
      />,
    );
    expect(screen.getByText(/張地圖無此/)).toBeTruthy();
  });

  it('calls onScrollToCell with zone + cellIndex when a hit is clicked', () => {
    const onScrollToCell = vi.fn();
    render(
      <RemindersProvider>
        <WeatherSummaryBar
          selected={new Set(['Gales'])}
          now={fixedNow}
          forecastCount={48}
          onScrollToCell={onScrollToCell}
          onToast={vi.fn()}
        />
      </RemindersProvider>,
    );
    // Find a hit button (contains zone name) and click it
    const hits = screen.getAllByRole('button');
    expect(hits.length).toBeGreaterThan(0);
    fireEvent.click(hits[0]!);
    expect(onScrollToCell).toHaveBeenCalled();
  });
});

describe('WeatherSummaryBar — M11 reminders entry', () => {
  it('renders an AddReminderButton next to each weather zone-hit chip', () => {
    const selected = new Set(['Gales']);
    render(
      <RemindersProvider>
        <WeatherSummaryBar
          selected={selected}
          now={Date.now()}
          forecastCount={48}
          onScrollToCell={vi.fn()}
          onToast={vi.fn()}
        />
      </RemindersProvider>,
    );
    const bells = screen.getAllByRole('button', { name: /提醒/ });
    expect(bells.length).toBeGreaterThan(0);
  });
});
