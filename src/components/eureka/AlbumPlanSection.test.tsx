import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AlbumPlanSection from './AlbumPlanSection';

afterEach(cleanup);

const baseProps = {
  learnedSkills: new Set<string>(),
  toggleLearned: vi.fn(),
  learnAll: vi.fn(),
  resetAll: vi.fn(),
  prices: [],
  priceLoading: false,
  optimizationResult: null,
  optimizing: false,
  mcCosts: null,
  onRunOptimizer: vi.fn(),
};

describe('AlbumPlanSection', () => {
  it('should render cost summary and action buttons', () => {
    render(<AlbumPlanSection {...baseProps} />);
    expect(screen.getByText('整體花費')).toBeTruthy();
    expect(screen.getByRole('button', { name: '全開' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '重置' })).toBeTruthy();
  });

  it('should invoke learnAll when 全開 is clicked', () => {
    const learnAll = vi.fn();
    render(<AlbumPlanSection {...baseProps} learnAll={learnAll} />);
    fireEvent.click(screen.getByRole('button', { name: '全開' }));
    expect(learnAll).toHaveBeenCalled();
  });
});
