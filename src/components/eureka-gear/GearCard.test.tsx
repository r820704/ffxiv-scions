import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import GearCard from './GearCard';
import type { EurekaGearItem } from '@/types/eureka-gear';

afterEach(() => cleanup());

const item: EurekaGearItem = {
  id: 100, name: '嘉拉汀·常風', iconId: 0, stage: 'anemos', slot: 'weapon',
  jobs: ['SAM'], itemLevel: 370,
  source: { npcId: 1, npcName: '艾里娜', zone: '', specialShopId: 1 },
  cost: { materials: [{ materialId: 9, quantity: 3 }] },
  tags: [],
};
const matNames: Record<number, string> = { 9: '常風水晶' };

describe('GearCard', () => {
  it('renders name / stage / jobs / npc', () => {
    render(
      <GearCard item={item} materials={{}} owned={false} materialNames={matNames}
        onOwnedChange={() => {}} />,
    );
    expect(screen.getByText('嘉拉汀·常風')).toBeInTheDocument();
    expect(screen.getByText(/anemos/)).toBeInTheDocument();
    expect(screen.getByText(/SAM/)).toBeInTheDocument();
    expect(screen.getByText(/艾里娜/)).toBeInTheDocument();
  });

  it('shows cost rows when not owned', () => {
    render(
      <GearCard item={item} materials={{ 9: 1 }} owned={false} materialNames={matNames}
        onOwnedChange={() => {}} />,
    );
    expect(screen.getByText('常風水晶')).toBeInTheDocument();
    expect(screen.getByText(/持有 1/)).toBeInTheDocument();
  });

  it('collapses cost rows and shows "已持有" when owned', () => {
    render(
      <GearCard item={item} materials={{}} owned={true} materialNames={matNames}
        onOwnedChange={() => {}} />,
    );
    expect(screen.queryByText(/常風水晶/)).toBeNull();
    expect(screen.getByText('✓ 已持有')).toBeInTheDocument();
  });

  it('fires onOwnedChange when checkbox toggled', () => {
    const fn = vi.fn();
    render(
      <GearCard item={item} materials={{}} owned={false} materialNames={matNames}
        onOwnedChange={fn} />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /已持有/ }));
    expect(fn).toHaveBeenCalledWith(100, true);
  });

  it('applies dim style when owned', () => {
    const { container } = render(
      <GearCard item={item} materials={{}} owned={true} materialNames={matNames}
        onOwnedChange={() => {}} />,
    );
    expect(container.querySelector('[data-owned="true"]')).not.toBeNull();
  });
});
