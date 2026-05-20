import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CustomTimeDialog } from './CustomTimeDialog';

afterEach(() => cleanup());

describe('CustomTimeDialog', () => {
  it('renders 24-hour time input (no date, no preset buttons)', () => {
    render(<CustomTimeDialog open={true} onOpenChange={vi.fn()} nmName="Pazuzu" onConfirm={vi.fn()} />);
    const input = screen.getByLabelText('出現時間（HH:MM）：') as HTMLInputElement;
    expect(input.type).toBe('time');
    expect(screen.queryByText('10 分前')).not.toBeInTheDocument();
    expect(screen.queryByText('30 分前')).not.toBeInTheDocument();
  });

  it('使用此時間 button confirms with chosen HH:MM (popAt always ≤ now)', () => {
    const onConfirm = vi.fn();
    render(<CustomTimeDialog open={true} onOpenChange={vi.fn()} nmName="Pazuzu" onConfirm={onConfirm} />);
    const input = screen.getByLabelText('出現時間（HH:MM）：');
    fireEvent.change(input, { target: { value: '10:30' } });
    fireEvent.click(screen.getByText('使用此時間'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const ts = onConfirm.mock.calls[0]![0] as number;
    const d = new Date(ts);
    expect(d.getHours()).toBe(10);
    expect(d.getMinutes()).toBe(30);
    expect(ts).toBeLessThanOrEqual(Date.now());
  });

  it('時間若解出來在未來，視為昨天同時刻 (popAt ≤ now)', () => {
    const onConfirm = vi.fn();
    render(<CustomTimeDialog open={true} onOpenChange={vi.fn()} nmName="Pazuzu" onConfirm={onConfirm} />);
    const input = screen.getByLabelText('出現時間（HH:MM）：');
    fireEvent.change(input, { target: { value: '23:59' } });
    fireEvent.click(screen.getByText('使用此時間'));
    const ts = onConfirm.mock.calls[0]![0] as number;
    expect(ts).toBeLessThanOrEqual(Date.now());
  });

  it('取消 button closes dialog without confirming', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(<CustomTimeDialog open={true} onOpenChange={onOpenChange} nmName="Pazuzu" onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('取消'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clicks inside DialogContent do not bubble to a parent row onClick', () => {
    const onParent = vi.fn();
    render(
      <div onClick={onParent}>
        <CustomTimeDialog open={true} onOpenChange={vi.fn()} nmName="Pazuzu" onConfirm={vi.fn()} />
      </div>
    );
    fireEvent.click(screen.getByLabelText('出現時間（HH:MM）：'));
    expect(onParent).not.toHaveBeenCalled();
  });
});
