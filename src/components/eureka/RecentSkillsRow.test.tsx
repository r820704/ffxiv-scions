import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RecentSkillsRow from './RecentSkillsRow';
import { eurekaData } from '@/data/eureka-data';

afterEach(cleanup);

describe('RecentSkillsRow', () => {
  it('should render nothing when recentIds is empty', () => {
    const { container } = render(
      <RecentSkillsRow recentIds={[]} learnedSkills={new Set()} onPick={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render title and icons for each recent skill', () => {
    const knownId = eurekaData.logosActions[0]!.id;
    render(
      <RecentSkillsRow
        recentIds={[knownId]}
        learnedSkills={new Set([knownId])}
        onPick={vi.fn()}
      />
    );
    expect(screen.getByText('最近使用')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should call onPick with skill id when a recent icon is clicked', () => {
    const onPick = vi.fn();
    const knownId = eurekaData.logosActions[0]!.id;
    render(
      <RecentSkillsRow
        recentIds={[knownId]}
        learnedSkills={new Set([knownId])}
        onPick={onPick}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]!);
    expect(onPick).toHaveBeenCalledWith(knownId);
  });

  it('should skip entries for unknown skill ids', () => {
    render(
      <RecentSkillsRow
        recentIds={['nonexistent-id']}
        learnedSkills={new Set()}
        onPick={vi.fn()}
      />
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should visually dim skills not yet learned but still render them', () => {
    const knownId = eurekaData.logosActions[0]!.id;
    render(
      <RecentSkillsRow
        recentIds={[knownId]}
        learnedSkills={new Set()}
        onPick={vi.fn()}
      />
    );
    const btn = screen.getAllByRole('button')[0]!;
    expect(btn.className).toContain('opacity-40');
  });
});
