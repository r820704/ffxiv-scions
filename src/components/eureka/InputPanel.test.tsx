import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import InputPanel from './InputPanel';

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
    const slotWrapper = container.querySelector('[title*="技能格計算"]');
    expect(slotWrapper).toBeTruthy();
    expect(slotWrapper!.className).toMatch(/pointer-events-none/);
  });

  it('slot panel wrapper should NOT be pointer-events-none in slots mode', () => {
    const { container } = render(<InputPanel {...baseProps} calcMode="slots" />);
    const slotWrappers = container.querySelectorAll('[class*="shrink-0"]');
    // slot panel should not carry pointer-events-none when calcMode is slots
    const anyDisabled = Array.from(slotWrappers).some((el) =>
      el.className.includes('pointer-events-none')
    );
    expect(anyDisabled).toBe(false);
  });
});
