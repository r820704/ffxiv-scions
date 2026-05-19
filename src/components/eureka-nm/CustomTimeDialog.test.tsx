import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CustomTimeDialog } from './CustomTimeDialog';

afterEach(() => cleanup());

describe('CustomTimeDialog', () => {
  it('renders preset buttons + datetime-local input', () => {
    render(<CustomTimeDialog open={true} onOpenChange={vi.fn()} nmName="Pazuzu" onConfirm={vi.fn()} />);
    expect(screen.getByText('10 分前')).toBeInTheDocument();
    expect(screen.getByText('30 分前')).toBeInTheDocument();
    expect(screen.getByText('1 小時前')).toBeInTheDocument();
    expect(screen.getByText('90 分前')).toBeInTheDocument();
    expect(screen.getByLabelText(/或選具體時間/)).toBeInTheDocument();
  });

  it('clicking 10 分前 calls onConfirm with ~10min ago', () => {
    const onConfirm = vi.fn();
    const before = Date.now();
    render(<CustomTimeDialog open={true} onOpenChange={vi.fn()} nmName="Pazuzu" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('10 分前'));
    expect(onConfirm).toHaveBeenCalled();
    const arg = onConfirm.mock.calls[0]![0] as number;
    expect(arg).toBeGreaterThanOrEqual(before - 10 * 60_000 - 1000);
    expect(arg).toBeLessThanOrEqual(before - 10 * 60_000 + 1000);
  });

  it('clicking 取消 calls onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    render(<CustomTimeDialog open={true} onOpenChange={onOpenChange} nmName="Pazuzu" onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByText('取消'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
