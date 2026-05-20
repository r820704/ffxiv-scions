import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ActionCell } from './ActionCell';

afterEach(() => cleanup());

describe('ActionCell — toggle button', () => {
  it('renders ✓出現 when no record', () => {
    render(<ActionCell hasRecord={false} onPop={vi.fn()} onClear={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/記錄 Pazuzu 出現/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/重置 Pazuzu/)).not.toBeInTheDocument();
  });

  it('renders ↺重置 when has record', () => {
    render(<ActionCell hasRecord={true} onPop={vi.fn()} onClear={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/重置 Pazuzu 記錄/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/記錄 Pazuzu 出現/)).not.toBeInTheDocument();
  });

  it('clicking 出現 (no record) calls onPop', () => {
    const onPop = vi.fn();
    render(<ActionCell hasRecord={false} onPop={onPop} onClear={vi.fn()} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/記錄 Pazuzu 出現/));
    expect(onPop).toHaveBeenCalledTimes(1);
  });

  it('clicking 重置 (has record) calls onClear', () => {
    const onClear = vi.fn();
    render(<ActionCell hasRecord={true} onPop={vi.fn()} onClear={onClear} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/重置 Pazuzu 記錄/));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
