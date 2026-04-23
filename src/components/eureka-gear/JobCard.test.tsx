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
  armor: { set: 'fending', pieces: {} },
};

describe('JobCard', () => {
  it('renders job code', () => {
    render(<JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />);
    expect(screen.getByText('PLD')).toBeInTheDocument();
  });

  it('renders fingerprints for each weapon chain', () => {
    const { container } = render(
      <JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />,
    );
    // 2 weapons × 16 dots = 32 dots
    expect(container.querySelectorAll('[data-dot]').length).toBeGreaterThanOrEqual(32);
  });

  it('calls onSelect with job id when detail button clicked', () => {
    const onSelect = vi.fn();
    render(<JobCard job="PLD" progress={baseProgress} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /查看詳情/ }));
    expect(onSelect).toHaveBeenCalledWith('PLD');
  });

  it('does not render armor section when armor.pieces is empty (PR-1 scope)', () => {
    render(<JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />);
    expect(screen.queryByText(/防具/)).toBeNull();
  });
});
