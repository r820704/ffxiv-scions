import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { NextEdgeShortage } from './NextEdgeShortage';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

const materialsMap = {
  // Anything referenced in the cost tables; the component just needs nameTC + icon.
  // Use a permissive Proxy so we don't have to enumerate every material id here.
} as Record<number, { nameTC: string; icon: number }>;
const looseMap = new Proxy(materialsMap, {
  get: (target, key) => target[Number(key)] ?? { nameTC: `#${String(key)}`, icon: 0 },
}) as Record<number, { nameTC: string; icon: number }>;

afterEach(cleanup);

describe('NextEdgeShortage', () => {
  it('renders nothing when no chain has a target set', () => {
    const { container } = render(
      <NextEdgeShortage inventory={emptyInventoryV3()} materialsMap={looseMap} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows the section when at least one chain needs immediate-next-edge materials', () => {
    const inv = emptyInventoryV3();
    // PLD weapon at antiquated wants anemos-base — needs the very first edge cost.
    inv.weapons['pld-galatyn'] = { currentStage: 'antiquated', targetStage: 'anemos-base' };
    const { container } = render(
      <NextEdgeShortage inventory={inv} materialsMap={looseMap} />,
    );
    expect(container.querySelector('section[aria-label="下一階段最缺素材"]')).not.toBeNull();
  });

  it('hides the section once the player has enough for every next-edge material', () => {
    const inv = emptyInventoryV3();
    inv.weapons['pld-galatyn'] = { currentStage: 'antiquated', targetStage: 'anemos-base' };
    // Stuff a million of every conceivable material so shortage is always 0.
    for (let id = 1; id < 50000; id++) inv.materials[id] = 9999999;
    const { container } = render(
      <NextEdgeShortage inventory={inv} materialsMap={looseMap} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
