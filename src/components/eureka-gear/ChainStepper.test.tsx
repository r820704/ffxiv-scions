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

  it('does NOT render zone labels for short 3-stage elemental armor track without zoneGroups prop', () => {
    render(
      <ChainStepper
        currentStage="elemental"
        targetStage={undefined}
        onSelectTarget={() => {}}
        stages={ELEMENTAL_ARMOR_STAGES}
      />,
    );
    expect(screen.getAllByRole('button', { name: /^stage \d+:/ }).length).toBe(3);
    expect(screen.queryByText('常風之地')).toBeNull();
    expect(screen.queryByText('湧火之地')).toBeNull();
  });

  it('calls onSelectStart (not onSelectTarget) when stage 1 clicked and chain not started', () => {
    const onSelectTarget = vi.fn();
    const onSelectStart = vi.fn();
    render(
      <ChainStepper
        currentStage={null}
        onSelectTarget={onSelectTarget}
        onSelectStart={onSelectStart}
      />
    );
    const buttons = screen.getAllByRole('button', { name: /stage/ });
    fireEvent.click(buttons[0]!);
    expect(onSelectStart).toHaveBeenCalledOnce();
    expect(onSelectTarget).not.toHaveBeenCalled();
  });

  it('calls onSelectTarget for stage 1 when not started and onSelectStart is absent', () => {
    const onSelectTarget = vi.fn();
    render(<ChainStepper currentStage={null} onSelectTarget={onSelectTarget} />);
    const buttons = screen.getAllByRole('button', { name: /stage/ });
    fireEvent.click(buttons[0]!);
    expect(onSelectTarget).toHaveBeenCalledWith('antiquated');
  });
});

describe('ChainStepper glow stage marking', () => {
  it('marks anemos / pyros / eureka / physeos buttons with data-glow on weapon track', () => {
    render(<ChainStepper currentStage="anemos" onSelectTarget={() => {}} />);
    const buttons = screen.getAllByRole('button', { name: /^stage \d+:/ });
    // EUREKA_STAGES indices: anemos=4, pyros=10, eureka=14, physeos=15
    expect(buttons[4]?.getAttribute('data-glow')).toBe('true');
    expect(buttons[10]?.getAttribute('data-glow')).toBe('true');
    expect(buttons[14]?.getAttribute('data-glow')).toBe('true');
    expect(buttons[15]?.getAttribute('data-glow')).toBe('true');
  });

  it('does not mark elemental as glow (regression)', () => {
    render(<ChainStepper currentStage="anemos" onSelectTarget={() => {}} />);
    const buttons = screen.getAllByRole('button', { name: /^stage \d+:/ });
    // elemental is idx 7
    expect(buttons[7]?.getAttribute('data-glow')).toBe(null);
  });

  it('renders visible 發光 label for glow stages on weapon track', () => {
    render(<ChainStepper currentStage="anemos" onSelectTarget={() => {}} />);
    // Every button has a label (for layout alignment); only glow ones are visible.
    const visibleLabels = screen
      .getAllByText('發光')
      .filter((el) => !el.classList.contains('invisible'));
    // anemos / pyros / eureka / physeos = 4 visible labels
    expect(visibleLabels.length).toBe(4);
  });

  it('does not show visible glow labels on armor track (shorter sequence)', () => {
    render(
      <ChainStepper
        currentStage="anemos"
        onSelectTarget={() => {}}
        stages={ANEMOS_ARMOR_STAGES}
      />
    );
    const buttons = screen.getAllByRole('button', { name: /^stage \d+:/ });
    buttons.forEach((b) => expect(b.getAttribute('data-glow')).toBe(null));
    const visibleLabels = screen
      .queryAllByText('發光')
      .filter((el) => !el.classList.contains('invisible'));
    expect(visibleLabels.length).toBe(0);
  });
});
