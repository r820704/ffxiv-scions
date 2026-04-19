import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GearFilterBar from './GearFilterBar';
import type { GearFilterState } from '@/types/eureka-gear';

afterEach(() => cleanup());

function empty(): GearFilterState {
  return {
    search: '', jobs: new Set(), stages: new Set(),
    onlyUpgradable: false, onlyCompleted: false, sort: 'role',
  };
}

describe('GearFilterBar', () => {
  it('emits search change', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={empty()} onChange={fn} />);
    fireEvent.change(screen.getByPlaceholderText('搜尋武器或職業'), { target: { value: '龍鬚' } });
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ search: '龍鬚' }));
  });

  it('toggles job filter via TC label', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={empty()} onChange={fn} />);
    fireEvent.click(screen.getByRole('button', { name: '龍騎士' }));
    const arg = fn.mock.calls[0]?.[0] as GearFilterState;
    expect(arg.jobs.has('DRG')).toBe(true);
  });

  it('toggles stage filter via TC label', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={empty()} onChange={fn} />);
    fireEvent.click(screen.getByRole('button', { name: '常風' }));
    const arg = fn.mock.calls[0]?.[0] as GearFilterState;
    expect(arg.stages.has('anemos')).toBe(true);
  });

  it('toggles onlyUpgradable checkbox', () => {
    const fn = vi.fn();
    render(<GearFilterBar filter={empty()} onChange={fn} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '僅可升級' }));
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ onlyUpgradable: true }));
  });
});
