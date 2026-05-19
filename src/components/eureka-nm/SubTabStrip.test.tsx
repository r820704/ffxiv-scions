import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SubTabStrip } from './SubTabStrip';

afterEach(() => cleanup());

describe('SubTabStrip', () => {
  it('renders 5 tabs + ↻ button', () => {
    render(<SubTabStrip activeTab="Eureka Anemos" onTabChange={vi.fn()} onClearAll={vi.fn()} />);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByLabelText('清除全部記錄')).toBeInTheDocument();
  });

  it('clicking tab calls onTabChange', () => {
    const onTabChange = vi.fn();
    render(<SubTabStrip activeTab="Eureka Anemos" onTabChange={onTabChange} onClearAll={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: /Pagos/i }));
    expect(onTabChange).toHaveBeenCalledWith('Eureka Pagos');
  });

  it('clicking ↻ opens confirm dialog (does NOT call onClearAll yet)', () => {
    const onClearAll = vi.fn();
    render(<SubTabStrip activeTab="Eureka Anemos" onTabChange={vi.fn()} onClearAll={onClearAll} />);
    fireEvent.click(screen.getByLabelText('清除全部記錄'));
    expect(screen.getByText(/清除所有 NM 記錄/)).toBeInTheDocument();
    expect(onClearAll).not.toHaveBeenCalled();
  });

  it('confirming dialog calls onClearAll', () => {
    const onClearAll = vi.fn();
    render(<SubTabStrip activeTab="Eureka Anemos" onTabChange={vi.fn()} onClearAll={onClearAll} />);
    fireEvent.click(screen.getByLabelText('清除全部記錄'));
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('cancelling dialog does NOT call onClearAll', () => {
    const onClearAll = vi.fn();
    render(<SubTabStrip activeTab="Eureka Anemos" onTabChange={vi.fn()} onClearAll={onClearAll} />);
    fireEvent.click(screen.getByLabelText('清除全部記錄'));
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClearAll).not.toHaveBeenCalled();
  });
});
