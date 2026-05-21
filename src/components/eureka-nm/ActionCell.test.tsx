import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ActionCell } from './ActionCell';

afterEach(() => cleanup());

describe('ActionCell — toggle button', () => {
  it('renders ✓出現 when no record', () => {
    render(<ActionCell hasRecord={false} state="neutral" onPop={vi.fn()} onClear={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/記錄 Pazuzu 出現/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/重置 Pazuzu/)).not.toBeInTheDocument();
  });

  it('renders ↺重置 when has record and still in cooldown (neutral)', () => {
    render(<ActionCell hasRecord={true} state="neutral" onPop={vi.fn()} onClear={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/重置 Pazuzu 記錄/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/記錄 Pazuzu 出現/)).not.toBeInTheDocument();
  });

  it('renders ↺重置 when has record and weather is soon (amber)', () => {
    render(<ActionCell hasRecord={true} state="amber" onPop={vi.fn()} onClear={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/重置 Pazuzu 記錄/)).toBeInTheDocument();
  });

  it('flips back to ✓出現 once cooldown ready (state=green) even if a stale record exists', () => {
    render(<ActionCell hasRecord={true} state="green" onPop={vi.fn()} onClear={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/記錄 Pazuzu 出現/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/重置 Pazuzu/)).not.toBeInTheDocument();
  });

  it('clicking 出現 (no record) calls onPop', () => {
    const onPop = vi.fn();
    render(<ActionCell hasRecord={false} state="neutral" onPop={onPop} onClear={vi.fn()} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/記錄 Pazuzu 出現/));
    expect(onPop).toHaveBeenCalledTimes(1);
  });

  it('clicking 重置 (has record, neutral) calls onClear', () => {
    const onClear = vi.fn();
    render(<ActionCell hasRecord={true} state="neutral" onPop={vi.fn()} onClear={onClear} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/重置 Pazuzu 記錄/));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('clicking 出現 (stale record, state=green) calls onPop to overwrite', () => {
    const onPop = vi.fn();
    render(<ActionCell hasRecord={true} state="green" onPop={onPop} onClear={vi.fn()} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/記錄 Pazuzu 出現/));
    expect(onPop).toHaveBeenCalledTimes(1);
  });
});
