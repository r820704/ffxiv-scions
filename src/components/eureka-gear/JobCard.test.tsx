import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { JobCard } from './JobCard';
import type { JobProgress } from '../../utils/eurekaGear';

afterEach(() => cleanup());

const baseProgress: JobProgress = {
  weapons: [
    { chainId: 'pld-galatyn', progress: { currentStage: 'anemos' } },
    { chainId: 'pld-galatyn-shield', progress: { currentStage: 'antiquated' } },
  ],
  anemos: {},
  elemental: { set: 'fending', pieces: {} },
};

describe('JobCard', () => {
  it('renders job icon and TC name', () => {
    render(<JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />);
    expect(screen.getAllByAltText('PLD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('騎士')).toBeInTheDocument();
  });

  it('renders fingerprints for each weapon chain', () => {
    const { container } = render(
      <JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />,
    );
    expect(container.querySelectorAll('[data-dot]').length).toBeGreaterThanOrEqual(32);
  });

  it('calls onSelect with job id when detail button clicked', () => {
    const onSelect = vi.fn();
    render(<JobCard job="PLD" progress={baseProgress} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /查看詳情/ }));
    expect(onSelect).toHaveBeenCalledWith('PLD');
  });

  it('renders 常風系列 section but NOT 元素系列 (elemental moved to RoleCard)', () => {
    render(<JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />);
    expect(screen.getByText(/常風系列/)).toBeInTheDocument();
    expect(screen.queryByText(/元素系列/)).toBeNull();
  });
});
