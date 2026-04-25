import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RoleCard } from './RoleCard';

afterEach(() => cleanup());

const baseSlotProgress = {
  head: { currentStage: 'anemos' as const },
  body: { currentStage: 'anemos' as const },
  hands: { currentStage: 'antiquated' as const },
  legs: { currentStage: 'antiquated' as const },
  feet: { currentStage: 'antiquated' as const },
};

describe('RoleCard', () => {
  it('renders job names joined with full-width middle-dot for fending (tanks)', () => {
    render(
      <RoleCard
        set="fending"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText(/騎士 · 戰士 · 暗黑騎士 · 絕槍戰士/)).toBeInTheDocument();
  });

  it('renders job names joined with full-width middle-dot for striking (martial)', () => {
    render(
      <RoleCard
        set="striking"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText(/武僧 · 武士/)).toBeInTheDocument();
  });

  it('renders role label as smaller text in brackets', () => {
    render(
      <RoleCard
        set="fending"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText('[坦克]')).toBeInTheDocument();
  });

  it('renders role label for healing', () => {
    render(
      <RoleCard
        set="healing"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText('[治療]')).toBeInTheDocument();
  });

  it('renders role label for casting', () => {
    render(
      <RoleCard
        set="casting"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText('[法師]')).toBeInTheDocument();
  });

  it('calls onSelect with primary job ID when detail button clicked', () => {
    const onSelect = vi.fn();
    render(
      <RoleCard
        set="fending"
        pieces={baseSlotProgress}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /查看詳情/ }));
    expect(onSelect).toHaveBeenCalledWith('PLD');
  });

  it('renders job icons for all jobs in the set', () => {
    render(
      <RoleCard
        set="fending"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    // Check for multiple job icons in fending set (PLD, WAR, DRK, GNB)
    const pldIcon = screen.getByAltText('PLD');
    const warIcon = screen.getByAltText('WAR');
    const drkIcon = screen.getByAltText('DRK');
    const gnbIcon = screen.getByAltText('GNB');
    expect(pldIcon).toBeInTheDocument();
    expect(warIcon).toBeInTheDocument();
    expect(drkIcon).toBeInTheDocument();
    expect(gnbIcon).toBeInTheDocument();
  });

  it('renders ChainFingerprint for each armor slot', () => {
    const { container } = render(
      <RoleCard
        set="fending"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    // ChainFingerprint renders dots with data-dot attribute
    const dots = container.querySelectorAll('[data-dot]');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('renders slot labels (頭, 身, 手, 腿, 腳)', () => {
    render(
      <RoleCard
        set="fending"
        pieces={baseSlotProgress}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText('頭')).toBeInTheDocument();
    expect(screen.getByText('身')).toBeInTheDocument();
    expect(screen.getByText('手')).toBeInTheDocument();
    expect(screen.getByText('腿')).toBeInTheDocument();
    expect(screen.getByText('腳')).toBeInTheDocument();
  });

  it('renders with empty pieces', () => {
    render(
      <RoleCard
        set="striking"
        pieces={{}}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText(/武僧 · 武士/)).toBeInTheDocument();
    expect(screen.getByText('[近戰]')).toBeInTheDocument();
  });
});
