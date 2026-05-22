import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CooldownCell } from './CooldownCell';
import { eurekaNms } from '@/data/eureka-nm-data';

afterEach(() => cleanup());

const pazuzu = eurekaNms.find(n => n.id === 'pazuzu')!;

describe('CooldownCell', () => {
  it('renders -- when not tracked and row is neutral', () => {
    render(
      <CooldownCell nm={pazuzu} record={undefined} state="neutral" now={Date.now()} onSetCustom={vi.fn()} />,
    );
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders HH:MM:SS countdown when CD running', () => {
    const now = Date.now();
    render(
      <CooldownCell
        nm={pazuzu}
        record={{ popAt: now - 60 * 60 * 1000 }}
        state="neutral"
        now={now}
        onSetCustom={vi.fn()}
      />,
    );
    expect(screen.getByText(/01:00:0\d/)).toBeInTheDocument();
  });

  it('renders 可觸發 when row state is green', () => {
    const now = Date.now();
    render(
      <CooldownCell
        nm={pazuzu}
        record={{ popAt: now - 3 * 60 * 60 * 1000 }}
        state="green"
        now={now}
        onSetCustom={vi.fn()}
      />,
    );
    expect(screen.getByText('可觸發')).toBeInTheDocument();
  });

  it('renders 提前觸發 when row state is amber', () => {
    const now = Date.now();
    render(
      <CooldownCell
        nm={pazuzu}
        record={{ popAt: now - 3 * 60 * 60 * 1000 }}
        state="amber"
        now={now}
        onSetCustom={vi.fn()}
      />,
    );
    expect(screen.getByText('提前觸發')).toBeInTheDocument();
  });

  it('renders -- when CD elapsed AND row state is neutral (waiting on conditions)', () => {
    const now = Date.now();
    const { container } = render(
      <CooldownCell
        nm={pazuzu}
        record={{ popAt: now - 3 * 60 * 60 * 1000 }}
        state="neutral"
        now={now}
        onSetCustom={vi.fn()}
      />,
    );
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.queryByText('可觸發')).not.toBeInTheDocument();
    expect(screen.queryByText('提前觸發')).not.toBeInTheDocument();
    // No HH:MM:SS either (CD elapsed = remain 0)
    expect(container.querySelector('.tabular-nums')).toBeNull();
  });

  it('renders 可觸發 even without record when row state is green (常駐 NM scenario)', () => {
    render(
      <CooldownCell nm={pazuzu} record={undefined} state="green" now={Date.now()} onSetCustom={vi.fn()} />,
    );
    expect(screen.getByText('可觸發')).toBeInTheDocument();
  });

  it('clicking cell opens CustomTimeDialog', () => {
    render(
      <CooldownCell nm={pazuzu} record={undefined} state="neutral" now={Date.now()} onSetCustom={vi.fn()} />,
    );
    fireEvent.click(screen.getByLabelText(/自訂 帕祖祖 出現時間/));
    expect(
      screen.getByText(/自訂 帕祖祖 出現時間/, { selector: 'h2,h3,[role="heading"]' }),
    ).toBeInTheDocument();
  });

  it('click event stops propagation (does not bubble to row)', () => {
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <CooldownCell
          nm={pazuzu}
          record={undefined}
          state="neutral"
          now={Date.now()}
          onSetCustom={vi.fn()}
        />
      </div>,
    );
    fireEvent.click(screen.getByLabelText(/自訂 帕祖祖 出現時間/));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
