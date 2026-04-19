import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GearFilterBar from './GearFilterBar';
import type { GearFilterState } from '@/types/eureka-gear';

afterEach(() => cleanup());

function emptyFilter(): GearFilterState {
  return {
    search: '', stages: new Set(), slots: new Set(), jobs: new Set(), tags: new Set(),
    display: 'all', sort: 'stage',
  };
}

describe('GearFilterBar', () => {
  it('calls onChange with new search value', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={emptyFilter()} onChange={fn} />);
    fireEvent.change(screen.getByPlaceholderText('搜尋'), { target: { value: '刀' } });
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ search: '刀' }));
  });

  it('toggles stage chip', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={emptyFilter()} onChange={fn} />);
    fireEvent.click(screen.getByRole('button', { name: 'anemos' }));
    const arg = fn.mock.calls[0]?.[0] as GearFilterState;
    expect(arg.stages.has('anemos')).toBe(true);
  });

  it('switches display mode to "可兌換"', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={emptyFilter()} onChange={fn} />);
    fireEvent.click(screen.getByRole('radio', { name: '可兌換' }));
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ display: 'affordable' }));
  });

  it('switches display mode to "已持有"', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={emptyFilter()} onChange={fn} />);
    fireEvent.click(screen.getByRole('radio', { name: '已持有' }));
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ display: 'owned' }));
  });
});
