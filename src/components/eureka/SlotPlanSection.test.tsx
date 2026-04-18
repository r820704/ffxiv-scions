import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SlotPlanSection from './SlotPlanSection';
import type { LogogramPrice } from '@/types/eureka';

afterEach(cleanup);

const emptySlots: [string | null, string | null][] = Array.from(
  { length: 8 },
  () => [null, null] as [null, null]
);

const fakePrice: LogogramPrice = {
  itemId: 1,
  price: null,
  worldName: null,
  lastUpdated: null,
  listings: [],
};

const baseProps = {
  slotConfig: emptySlots,
  prices: [] as LogogramPrice[],
  priceLoading: false,
  slotResult: null,
  slotOptimizing: false,
  slotMcCosts: null,
  isStale: false,
  onRunOptimizer: vi.fn(),
  onResetSlots: vi.fn(),
};

describe('SlotPlanSection', () => {
  it('should show stale warning when isStale is true', () => {
    render(<SlotPlanSection {...baseProps} isStale={true} />);
    expect(screen.getByText(/技能格已變更/)).toBeTruthy();
  });

  it('should disable calc button when no slots filled', () => {
    render(<SlotPlanSection {...baseProps} prices={[fakePrice]} />);
    const btn = screen.getByRole('button', { name: /計算最佳合成/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should call onRunOptimizer when calc button clicked with filled slots and prices', () => {
    const onRunOptimizer = vi.fn();
    const slotConfig: [string | null, string | null][] = emptySlots.map(
      (s) => [s[0], s[1]] as [string | null, string | null]
    );
    slotConfig[0] = ['skill-a', null];
    render(
      <SlotPlanSection
        {...baseProps}
        slotConfig={slotConfig}
        prices={[fakePrice]}
        onRunOptimizer={onRunOptimizer}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /計算最佳合成/ }));
    expect(onRunOptimizer).toHaveBeenCalled();
  });

  it('should call onResetSlots when reset button clicked', () => {
    const onResetSlots = vi.fn();
    const slotConfig: [string | null, string | null][] = emptySlots.map(
      (s) => [s[0], s[1]] as [string | null, string | null]
    );
    slotConfig[0] = ['skill-a', null];
    render(
      <SlotPlanSection
        {...baseProps}
        slotConfig={slotConfig}
        onResetSlots={onResetSlots}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /重置技能格/ }));
    expect(onResetSlots).toHaveBeenCalled();
  });

  it('should disable reset button when no slots filled', () => {
    render(<SlotPlanSection {...baseProps} />);
    const btn = screen.getByRole('button', { name: /重置技能格/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should not render slot count text (A2)', () => {
    render(<SlotPlanSection {...baseProps} />);
    expect(screen.queryByText(/格已配置/)).toBeNull();
    expect(screen.queryByText(/格空$/)).toBeNull();
  });

  it('should style reset button with destructive background (A1)', () => {
    const slotConfig: [string | null, string | null][] = emptySlots.map(
      (s) => [s[0], s[1]] as [string | null, string | null]
    );
    slotConfig[0] = ['skill-a', null];
    render(<SlotPlanSection {...baseProps} slotConfig={slotConfig} />);
    const btn = screen.getByRole('button', { name: /重置技能格/ });
    expect(btn.className).toContain('bg-destructive');
  });
});
