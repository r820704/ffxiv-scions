import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});
