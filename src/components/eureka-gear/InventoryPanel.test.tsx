import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InventoryPanel from './InventoryPanel';

afterEach(() => cleanup());

const mats = [
  { id: 1, tcName: '異質結晶', enName: 'Protean Crystal', iconId: 0, category: 'crystal' as const },
];

describe('InventoryPanel', () => {
  it('shows registered/total summary', () => {
    render(<InventoryPanel materials={mats} inventory={{ 1: 5 }} onMaterialChange={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/素材：1\/1/)).toBeInTheDocument();
  });

  it('expands to show MaterialTile when 展開 clicked', () => {
    const fn = vi.fn();
    render(<InventoryPanel materials={mats} inventory={{}} onMaterialChange={fn} onClear={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '展開' }));
    expect(screen.getByText('異質結晶')).toBeInTheDocument();
  });

  it('calls onClear when 清空 clicked', () => {
    const fn = vi.fn();
    render(<InventoryPanel materials={mats} inventory={{ 1: 5 }} onMaterialChange={() => {}} onClear={fn} />);
    fireEvent.click(screen.getByRole('button', { name: '清空' }));
    expect(fn).toHaveBeenCalled();
  });
});
