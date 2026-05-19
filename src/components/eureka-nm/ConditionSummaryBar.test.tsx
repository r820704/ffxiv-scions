import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ConditionSummaryBar } from './ConditionSummaryBar';

vi.mock('@/utils/weather-data-runtime', () => ({
  isWeatherActive: () => false,
  msUntilWeather: () => 30 * 60_000,
}));

afterEach(() => cleanup());

describe('ConditionSummaryBar', () => {
  it('renders day + night chips always', () => {
    render(<ConditionSummaryBar zone="Eureka Anemos" now={Date.now()} />);
    expect(screen.getByText('晝')).toBeInTheDocument();
    expect(screen.getByText('夜')).toBeInTheDocument();
  });

  it('renders weather chips for Anemos (includes Gales)', () => {
    render(<ConditionSummaryBar zone="Eureka Anemos" now={Date.now()} />);
    expect(screen.getByText('Gales')).toBeInTheDocument();
  });

  it('renders multiple weather chips for Pagos', () => {
    render(<ConditionSummaryBar zone="Eureka Pagos" now={Date.now()} />);
    // Pagos has Fog, Thunder, Heat Waves, Blizzards
    expect(screen.getByText('Fog')).toBeInTheDocument();
    expect(screen.getByText('Thunder')).toBeInTheDocument();
    expect(screen.getByText('Heat Waves')).toBeInTheDocument();
    expect(screen.getByText('Blizzards')).toBeInTheDocument();
  });
});
