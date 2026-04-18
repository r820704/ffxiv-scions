import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AlbumPlanSection from './AlbumPlanSection';

afterEach(cleanup);

const baseProps = {
  prices: [],
  priceLoading: false,
  optimizationResult: null,
  optimizing: false,
  mcCosts: null,
  onRunOptimizer: vi.fn(),
};

describe('AlbumPlanSection', () => {
  it('should render cost summary and action button', () => {
    render(<AlbumPlanSection {...baseProps} />);
    expect(screen.getByText('整體花費')).toBeTruthy();
    expect(screen.getByRole('button', { name: '計算最佳合成' })).toBeTruthy();
  });

  it('should invoke onRunOptimizer when button clicked with prices available', () => {
    const onRunOptimizer = vi.fn();
    render(
      <AlbumPlanSection
        {...baseProps}
        prices={[{ itemId: 1, price: 100, worldName: 'Mana', lastUpdated: 0, listings: [] }]}
        onRunOptimizer={onRunOptimizer}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '計算最佳合成' }));
    expect(onRunOptimizer).toHaveBeenCalled();
  });
});
