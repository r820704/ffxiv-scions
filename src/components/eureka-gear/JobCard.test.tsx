import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { JobCard } from './JobCard';
import type { JobProgress } from '../../utils/eurekaGear';

afterEach(() => cleanup());

const baseProgress: JobProgress = {
  weapons: [
    { chainId: 'pld-galatyn', progress: { currentStage: 'anemos' }, started: true },
    { chainId: 'pld-galatyn-shield', progress: { currentStage: 'antiquated' }, started: true },
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

  it('shows stage name label for weapon (current only, no target)', () => {
    render(<JobCard job="PLD" progress={baseProgress} onSelect={() => {}} />);
    // Should display stage label for anemos weapon
    expect(screen.getByText(/禁地兵裝·常風/)).toBeInTheDocument();
    // Should display stage label for antiquated shield (may appear multiple times with armor)
    expect(screen.getAllByText(/70級職業套裝/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows stage name label for weapon with target stage', () => {
    const progressWithTarget: JobProgress = {
      weapons: [
        {
          chainId: 'pld-galatyn',
          progress: { currentStage: 'anemos', targetStage: 'pagos' },
          started: true,
        },
      ],
      anemos: {},
      elemental: { set: 'fending', pieces: {} },
    };
    render(<JobCard job="PLD" progress={progressWithTarget} onSelect={() => {}} />);
    // Should show both current and target stages
    expect(screen.getByText(/禁地兵裝·常風 → 禁地兵裝·恆冰/)).toBeInTheDocument();
  });

  it('shows 未開始 hint for weapon when started is false (no inventory entry yet)', () => {
    const progress: JobProgress = {
      weapons: [
        { chainId: 'pld-galatyn', progress: { currentStage: 'antiquated' }, started: false },
      ],
      anemos: {},
      elemental: { set: 'fending', pieces: {} },
    };
    render(<JobCard job="PLD" progress={progress} onSelect={() => {}} />);
    // Both the unstarted weapon AND every empty anemos slot render a 未開始 line.
    // Six lines total (1 weapon + 5 armor slots) is the precise expectation here.
    expect(screen.getAllByText(/· 未開始/).length).toBe(6);
  });

  it('shows stage name labels for anemos armor slots', () => {
    const progressWithArmor: JobProgress = {
      weapons: [],
      anemos: {
        head: { currentStage: 'anemos' },
        body: { currentStage: 'pagos', targetStage: 'elemental' },
        hands: { currentStage: 'antiquated' },
        legs: { currentStage: 'antiquated' },
        feet: { currentStage: 'antiquated' },
      },
      elemental: { set: 'fending', pieces: {} },
    };
    render(<JobCard job="PLD" progress={progressWithArmor} onSelect={() => {}} />);
    // Check for stage labels
    expect(screen.getByText(/禁地兵裝·常風/)).toBeInTheDocument();
    expect(screen.getByText(/禁地兵裝·恆冰 → 禁地兵裝·元素/)).toBeInTheDocument();
    expect(screen.getAllByText(/70級職業套裝/).length).toBeGreaterThanOrEqual(1);
  });
});
