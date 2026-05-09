import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { FarmingTab } from './FarmingTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';
import type { EurekaInventoryV5 } from '../../types/eureka-gear';

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => cleanup());

const materialsMap = {
  21801: { nameTC: '禁地水晶', icon: 0 },
  24124: { nameTC: '湧火晶簇', icon: 0 },
  24807: { nameTC: '豐水晶簇', icon: 0 },
};

describe('FarmingTab', () => {
  it('shows empty message when no chains have target', () => {
    render(<FarmingTab inventory={emptyInventoryV3()} weapons={[]} materialsMap={materialsMap} />);
    expect(screen.getByText(/沒有設定 target/)).toBeInTheDocument();
  });

  it('aggregates by zone when chains have targets', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'pyros', targetStage: 'hydatos' };
    render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
    expect(screen.getByText(/豐水之地/)).toBeInTheDocument();
  });

  it('renders the expand-all toggle (default off)', () => {
    render(<FarmingTab inventory={emptyInventoryV3()} weapons={[]} materialsMap={materialsMap} />);
    const checkbox = screen.getByRole('checkbox', { name: /計算完整路徑至終點/ });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggling the checkbox flips its checked state', () => {
    render(<FarmingTab inventory={emptyInventoryV3()} weapons={[]} materialsMap={materialsMap} />);
    const checkbox = screen.getByRole('checkbox', { name: /計算完整路徑至終點/ }) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('with expandAll on and no targets set, materials still appear (chain endpoints used)', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    // Weapon at pyros with no target — default would skip; expandAll should walk to physeos.
    inv.weapons['pld-galatyn'] = { currentStage: 'pyros' };
    render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
    // Default state: empty message visible
    expect(screen.getByText(/沒有設定 target/)).toBeInTheDocument();

    // Enable expand-all — empty message should disappear and zones should appear.
    const checkbox = screen.getByRole('checkbox', { name: /計算完整路徑至終點/ });
    fireEvent.click(checkbox);
    expect(screen.queryByText(/沒有設定 target/)).not.toBeInTheDocument();
    // pyros → physeos walks through hydatos zone (hydatos / hydatos+1 / base-eureka / eureka / physeos)
    expect(screen.getByText(/豐水之地/)).toBeInTheDocument();
  });

  it('with expandAll on, weapon already at physeos contributes nothing', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'physeos' };
    render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
    const checkbox = screen.getByRole('checkbox', { name: /計算完整路徑至終點/ });
    fireEvent.click(checkbox);
    // No further materials — empty state should be shown with expandAll message.
    expect(screen.getByText(/所有目標已達成 — 沒有需要的升級素材/)).toBeInTheDocument();
  });

  it('aggregates eureka → physeos materials (EUREKA_FRAGMENT × 100) into hydatos zone', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'eureka', targetStage: 'physeos' };
    const fullMaterialsMap = {
      ...materialsMap,
      24808: { nameTC: '優雷卡的斷片', icon: 0 },
    };
    render(<FarmingTab inventory={inv} weapons={[]} materialsMap={fullMaterialsMap} />);
    // The hydatos ZoneGroup should render with 缺 100 (fragment shortage)
    const hydatosHeader = screen.getByText(/豐水之地.*缺 100 單位素材/);
    expect(hydatosHeader).toBeInTheDocument();
    // The ZoneGroup section should contain a 優雷卡的斷片 list item with 缺 100
    const section = hydatosHeader.closest('section');
    expect(section?.textContent).toMatch(/優雷卡的斷片/);
    expect(section?.textContent).toMatch(/缺 100/);
  });

  it('shows item levels in active targets list', () => {
    const inv: EurekaInventoryV5 = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'pyros', targetStage: 'hydatos' };
    render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
    // pyros = iL 385, hydatos = iL 390
    expect(screen.getByText(/iL 385/)).toBeInTheDocument();
    expect(screen.getByText(/iL 390/)).toBeInTheDocument();
  });
});
