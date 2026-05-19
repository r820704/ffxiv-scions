import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CooldownCell } from './CooldownCell';
import { eurekaNms } from '@/data/eureka-nm-data';

afterEach(() => cleanup());

const pazuzu = eurekaNms.find(n => n.id === 'pazuzu')!;

describe('CooldownCell', () => {
  it('renders -- when no popAt', () => {
    render(<CooldownCell nm={pazuzu} record={undefined} now={Date.now()} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders HH:MM:SS countdown when CD running', () => {
    const now = Date.now();
    render(<CooldownCell nm={pazuzu} record={{ popAt: now - 60 * 60 * 1000 }} now={now} />);
    // 1h ago + 2h CD → remain 1h
    const cd = screen.getByText(/01:00:0\d/);
    expect(cd).toBeInTheDocument();
  });

  it('renders 「可打」 when CD elapsed', () => {
    const now = Date.now();
    render(<CooldownCell nm={pazuzu} record={{ popAt: now - 3 * 60 * 60 * 1000 }} now={now} />);
    expect(screen.getByText('可打')).toBeInTheDocument();
  });
});
