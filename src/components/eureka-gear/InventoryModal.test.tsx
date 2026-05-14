import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InventoryModal from './InventoryModal';

afterEach(() => cleanup());

const mats = [
  { id: 1, tcName: '異質結晶', enName: 'Protean Crystal', iconId: 0, category: 'crystal' as const },
];

describe('InventoryModal', () => {
  it('does not render content when closed', () => {
    render(<InventoryModal open={false} onOpenChange={() => {}} materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />);
    expect(screen.queryByText('異質結晶')).toBeNull();
  });

  it('renders title with registered count when open', () => {
    render(<InventoryModal open onOpenChange={() => {}} materials={mats} inventory={{ 1: 5 }} onMaterialChange={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/1\/1 種已輸入/)).toBeInTheDocument();
  });

  it('renders one row per material', () => {
    render(<InventoryModal open onOpenChange={() => {}} materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />);
    expect(screen.getByText('異質結晶')).toBeInTheDocument();
  });

  it('provides ±1 / ±10 / ±100 quick action buttons', () => {
    const onChange = vi.fn();
    render(<InventoryModal open onOpenChange={() => {}} materials={mats} inventory={{ 1: 50 }} onMaterialChange={onChange} onClear={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '+10' }));
    expect(onChange).toHaveBeenLastCalledWith(1, 60);
    fireEvent.click(screen.getByRole('button', { name: '-100' }));
    expect(onChange).toHaveBeenLastCalledWith(1, 0);
  });

  it('calls onClear when 全部清空 clicked', () => {
    const fn = vi.fn();
    render(<InventoryModal open onOpenChange={() => {}} materials={mats} inventory={{ 1: 5 }} onMaterialChange={() => {}} onClear={fn} />);
    fireEvent.click(screen.getByRole('button', { name: '全部清空' }));
    expect(fn).toHaveBeenCalled();
  });
});
