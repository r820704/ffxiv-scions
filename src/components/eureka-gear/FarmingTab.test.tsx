import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { FarmingTab } from './FarmingTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';
import type { EurekaInventoryV5 } from '../../types/eureka-gear';

afterEach(() => cleanup());

const materialsMap = {
  21801: { nameTC: '禁地水晶', icon: 0 },
  24124: { nameTC: '湧火晶簇', icon: 0 },
  24807: { nameTC: '豐水晶簇', icon: 0 },
};

describe('FarmingTab', () => {
  it('shows empty message when no chains have target', () => {
    render(<FarmingTab inventory={emptyInventoryV3()} materialsMap={materialsMap} />);
    expect(screen.getByText(/沒有設定 target/)).toBeInTheDocument();
  });

  it('aggregates by zone when chains have targets', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'pyros', targetStage: 'hydatos' };
    render(<FarmingTab inventory={inv} materialsMap={materialsMap} />);
    expect(screen.getByText(/豐水之地/)).toBeInTheDocument();
  });

  it('renders the expand-all toggle (default off)', () => {
    render(<FarmingTab inventory={emptyInventoryV3()} materialsMap={materialsMap} />);
    const checkbox = screen.getByRole('checkbox', { name: /展開所有目標/ });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggling the checkbox flips its checked state', () => {
    render(<FarmingTab inventory={emptyInventoryV3()} materialsMap={materialsMap} />);
    const checkbox = screen.getByRole('checkbox', { name: /展開所有目標/ }) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('with expandAll on and no targets set, materials still appear (chain endpoints used)', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    // Weapon at pyros with no target — default would skip; expandAll should walk to physeos.
    inv.weapons['pld-galatyn'] = { currentStage: 'pyros' };
    render(<FarmingTab inventory={inv} materialsMap={materialsMap} />);
    // Default state: empty message visible
    expect(screen.getByText(/沒有設定 target/)).toBeInTheDocument();

    // Enable expand-all — empty message should disappear and zones should appear.
    const checkbox = screen.getByRole('checkbox', { name: /展開所有目標/ });
    fireEvent.click(checkbox);
    expect(screen.queryByText(/沒有設定 target/)).not.toBeInTheDocument();
    // pyros → physeos walks through hydatos zone (hydatos / hydatos+1 / base-eureka / eureka / physeos)
    expect(screen.getByText(/豐水之地/)).toBeInTheDocument();
  });

  it('with expandAll on, weapon already at physeos contributes nothing', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'physeos' };
    render(<FarmingTab inventory={inv} materialsMap={materialsMap} />);
    const checkbox = screen.getByRole('checkbox', { name: /展開所有目標/ });
    fireEvent.click(checkbox);
    // No further materials — empty state should be shown with expandAll message.
    expect(screen.getByText(/所有目標已達成 — 沒有需要的升級素材/)).toBeInTheDocument();
  });
});
