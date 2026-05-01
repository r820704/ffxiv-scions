import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ChainStepper } from './ChainStepper';
import { ANEMOS_ARMOR_STAGES, ELEMENTAL_ARMOR_STAGES } from '../../types/eureka-gear';

afterEach(() => cleanup());

describe('ChainStepper', () => {
  it('renders 16 interactive nodes', () => {
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={() => {}} />);
    expect(screen.getAllByRole('button', { name: /^stage \d+:/ }).length).toBe(16);
  });

  it('renders all stages as not-started when currentStage is null', () => {
    render(<ChainStepper currentStage={null} targetStage={undefined} onSelectTarget={() => {}} />);
    const nodes = screen.getAllByRole('button', { name: /^stage \d+:/ });
    nodes.forEach((n) => expect(n.getAttribute('data-state')).toBe('not-started'));
  });

  it('keeps target distinct even when currentStage is null', () => {
    render(<ChainStepper currentStage={null} targetStage="anemos" onSelectTarget={() => {}} />);
    const nodes = screen.getAllByRole('button', { name: /^stage \d+:/ });
    expect(nodes[4]?.getAttribute('data-state')).toBe('target');
    // Other non-target stages stay not-started
    expect(nodes[0]?.getAttribute('data-state')).toBe('not-started');
    expect(nodes[10]?.getAttribute('data-state')).toBe('not-started');
  });

  it('marks current stage distinctly', () => {
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={() => {}} />);
    const nodes = screen.getAllByRole('button', { name: /^stage \d+:/ });
    expect(nodes[4]?.getAttribute('data-state')).toBe('current'); // anemos is idx 4
  });

  it('calls onSelectTarget with the stage when clicked', () => {
    const onSelectTarget = vi.fn();
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={onSelectTarget} />);
    const nodes = screen.getAllByRole('button', { name: /^stage \d+:/ });
    fireEvent.click(nodes[8]!);
    expect(onSelectTarget).toHaveBeenCalled();
  });

  it('marks target stage distinctly from current and unowned', () => {
    render(<ChainStepper currentStage="anemos" targetStage="pyros" onSelectTarget={() => {}} />);
    const nodes = screen.getAllByRole('button', { name: /^stage \d+:/ });
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

  it('renders all four zone group labels for the 16-stage stepper', () => {
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={() => {}} />);
    expect(screen.getByText('常風之地')).toBeTruthy();
    expect(screen.getByText('恆冰之地')).toBeTruthy();
    expect(screen.getByText('湧火之地')).toBeTruthy();
    expect(screen.getByText('豐水之地')).toBeTruthy();
  });

  it('renders 起點 and 最終形態 labels for null-zone endpoints', () => {
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={() => {}} />);
    expect(screen.getByText('起點')).toBeTruthy();
    expect(screen.getByText('最終形態')).toBeTruthy();
  });

  it('still renders all 16 buttons + each remains clickable when grouped', () => {
    const onSelectTarget = vi.fn();
    render(<ChainStepper currentStage="anemos" targetStage={undefined} onSelectTarget={onSelectTarget} />);
    const nodes = screen.getAllByRole('button', { name: /^stage \d+:/ });
    expect(nodes.length).toBe(16);
    nodes.forEach((node) => fireEvent.click(node));
    expect(onSelectTarget).toHaveBeenCalledTimes(16);
  });

  it('does NOT render zone labels for short 5-stage anemos armor track', () => {
    render(
      <ChainStepper
        currentStage="antiquated"
        targetStage={undefined}
        onSelectTarget={() => {}}
        stages={ANEMOS_ARMOR_STAGES}
      />,
    );
    expect(screen.getAllByRole('button', { name: /^stage \d+:/ }).length).toBe(5);
    expect(screen.queryByText('常風之地')).toBeNull();
    expect(screen.queryByText('恆冰之地')).toBeNull();
    expect(screen.queryByText('湧火之地')).toBeNull();
    expect(screen.queryByText('豐水之地')).toBeNull();
    expect(screen.queryByText('起點')).toBeNull();
    expect(screen.queryByText('最終形態')).toBeNull();
  });

  it('does NOT render zone labels for short 4-stage elemental armor track', () => {
    render(
      <ChainStepper
        currentStage="antiquated"
        targetStage={undefined}
        onSelectTarget={() => {}}
        stages={ELEMENTAL_ARMOR_STAGES}
      />,
    );
    expect(screen.getAllByRole('button', { name: /^stage \d+:/ }).length).toBe(4);
    expect(screen.queryByText('常風之地')).toBeNull();
    expect(screen.queryByText('湧火之地')).toBeNull();
  });
});
