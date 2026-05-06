import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChainFingerprint } from './ChainFingerprint';
import { WEAPON_GLOW_STAGES, EUREKA_STAGES } from '../../types/eureka-gear';

describe('ChainFingerprint', () => {
  it('renders 16 dots total', () => {
    const { container } = render(<ChainFingerprint currentStage="anemos" />);
    expect(container.querySelectorAll('[data-dot]').length).toBe(16);
  });

  it('marks dots up to and including currentStage as filled', () => {
    const { container } = render(<ChainFingerprint currentStage="anemos" />);
    const dots = container.querySelectorAll('[data-dot]');
    // 'anemos' is idx 4 in EUREKA_STAGES
    for (let i = 0; i <= 4; i++) {
      expect(dots[i]?.getAttribute('data-filled')).toBe('true');
    }
    for (let i = 5; i < 16; i++) {
      expect(dots[i]?.getAttribute('data-filled')).toBe('false');
    }
  });

  it('renders N/16 label when showLabel is true', () => {
    render(<ChainFingerprint currentStage="pagos" showLabel />);
    expect(screen.getByText('6/16')).toBeInTheDocument();
  });
});

describe('ChainFingerprint zone separators', () => {
  it('renders 6 zone groups when showZoneSeparators is true', () => {
    const { container } = render(
      <ChainFingerprint currentStage="anemos" showZoneSeparators />
    );
    expect(container.querySelectorAll('[data-zone-group]').length).toBe(6);
  });

  it('first dot group has no ml-1, subsequent groups have ml-1', () => {
    const { container } = render(
      <ChainFingerprint currentStage="anemos" showZoneSeparators />
    );
    const groups = container.querySelectorAll('[data-zone-group]');
    expect(groups[0]?.classList.contains('ml-1')).toBe(false);
    expect(groups[1]?.classList.contains('ml-1')).toBe(true);
  });

  it('allEmpty prop makes all dots unfilled regardless of currentStage', () => {
    const { container } = render(
      <ChainFingerprint currentStage="physeos" allEmpty />
    );
    const dots = container.querySelectorAll('[data-dot]');
    dots.forEach((dot) => {
      expect(dot.getAttribute('data-filled')).toBe('false');
    });
  });
});

describe('ChainFingerprint glow stages', () => {
  it('marks anemos / pyros / eureka / physeos as glow when filled and glowStages provided', () => {
    const { container } = render(
      <ChainFingerprint currentStage="physeos" glowStages={WEAPON_GLOW_STAGES} />
    );
    const dots = container.querySelectorAll('[data-dot]');
    EUREKA_STAGES.forEach((stage, i) => {
      const dot = dots[i];
      const expectedGlow = WEAPON_GLOW_STAGES.has(stage);
      expect(dot?.getAttribute('data-glow')).toBe(expectedGlow ? 'true' : null);
    });
  });

  it('does not mark elemental as glow (regression: elemental was previously incorrectly classified)', () => {
    const { container } = render(
      <ChainFingerprint currentStage="physeos" glowStages={WEAPON_GLOW_STAGES} />
    );
    const dots = container.querySelectorAll('[data-dot]');
    const elementalIdx = EUREKA_STAGES.indexOf('elemental');
    expect(dots[elementalIdx]?.getAttribute('data-glow')).toBe(null);
  });

  it('does not mark glow stages when no glowStages prop passed', () => {
    const { container } = render(<ChainFingerprint currentStage="physeos" />);
    const dots = container.querySelectorAll('[data-dot]');
    dots.forEach((dot) => {
      expect(dot.getAttribute('data-glow')).toBe(null);
    });
  });
});
