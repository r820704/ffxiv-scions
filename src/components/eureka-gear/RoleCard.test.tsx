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
  it('renders job icons for all jobs in fending (PLD/WAR/DRK/GNB)', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    // Mobile + desktop variants both render the jobs line; assert at least one match.
    for (const j of ['PLD', 'WAR', 'DRK', 'GNB']) {
      expect(screen.getAllByAltText(j).length).toBeGreaterThan(0);
    }
  });

  it('renders each job name beside its icon for fending', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    for (const name of ['騎士', '戰士', '暗黑騎士', '絕槍戰士']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it('renders each job name beside its icon for maiming', () => {
    render(<RoleCard set="maiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    for (const name of ['龍騎士', '奪魂者']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it('renders job icons for striking (MNK/SAM)', () => {
    render(<RoleCard set="striking" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByAltText('MNK').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('SAM').length).toBeGreaterThan(0);
  });

  it('renders job icons for maiming (DRG/RPR)', () => {
    render(<RoleCard set="maiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByAltText('DRG').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('RPR').length).toBeGreaterThan(0);
  });

  it('renders job icons for scouting (NIN/VPR)', () => {
    render(<RoleCard set="scouting" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByAltText('NIN').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('VPR').length).toBeGreaterThan(0);
  });

  it('renders job icons for aiming (BRD/MCH/DNC)', () => {
    render(<RoleCard set="aiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByAltText('BRD').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('MCH').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('DNC').length).toBeGreaterThan(0);
  });

  it('renders role label [坦克] for fending', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByText('[坦克]').length).toBeGreaterThan(0);
  });

  it('renders role label for healing', () => {
    render(<RoleCard set="healing" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByText('[治療]').length).toBeGreaterThan(0);
  });

  it('renders role label for casting', () => {
    render(<RoleCard set="casting" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByText('[法師]').length).toBeGreaterThan(0);
  });

  it('renders role label as [近戰] for maiming', () => {
    render(<RoleCard set="maiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByText('[近戰]').length).toBeGreaterThan(0);
  });

  it('renders role label as [近戰] for scouting', () => {
    render(<RoleCard set="scouting" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByText('[近戰]').length).toBeGreaterThan(0);
  });

  it('renders role label as [遠程] for aiming', () => {
    render(<RoleCard set="aiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getAllByText('[遠程]').length).toBeGreaterThan(0);
  });

  it('calls onSelect with primary job ID when detail button clicked', () => {
    const onSelect = vi.fn();
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /查看詳情/ }));
    expect(onSelect).toHaveBeenCalledWith('PLD');
  });

  it('renders armor dots for each slot', () => {
    const { container } = render(
      <RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />,
    );
    // ArmorDots renders rounded-full dot spans
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('renders slot labels (頭, 身, 手, 腿, 腳)', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('頭')).toBeInTheDocument();
    expect(screen.getByText('身')).toBeInTheDocument();
    expect(screen.getByText('手')).toBeInTheDocument();
    expect(screen.getByText('腿')).toBeInTheDocument();
    expect(screen.getByText('腳')).toBeInTheDocument();
  });

  it('renders with empty pieces', () => {
    render(<RoleCard set="striking" pieces={{}} onSelect={() => {}} />);
    expect(screen.getAllByText('[近戰]').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('MNK').length).toBeGreaterThan(0);
    expect(screen.getAllByText('武僧').length).toBeGreaterThan(0);
    expect(screen.getAllByText('武士').length).toBeGreaterThan(0);
  });

  it('shows elemental armor chip label', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    // Mobile + desktop variants each render the badge; assert at least one is present.
    expect(screen.getAllByText('元素防具').length).toBeGreaterThan(0);
  });

});
