import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CooldownCell } from './CooldownCell';
import { eurekaNms } from '@/data/eureka-nm-data';

afterEach(() => cleanup());

const pazuzu = eurekaNms.find(n => n.id === 'pazuzu')!;

describe('CooldownCell', () => {
  it('renders -- when no popAt', () => {
    render(<CooldownCell nm={pazuzu} record={undefined} now={Date.now()} onSetCustom={vi.fn()} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders HH:MM:SS countdown when CD running', () => {
    const now = Date.now();
    render(<CooldownCell nm={pazuzu} record={{ popAt: now - 60 * 60 * 1000 }} now={now} onSetCustom={vi.fn()} />);
    // 1h ago + 2h CD → remain 1h
    const cd = screen.getByText(/01:00:0\d/);
    expect(cd).toBeInTheDocument();
  });

  it('renders 「可打」 when CD elapsed', () => {
    const now = Date.now();
    render(<CooldownCell nm={pazuzu} record={{ popAt: now - 3 * 60 * 60 * 1000 }} now={now} onSetCustom={vi.fn()} />);
    expect(screen.getByText('可打')).toBeInTheDocument();
  });

  it('clicking cell opens CustomTimeDialog', () => {
    render(<CooldownCell nm={pazuzu} record={undefined} now={Date.now()} onSetCustom={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/自訂 帕祖祖 出現時間/));
    expect(screen.getByText(/自訂 帕祖祖 出現時間/, { selector: 'h2,h3,[role="heading"]' })).toBeInTheDocument();
  });

  it('click event stops propagation (does not bubble to row)', () => {
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <CooldownCell nm={pazuzu} record={undefined} now={Date.now()} onSetCustom={vi.fn()} />
      </div>
    );
    fireEvent.click(screen.getByLabelText(/自訂 帕祖祖 出現時間/));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
