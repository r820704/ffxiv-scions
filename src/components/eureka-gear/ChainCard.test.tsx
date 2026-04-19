import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ChainCard from './ChainCard';
import type { EurekaChain, EurekaWeapon, StageUpgradeCost, EurekaMaterial } from '@/types/eureka-gear';

afterEach(() => cleanup());

const chain: EurekaChain = {
  chainId: 'drg-ryunohige', job: 'DRG', isShield: false, displayName: '龍騎士 · 龍鬚',
};
const weaponStub: EurekaWeapon = {
  id: 1, chainId: 'drg-ryunohige', job: 'DRG', isShield: false,
  stage: 'anemos', itemLevel: 355, tcName: '龍鬚·常風',
  enName: 'Ryunohige Anemos', iconId: 0,
};
const costs: StageUpgradeCost[] = [
  { from: 'antiquated', to: 'anemos-base', materials: [{ materialId: 22432, quantity: 100 }] },
];
const materials: EurekaMaterial[] = [
  { id: 22432, tcName: '異質結晶', enName: 'Protean Crystal', iconId: 0, category: 'crystal' },
];

describe('ChainCard', () => {
  it('renders chain displayName + current stage label', () => {
    render(<ChainCard chain={chain} weapons={[weaponStub]} currentStage="anemos"
      inventory={{}} costs={costs} materials={materials}
      onSetStage={() => {}} onUpgrade={() => {}} />);
    expect(screen.getByText('龍騎士 · 龍鬚')).toBeInTheDocument();
    expect(screen.getAllByText(/常風/).length).toBeGreaterThan(0);
  });

  it('expands when header clicked and shows 升級成本', () => {
    render(<ChainCard chain={chain} weapons={[weaponStub]} currentStage="antiquated"
      inventory={{}} costs={costs} materials={materials}
      onSetStage={() => {}} onUpgrade={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /展開/ }));
    expect(screen.getByText(/升級成本/)).toBeInTheDocument();
  });

  it('upgrade button disabled when materials insufficient', () => {
    render(<ChainCard chain={chain} weapons={[weaponStub]} currentStage="antiquated"
      inventory={{ 22432: 50 }} costs={costs} materials={materials}
      onSetStage={() => {}} onUpgrade={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /展開/ }));
    const btn = screen.getByRole('button', { name: '升級' });
    expect(btn).toBeDisabled();
  });

  it('upgrade button calls onUpgrade after confirm', () => {
    const fn = vi.fn();
    vi.stubGlobal('confirm', () => true);
    render(<ChainCard chain={chain} weapons={[weaponStub]} currentStage="antiquated"
      inventory={{ 22432: 100 }} costs={costs} materials={materials}
      onSetStage={() => {}} onUpgrade={fn} />);
    fireEvent.click(screen.getByRole('button', { name: /展開/ }));
    fireEvent.click(screen.getByRole('button', { name: '升級' }));
    expect(fn).toHaveBeenCalledWith('drg-ryunohige');
  });

  it('no upgrade button at physeos', () => {
    render(<ChainCard chain={chain} weapons={[weaponStub]} currentStage="physeos"
      inventory={{}} costs={costs} materials={materials}
      onSetStage={() => {}} onUpgrade={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /展開/ }));
    expect(screen.queryByRole('button', { name: '升級' })).toBeNull();
    expect(screen.getByText(/已完成/)).toBeInTheDocument();
  });
});
