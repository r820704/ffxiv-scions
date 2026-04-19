import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InventoryPanel from './InventoryPanel';
import type { EurekaMaterial } from '@/types/eureka-gear';

afterEach(() => cleanup());

const materials: EurekaMaterial[] = [
  { id: 1, name: '蒼晶', iconId: 0, category: 'crystal' },
  { id: 2, name: '霜晶', iconId: 0, category: 'crystal' },
];

describe('InventoryPanel', () => {
  it('shows summary "N/M" and is collapsed by default', () => {
    render(
      <InventoryPanel materials={materials} inventory={{ 1: 5 }} ownedCount={2} ownedTotal={10}
        onMaterialChange={() => {}} onClear={() => {}} />,
    );
    expect(screen.getByText(/素材：1\/2/)).toBeInTheDocument();
    expect(screen.getByText(/裝備：2\/10/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('5')).toBeNull();  // collapsed
  });

  it('expands to show tiles after toggle click', () => {
    render(
      <InventoryPanel materials={materials} inventory={{ 1: 5 }} ownedCount={0} ownedTotal={0}
        onMaterialChange={() => {}} onClear={() => {}} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /展開|收合/ }));
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('calls onClear when 清空 clicked', () => {
    const fn = vi.fn();
    render(
      <InventoryPanel materials={materials} inventory={{}} ownedCount={0} ownedTotal={0}
        onMaterialChange={() => {}} onClear={fn} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '清空' }));
    expect(fn).toHaveBeenCalled();
  });
});
