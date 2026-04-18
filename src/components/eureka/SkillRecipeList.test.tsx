import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SkillRecipeList from './SkillRecipeList';
import type { SlotConfig, SlotOptimizationResult } from '@/utils/slot-optimizer';
import { eurekaData } from '@/data/eureka-data';

afterEach(cleanup);

const sampleSkillId = eurekaData.logosActions[0]!.id;

const slotConfig: SlotConfig = Array.from({ length: 8 }, () => [null, null] as [null, null]);
slotConfig[0] = [sampleSkillId, null];

const slotResult: SlotOptimizationResult = {
  selectedRecipes: { 0: { skill1RecipeIdx: 0 } },
  mcOpensPerIter: [],
  slotCombinations: { 0: [] },
};

const baseProps = {
  mode: 'slots' as const,
  learnedSkills: new Set<string>(),
  onToggle: vi.fn(),
  prices: [],
  priceLoading: false,
  optimizationResult: null,
  slotConfig,
  slotResult,
};

describe('SkillRecipeList — A4 guide mode expand/collapse', () => {
  it('disables expand-all and collapse-all in slots+guide view', () => {
    render(<SkillRecipeList {...baseProps} />);
    // useEffect auto-switches stateFilter to 'guide' when slotResult is present
    const expandBtn = screen.getByRole('button', { name: '全部展開' }) as HTMLButtonElement;
    const collapseBtn = screen.getByRole('button', { name: '全部縮合' }) as HTMLButtonElement;
    expect(expandBtn.disabled).toBe(true);
    expect(collapseBtn.disabled).toBe(true);
  });

  it('enables expand-all/collapse-all when not in guide view', () => {
    render(<SkillRecipeList {...baseProps} />);
    // Switch away from 'guide' to 'all'
    fireEvent.click(screen.getByRole('button', { name: '全部' }));
    const expandBtn = screen.getByRole('button', { name: '全部展開' }) as HTMLButtonElement;
    const collapseBtn = screen.getByRole('button', { name: '全部縮合' }) as HTMLButtonElement;
    expect(expandBtn.disabled).toBe(false);
    expect(collapseBtn.disabled).toBe(false);
  });
});
