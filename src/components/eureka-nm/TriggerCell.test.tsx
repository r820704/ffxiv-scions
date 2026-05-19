import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TriggerCell } from './TriggerCell';
import { eurekaNms } from '@/data/eureka-nm-data';

vi.mock('@/utils/weather-data-runtime', () => ({
  isWeatherActive: () => true,
  msUntilWeather: () => 0,
}));

afterEach(() => cleanup());

describe('TriggerCell', () => {
  it('renders 常駐 for NM without trigger', () => {
    const sabotender = eurekaNms.find(n => n.id === 'sabotender-corrido')!;
    render(<TriggerCell nm={sabotender} now={Date.now()} />);
    expect(screen.getByText('常駐')).toBeInTheDocument();
  });

  it('renders NM需 segment for cassie (only NM condition)', () => {
    const cassie = eurekaNms.find(n => n.id === 'copycat-cassie')!;
    render(<TriggerCell nm={cassie} now={Date.now()} />);
    expect(screen.getByText('NM需')).toBeInTheDocument();
  });

  it('renders both segments for pazuzu (mob + NM)', () => {
    const pazuzu = eurekaNms.find(n => n.id === 'pazuzu')!;
    render(<TriggerCell nm={pazuzu} now={Date.now()} />);
    expect(screen.getByText('NM需')).toBeInTheDocument();
    // Mob segment includes "・" separator after mob name
    expect(screen.getByText(/・/)).toBeInTheDocument();
  });

  it('renders only mob segment for jahannam (only mob condition)', () => {
    const jahannam = eurekaNms.find(n => n.id === 'jahannam')!;
    render(<TriggerCell nm={jahannam} now={Date.now()} />);
    expect(screen.getByText(/・/)).toBeInTheDocument();
    expect(screen.queryByText('NM需')).not.toBeInTheDocument();
  });
});
