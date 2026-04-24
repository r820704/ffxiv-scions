import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ChainStepper } from './ChainStepper';

afterEach(() => cleanup());

describe('ChainStepper', () => {
  it('renders 16 interactive nodes', () => {
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={() => {}} />);
    expect(screen.getAllByRole('button').length).toBe(16);
  });

  it('marks current stage distinctly', () => {
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={() => {}} />);
    const nodes = screen.getAllByRole('button');
    expect(nodes[4]?.getAttribute('data-state')).toBe('current'); // anemos is idx 4
  });

  it('calls onSelectTarget with the stage when clicked', () => {
    const onSelectTarget = vi.fn();
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={onSelectTarget} />);
    const nodes = screen.getAllByRole('button');
    fireEvent.click(nodes[8]!);
    expect(onSelectTarget).toHaveBeenCalled();
  });

  it('marks target stage distinctly from current and unowned', () => {
    render(<ChainStepper currentStage="anemos" targetStage="pyros" onSelectTarget={() => {}} />);
    const nodes = screen.getAllByRole('button');
    // pyros is idx 10
    expect(nodes[10]?.getAttribute('data-state')).toBe('target');
  });

  it('wraps nodes with flex-wrap for mobile', () => {
    const { container } = render(
      <ChainStepper currentStage="antiquated" targetStage={undefined} onSelectTarget={() => {}} />,
    );
    const wrap = container.querySelector('[data-testid="stepper-container"]');
    expect(wrap?.className).toContain('flex-wrap');
  });
});
