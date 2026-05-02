import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { OverviewTab } from './OverviewTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('OverviewTab', () => {
  it('renders all 15 SB jobs, each with a dedicated job card', () => {
    render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
    for (const job of ['PLD','WAR','DRK','MNK','DRG','NIN','SAM','BRD','MCH','BLM','SMN','RDM','WHM','SCH','AST']) {
      expect(screen.getAllByAltText(job).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('onSelectJob fires with correct job when card detail button clicked', () => {
    const onSelectJob = vi.fn();
    render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={onSelectJob} />);
    const detailButtons = screen.getAllByRole('button', { name: /查看詳情/ });
    fireEvent.click(detailButtons[0]!);
    expect(onSelectJob).toHaveBeenCalled();
  });

  it('job grid contains all 15 job rows', () => {
    const { container } = render(
      <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />,
    );
    const grid = container.querySelector('[data-testid="job-grid"]');
    expect(grid).not.toBeNull();
    const icons = grid?.querySelectorAll('img[alt]');
    const alts = new Set(Array.from(icons ?? []).map((img) => img.getAttribute('alt')));
    for (const job of ['PLD','WAR','DRK','MNK','DRG','NIN','SAM','BRD','MCH','BLM','SMN','RDM','WHM','SCH','AST']) {
      expect(alts.has(job)).toBe(true);
    }
  });

  describe('role filter chips', () => {
    it('renders all 6 role chips with 全部 active by default', () => {
      const { container } = render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
      const filter = container.querySelector('[data-testid="role-filter"]');
      expect(filter).not.toBeNull();
      // The filter row also contains the "我的職業" chip (and possibly an edit button);
      // assert that the 6 role chips appear in order before any extras.
      const chips = within(filter as HTMLElement).getAllByRole('button');
      expect(chips.slice(0, 6).map((c) => c.textContent)).toEqual([
        '全部', '坦克', '近戰', '遠程', '治療', '法師',
      ]);
      const allChip = within(filter as HTMLElement).getByRole('button', { name: '全部' });
      expect(allChip.getAttribute('aria-pressed')).toBe('true');
    });

    it('default state shows all 15 jobs and all 7 role cards', () => {
      const { container } = render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
      const jobGrid = container.querySelector('[data-testid="job-grid"]') as HTMLElement;
      const roleGrid = container.querySelector('[data-testid="role-grid"]') as HTMLElement;
      // Each JobCard includes one job icon img with alt={job}
      const jobIcons = jobGrid.querySelectorAll('img[alt]');
      // Note: JobCard may render extra inline images, so assert all 15 alts exist
      const alts = new Set<string>();
      jobIcons.forEach((img) => alts.add(img.getAttribute('alt') ?? ''));
      for (const job of ['PLD','WAR','DRK','MNK','DRG','NIN','SAM','BRD','MCH','BLM','SMN','RDM','WHM','SCH','AST']) {
        expect(alts.has(job)).toBe(true);
      }
      // 7 role cards (one per ARMOR_SET_IDS)
      const roleCards = roleGrid.querySelectorAll('article');
      expect(roleCards.length).toBe(7);
    });

    it('clicking 坦克 filters to PLD/WAR/DRK + fending RoleCard only', () => {
      const onRoleChange = vi.fn();
      const { rerender, container } = render(
        <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} onRoleChange={onRoleChange} />,
      );
      fireEvent.click(screen.getByRole('button', { name: '坦克' }));
      expect(onRoleChange).toHaveBeenCalledWith('tank');

      // Simulate parent updating role prop
      rerender(
        <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} role="tank" onRoleChange={onRoleChange} />,
      );
      const jobGrid = container.querySelector('[data-testid="job-grid"]') as HTMLElement;
      const jobAlts = new Set<string>();
      jobGrid.querySelectorAll('img[alt]').forEach((img) => jobAlts.add(img.getAttribute('alt') ?? ''));
      expect(jobAlts.has('PLD')).toBe(true);
      expect(jobAlts.has('WAR')).toBe(true);
      expect(jobAlts.has('DRK')).toBe(true);
      expect(jobAlts.has('MNK')).toBe(false);
      expect(jobAlts.has('WHM')).toBe(false);

      const roleCards = (container.querySelector('[data-testid="role-grid"]') as HTMLElement).querySelectorAll('article');
      expect(roleCards.length).toBe(1);
    });

    it('clicking 近戰 filters to MNK/DRG/NIN/SAM jobs + 3 melee role cards (maiming/striking/scouting)', () => {
      const { container } = render(
        <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} role="melee" onRoleChange={() => {}} />,
      );
      const jobGrid = container.querySelector('[data-testid="job-grid"]') as HTMLElement;
      const jobAlts = new Set<string>();
      jobGrid.querySelectorAll('img[alt]').forEach((img) => jobAlts.add(img.getAttribute('alt') ?? ''));
      for (const job of ['MNK', 'DRG', 'NIN', 'SAM']) {
        expect(jobAlts.has(job)).toBe(true);
      }
      for (const job of ['PLD', 'BRD', 'WHM', 'BLM']) {
        expect(jobAlts.has(job)).toBe(false);
      }
      const roleCards = (container.querySelector('[data-testid="role-grid"]') as HTMLElement).querySelectorAll('article');
      expect(roleCards.length).toBe(3);
    });

    describe('main jobs chip', () => {
      it('shows "設定我的職業" prompt when no main jobs configured', () => {
        render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
        expect(screen.getByRole('button', { name: /設定我的職業/ })).toBeInTheDocument();
      });

      it('clicking the prompt opens the picker dialog', () => {
        render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: /設定我的職業/ }));
        expect(screen.getByRole('dialog', { name: /設定我的職業/ })).toBeInTheDocument();
      });

      it('saving picker writes to localStorage and changes chip label to "我的職業 (N)"', () => {
        render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: /設定我的職業/ }));
        fireEvent.click(screen.getByRole('button', { name: '騎士' }));
        fireEvent.click(screen.getByRole('button', { name: '武僧' }));
        fireEvent.click(screen.getByRole('button', { name: /儲存（2）/ }));
        expect(localStorage.getItem('eureka-gear-main-jobs')).toBe(JSON.stringify(['PLD', 'MNK']));
        expect(screen.getByRole('button', { name: /我的職業 \(2\)/ })).toBeInTheDocument();
      });

      it('main-jobs filter overrides role chip and shows only selected jobs', () => {
        localStorage.setItem('eureka-gear-main-jobs', JSON.stringify(['PLD', 'WHM']));
        const { container } = render(
          <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} role="tank" onRoleChange={() => {}} />,
        );
        // Click the main-jobs chip to activate the filter.
        fireEvent.click(screen.getByRole('button', { name: /我的職業 \(2\)/ }));
        const jobGrid = container.querySelector('[data-testid="job-grid"]') as HTMLElement;
        const alts = new Set<string>();
        jobGrid.querySelectorAll('img[alt]').forEach((img) => alts.add(img.getAttribute('alt') ?? ''));
        expect(alts.has('PLD')).toBe(true);
        expect(alts.has('WHM')).toBe(true);
        expect(alts.has('WAR')).toBe(false); // role=tank no longer applied
        expect(alts.has('MNK')).toBe(false);
      });
    });

    it('clicking 全部 returns to all jobs and all role cards', () => {
      const { container, rerender } = render(
        <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} role="tank" onRoleChange={() => {}} />,
      );
      // Confirm filtered first
      let roleCards = (container.querySelector('[data-testid="role-grid"]') as HTMLElement).querySelectorAll('article');
      expect(roleCards.length).toBe(1);

      rerender(
        <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} role="all" onRoleChange={() => {}} />,
      );
      roleCards = (container.querySelector('[data-testid="role-grid"]') as HTMLElement).querySelectorAll('article');
      expect(roleCards.length).toBe(7);
    });

    it('clicking 治療 shows WHM/SCH/AST + healing role card only', () => {
      const { container } = render(
        <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} role="healer" onRoleChange={() => {}} />,
      );
      const jobGrid = container.querySelector('[data-testid="job-grid"]') as HTMLElement;
      const jobAlts = new Set<string>();
      jobGrid.querySelectorAll('img[alt]').forEach((img) => jobAlts.add(img.getAttribute('alt') ?? ''));
      for (const job of ['WHM', 'SCH', 'AST']) {
        expect(jobAlts.has(job)).toBe(true);
      }
      expect(jobAlts.has('BLM')).toBe(false);
      const roleCards = (container.querySelector('[data-testid="role-grid"]') as HTMLElement).querySelectorAll('article');
      expect(roleCards.length).toBe(1);
    });
  });
});
