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
  24124: { nameTC: '湧火水晶', icon: 0 },
  24807: { nameTC: '豐水水晶', icon: 0 },
  24808: { nameTC: '優雷卡的斷片', icon: 0 },
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

  describe('elemental armor 未開始 → elemental+2 (head)', () => {
    const setup = () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      // Head piece, no currentStage, target = elemental+2 (3rd elemental tier)
      inv.armor.elemental.fending.head = { targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
    };

    it('aggregates 湧火水晶 × 40 into 湧火之地 zone (antiquated→elemental edge)', () => {
      setup();
      const pyrosHeader = screen.getByText(/湧火之地.*缺 40 單位素材/);
      const section = pyrosHeader.closest('section');
      expect(section?.textContent).toMatch(/湧火水晶/);
      expect(section?.textContent).toMatch(/缺 40 \/ 總需 40/);
    });

    it('aggregates 豐水水晶 × 30 + 優雷卡的斷片 × 21 into 豐水之地 zone', () => {
      setup();
      const hydatosHeader = screen.getByText(/豐水之地.*缺 51 單位素材/);
      const section = hydatosHeader.closest('section');
      expect(section?.textContent).toMatch(/豐水水晶/);
      expect(section?.textContent).toMatch(/缺 30 \/ 總需 30/);
      expect(section?.textContent).toMatch(/優雷卡的斷片/);
      expect(section?.textContent).toMatch(/缺 21 \/ 總需 21/);
    });

    it('does NOT place 豐水水晶 or 優雷卡的斷片 in 湧火之地 zone (regression: material zone bug)', () => {
      setup();
      const pyrosHeader = screen.getByText(/湧火之地.*缺 40 單位素材/);
      const section = pyrosHeader.closest('section');
      // Only 湧火水晶 should appear in Pyros zone — 豐水/優雷卡的斷片 must NOT.
      expect(section?.textContent).not.toMatch(/豐水水晶/);
      expect(section?.textContent).not.toMatch(/優雷卡的斷片/);
    });

    it('uses slot-specific cost (head needs 30 / 21, not body 50 / 35)', () => {
      setup();
      const hydatos = screen.getByText(/豐水之地.*缺 51 單位素材/).closest('section');
      // Body/legs costs are 50 + 35 = 85; head/hands/feet are 30 + 21 = 51.
      expect(hydatos?.textContent).not.toMatch(/缺 50 \/ 總需 50/);
      expect(hydatos?.textContent).not.toMatch(/缺 35 \/ 總需 35/);
    });
  });

  describe('elemental armor body slot uses higher costs', () => {
    it('body 未開始 → elemental+2: 50 豐水水晶 + 35 優雷卡的斷片', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.armor.elemental.fending.body = { targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      const hydatos = screen.getByText(/豐水之地.*缺 85 單位素材/).closest('section');
      expect(hydatos?.textContent).toMatch(/缺 50 \/ 總需 50/);
      expect(hydatos?.textContent).toMatch(/缺 35 \/ 總需 35/);
    });
  });

  describe('前置條件 list', () => {
    it('section header reads "前置條件" (renamed from "前置道具")', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      // Use elemental armor 未開始 → triggers the entry condition,
      // which causes the section to render without needing the weapons array.
      inv.armor.elemental.fending.head = { targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      expect(screen.getByText(/📜 前置條件/)).toBeInTheDocument();
      expect(screen.queryByText(/📜 前置道具/)).not.toBeInTheDocument();
    });

    it('adds elemental entry condition (50 文理 + 恆冰武器) when piece is 未開始 with target', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.armor.elemental.fending.head = { targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      expect(screen.getByText(/需收集 50 個文理技能圖鑑.*至少完成一件任意職業的恆冰武器/)).toBeInTheDocument();
    });

    it('adds 56 文理 condition when elemental piece targets +1 or +2', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.armor.elemental.fending.head = { targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      expect(screen.getByText(/需解鎖 56 個文理技能圖鑑/)).toBeInTheDocument();
    });

    it('does NOT add the 50 文理 + 恆冰武器 condition when piece is already at elemental stage', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.armor.elemental.fending.head = { currentStage: 'elemental', targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      expect(screen.queryByText(/需收集 50 個文理技能圖鑑/)).not.toBeInTheDocument();
      // But 56 文理 still applies (elemental → +1 still walked)
      expect(screen.getByText(/需解鎖 56 個文理技能圖鑑/)).toBeInTheDocument();
    });

    it('deduplicates conditions across multiple slots of the same set', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.armor.elemental.fending.head = { targetStage: 'elemental+2' };
      inv.armor.elemental.fending.body = { targetStage: 'elemental+2' };
      inv.armor.elemental.aiming.legs = { targetStage: 'elemental+2' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      // Both head/hands/feet and body/legs have the same "56 文理" text after cleanup → 1 row
      expect(screen.getAllByText(/需解鎖 56 個文理技能圖鑑/)).toHaveLength(1);
      expect(screen.getAllByText(/需收集 50 個文理技能圖鑑/)).toHaveLength(1);
    });

    it('aggregates weapon文理 conditions from stage cost notes', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.weapons['pld-galatyn'] = { currentStage: 'elemental', targetStage: 'pyros' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      // Walks elemental → +1 → +2 → pyros, picks up 10 + 20 + 30 文理 notes
      expect(screen.getByText(/需收集 10 個文理技能圖鑑/)).toBeInTheDocument();
      expect(screen.getByText(/需收集 20 個文理技能圖鑑/)).toBeInTheDocument();
      expect(screen.getByText(/需收集 30 個文理技能圖鑑/)).toBeInTheDocument();
    });

    it('does not add weapon文理 conditions when target is before the elemental stages', () => {
      const inv: EurekaInventoryV5 = emptyInventoryV3();
      inv.weapons['pld-galatyn'] = { currentStage: 'antiquated', targetStage: 'anemos' };
      render(<FarmingTab inventory={inv} weapons={[]} materialsMap={materialsMap} />);
      expect(screen.queryByText(/需收集 10 個文理技能圖鑑/)).not.toBeInTheDocument();
      expect(screen.queryByText(/需收集 50 個文理技能圖鑑/)).not.toBeInTheDocument();
    });
  });
});
