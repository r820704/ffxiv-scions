import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MobConditionCell, NmConditionCell, MergedConditionCellMobile } from './TriggerCell';
import { eurekaNms } from '@/data/eureka-nm-data';

vi.mock('@/utils/weather-data-runtime', () => ({
  isWeatherActive: () => true,
  msUntilWeather: () => 0,
}));

afterEach(() => cleanup());

const sabotender = eurekaNms.find(n => n.id === 'sabotender-corrido')!;  // no trigger
const cassie = eurekaNms.find(n => n.id === 'copycat-cassie')!;          // only NM condition
const pazuzu = eurekaNms.find(n => n.id === 'pazuzu')!;                  // both
const jahannam = eurekaNms.find(n => n.id === 'jahannam')!;              // only mob condition

describe('MobConditionCell', () => {
  it('renders — for NM with no mob condition (cassie)', () => {
    render(<MobConditionCell nm={cassie} now={Date.now()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders mob name + condition for pazuzu (night)', () => {
    render(<MobConditionCell nm={pazuzu} now={Date.now()} />);
    expect(screen.getByText(/・/)).toBeInTheDocument();
  });

  it('renders mob name + Gales weather for jahannam', () => {
    render(<MobConditionCell nm={jahannam} now={Date.now()} />);
    expect(screen.getByText(/・/)).toBeInTheDocument();
  });

  it('renders — for sabotender (no trigger at all)', () => {
    render(<MobConditionCell nm={sabotender} now={Date.now()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('NmConditionCell', () => {
  it('renders — for NM with no own condition (jahannam — only mob trigger)', () => {
    render(<NmConditionCell nm={jahannam} now={Date.now()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders weather label for pazuzu (Gales)', () => {
    render(<NmConditionCell nm={pazuzu} now={Date.now()} />);
    expect(screen.getByText('強風')).toBeInTheDocument();
  });

  it('renders — for sabotender (no trigger at all)', () => {
    render(<NmConditionCell nm={sabotender} now={Date.now()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('MergedConditionCellMobile', () => {
  it('renders — for 常駐 NM (no conditions)', () => {
    render(<MergedConditionCellMobile nm={sabotender} now={Date.now()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders ｜ separator when both mob and NM conditions exist (pazuzu)', () => {
    render(<MergedConditionCellMobile nm={pazuzu} now={Date.now()} />);
    expect(screen.getByText('｜')).toBeInTheDocument();
  });

  it('renders ｜ with — placeholder on right when only mob condition (jahannam)', () => {
    render(<MergedConditionCellMobile nm={jahannam} now={Date.now()} />);
    expect(screen.getByText('｜')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders ｜ with — placeholder on left when only NM condition (cassie)', () => {
    render(<MergedConditionCellMobile nm={cassie} now={Date.now()} />);
    expect(screen.getByText('｜')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
