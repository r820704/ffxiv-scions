import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ProgressSummary } from './ProgressSummary';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';
import type { EurekaInventoryV5 } from '../../types/eureka-gear';

afterEach(cleanup);

const empty: EurekaInventoryV5 = {
  schemaVersion: 5,
  weapons: {},
  armor: {
    anemos: {},
    elemental: {
      fending: {}, maiming: {}, striking: {}, scouting: {},
      aiming: {}, healing: {}, casting: {},
    },
  },
  materials: {},
};

describe('ProgressSummary', () => {
  it('renders nothing when there is no progress at all', () => {
    const { container } = render(<ProgressSummary inventory={empty} />);
    expect(container.firstChild).toBeNull();
  });

  it('counts weapon jobs with any started chain', () => {
    const inv = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'anemos' };
    inv.weapons['pld-galatyn-shield'] = { currentStage: 'antiquated' };
    inv.weapons['war-farsha'] = { currentStage: 'pagos' };
    const { container } = render(<ProgressSummary inventory={inv} />);
    // PLD has two chains but counts as one job; WAR is another → 2 jobs
    expect(container.textContent).toMatch(/武器\s*2\/15 職業已開始/);
  });

  it('counts anemos armor pieces across all jobs', () => {
    const inv = emptyInventoryV3();
    inv.armor.anemos.PLD = { head: { currentStage: 'anemos-base' }, body: { currentStage: 'antiquated' } };
    inv.armor.anemos.WAR = { feet: { currentStage: 'antiquated' } };
    const { container } = render(<ProgressSummary inventory={inv} />);
    expect(container.textContent).toMatch(/常風防具\s*3\/75 件已開始/);
  });

  it('counts elemental armor pieces across all sets', () => {
    const inv = emptyInventoryV3();
    inv.armor.elemental.fending = {
      head: { currentStage: 'elemental' },
      body: { currentStage: 'elemental' },
    };
    inv.armor.elemental.healing = { hands: { currentStage: 'elemental' } };
    const { container } = render(<ProgressSummary inventory={inv} />);
    expect(container.textContent).toMatch(/元素防具\s*3\/35 件已開始/);
  });
});
