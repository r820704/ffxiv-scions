import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ConditionSummaryBar } from './ConditionSummaryBar';

vi.mock('@/utils/weather-data-runtime', () => ({
  isWeatherActive: () => false,
  msUntilWeather: () => 30 * 60_000,
  nextWeatherStart: () => null,
}));

afterEach(() => cleanup());

describe('ConditionSummaryBar', () => {
  it('renders 白天 + 夜間 chips always', () => {
    render(<ConditionSummaryBar zone="Eureka Anemos" now={Date.now()} />);
    expect(screen.getByText('白天')).toBeInTheDocument();
    expect(screen.getByText('夜間')).toBeInTheDocument();
  });

  it('renders weather chips for Anemos using TC weather names (Gales → 強風)', () => {
    render(<ConditionSummaryBar zone="Eureka Anemos" now={Date.now()} />);
    expect(screen.getByText('強風')).toBeInTheDocument();
  });

  it('renders multiple weather chips for Pagos using TC names', () => {
    render(<ConditionSummaryBar zone="Eureka Pagos" now={Date.now()} />);
    // Pagos has Fog/Thunder/Heat Waves/Blizzards → 薄霧/打雷/熱浪/暴雪
    expect(screen.getByText('薄霧')).toBeInTheDocument();
    expect(screen.getByText('打雷')).toBeInTheDocument();
    expect(screen.getByText('熱浪')).toBeInTheDocument();
    expect(screen.getByText('暴雪')).toBeInTheDocument();
  });
});
