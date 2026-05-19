import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ActionCell } from './ActionCell';

afterEach(() => cleanup());

describe('ActionCell', () => {
  it('renders ✓出現 button', () => {
    render(<ActionCell onPop={vi.fn()} onClear={vi.fn()} onSetCustom={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByLabelText(/記錄 Pazuzu 出現/)).toBeInTheDocument();
  });

  it('clicking 出現 calls onPop', () => {
    const onPop = vi.fn();
    render(<ActionCell onPop={onPop} onClear={vi.fn()} onSetCustom={vi.fn()} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/記錄 Pazuzu 出現/));
    expect(onPop).toHaveBeenCalled();
  });

  it('clicking ↺ calls onClear', () => {
    const onClear = vi.fn();
    render(<ActionCell onPop={vi.fn()} onClear={onClear} onSetCustom={vi.fn()} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/重置 Pazuzu 記錄/));
    expect(onClear).toHaveBeenCalled();
  });

  it('clicking ✏ opens CustomTimeDialog', () => {
    render(<ActionCell onPop={vi.fn()} onClear={vi.fn()} onSetCustom={vi.fn()} nmName="Pazuzu" />);
    fireEvent.click(screen.getByLabelText(/自訂 Pazuzu/));
    expect(screen.getByText(/自訂 Pazuzu 出現時間/)).toBeInTheDocument();
  });
});
