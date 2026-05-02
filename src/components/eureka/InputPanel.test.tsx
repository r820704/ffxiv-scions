import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import InputPanel from './InputPanel';
import { eurekaData } from '@/data/eureka-data';

afterEach(cleanup);

const baseProps = {
  learnedSkills: new Set<string>(),
  usedSkillIds: new Set<string>(),
  slotConfig: Array.from({ length: 8 }, (): [null, null] => [null, null]),
  selectedSlot: null,
  onToggleLearn: vi.fn(),
  onPickForSlot: vi.fn(),
  onSelectSlot: vi.fn(),
  onClearSlot: vi.fn(),
};

describe('InputPanel', () => {
  it('slot panel wrapper should be pointer-events-none in album mode', () => {
    const { container } = render(<InputPanel {...baseProps} calcMode="album" />);
    const inner = container.querySelector('.cursor-not-allowed > div');
    expect(inner).toBeTruthy();
    expect(inner!.className).toMatch(/pointer-events-none/);
  });

  it('slot panel wrapper should NOT be pointer-events-none in slots mode', () => {
    const { container } = render(<InputPanel {...baseProps} calcMode="slots" />);
    const slotWrappers = container.querySelectorAll('[class*="shrink-0"]');
    const anyDisabled = Array.from(slotWrappers).some((el) =>
      el.className.includes('pointer-events-none')
    );
    expect(anyDisabled).toBe(false);
  });

  it('should render recent skills row in slot mode when recentIds provided', () => {
    const knownId = eurekaData.logosActions[0]!.id;
    render(
      <InputPanel
        {...baseProps}
        calcMode="slots"
        recentIds={[knownId]}
        learnedSkills={new Set([knownId])}
      />
    );
    expect(screen.getByText('最近使用')).toBeTruthy();
  });

  it('should NOT render recent row in album mode', () => {
    const knownId = eurekaData.logosActions[0]!.id;
    render(
      <InputPanel
        {...baseProps}
        calcMode="album"
        recentIds={[knownId]}
        learnedSkills={new Set([knownId])}
      />
    );
    expect(screen.queryByText('最近使用')).toBeNull();
  });
});
