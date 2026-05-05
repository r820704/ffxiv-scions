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
    expect(screen.getByAltText('PLD')).toBeInTheDocument();
    expect(screen.getByAltText('WAR')).toBeInTheDocument();
    expect(screen.getByAltText('DRK')).toBeInTheDocument();
    expect(screen.getByAltText('GNB')).toBeInTheDocument();
  });

  it('renders job combination names as heading text for fending', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText(/騎士 · 戰士 · 暗黑騎士 · 絕槍戰士/)).toBeInTheDocument();
  });

  it('renders job combination names as heading text for maiming', () => {
    render(<RoleCard set="maiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText(/龍騎士 · 奪魂者/)).toBeInTheDocument();
  });

  it('renders job icons for striking (MNK/SAM)', () => {
    render(<RoleCard set="striking" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByAltText('MNK')).toBeInTheDocument();
    expect(screen.getByAltText('SAM')).toBeInTheDocument();
  });

  it('renders job icons for maiming (DRG/RPR)', () => {
    render(<RoleCard set="maiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByAltText('DRG')).toBeInTheDocument();
    expect(screen.getByAltText('RPR')).toBeInTheDocument();
  });

  it('renders job icons for scouting (NIN/VPR)', () => {
    render(<RoleCard set="scouting" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByAltText('NIN')).toBeInTheDocument();
    expect(screen.getByAltText('VPR')).toBeInTheDocument();
  });

  it('renders job icons for aiming (BRD/MCH/DNC)', () => {
    render(<RoleCard set="aiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByAltText('BRD')).toBeInTheDocument();
    expect(screen.getByAltText('MCH')).toBeInTheDocument();
    expect(screen.getByAltText('DNC')).toBeInTheDocument();
  });

  it('renders role label [坦克] for fending', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('[坦克]')).toBeInTheDocument();
  });

  it('renders role label for healing', () => {
    render(<RoleCard set="healing" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('[治療]')).toBeInTheDocument();
  });

  it('renders role label for casting', () => {
    render(<RoleCard set="casting" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('[法師]')).toBeInTheDocument();
  });

  it('renders role label as [近戰] for maiming', () => {
    render(<RoleCard set="maiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('[近戰]')).toBeInTheDocument();
  });

  it('renders role label as [近戰] for scouting', () => {
    render(<RoleCard set="scouting" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('[近戰]')).toBeInTheDocument();
  });

  it('renders role label as [遠程] for aiming', () => {
    render(<RoleCard set="aiming" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('[遠程]')).toBeInTheDocument();
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
    expect(screen.getByText('[近戰]')).toBeInTheDocument();
    expect(screen.getByAltText('MNK')).toBeInTheDocument();
    expect(screen.getByText(/武僧 · 武士/)).toBeInTheDocument();
  });

  it('shows elemental armor chip label', () => {
    render(<RoleCard set="fending" pieces={baseSlotProgress} onSelect={() => {}} />);
    expect(screen.getByText('元素防具')).toBeInTheDocument();
  });

  it('shows 0/3 count for all unstarted slots', () => {
    const { container } = render(
      <RoleCard set="fending" pieces={{}} onSelect={() => {}} />,
    );
    const countSpans = Array.from(container.querySelectorAll('.tabular-nums'));
    const zeroCountSpans = countSpans.filter((el) => el.textContent?.startsWith('0'));
    expect(zeroCountSpans.length).toBe(5);
  });

  it('shows filled count for started slots', () => {
    const { container } = render(
      <RoleCard
        set="fending"
        pieces={{ head: { currentStage: 'elemental' as const } }}
        onSelect={() => {}}
      />,
    );
    // elemental is index 0 in ELEMENTAL_ARMOR_STAGES → filled = 1
    const countSpans = Array.from(container.querySelectorAll('.tabular-nums'));
    const headCount = countSpans.find((el) => el.textContent?.startsWith('1'));
    expect(headCount).toBeTruthy();
  });
});
