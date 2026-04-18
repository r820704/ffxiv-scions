import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RecentSkillsRow from './RecentSkillsRow';
import { eurekaData } from '@/data/eureka-data';

afterEach(cleanup);

describe('RecentSkillsRow', () => {
  it('should render nothing when recentIds is empty', () => {
    const { container } = render(
      <RecentSkillsRow recentIds={[]} onPick={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render title and icons for each recent skill', () => {
    const knownId = eurekaData.logosActions[0]!.id;
    render(<RecentSkillsRow recentIds={[knownId]} onPick={vi.fn()} />);
    expect(screen.getByText('最近使用')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should call onPick with skill id when a recent icon is clicked', () => {
    const onPick = vi.fn();
    const knownId = eurekaData.logosActions[0]!.id;
    render(<RecentSkillsRow recentIds={[knownId]} onPick={onPick} />);
    fireEvent.click(screen.getAllByRole('button')[0]!);
    expect(onPick).toHaveBeenCalledWith(knownId);
  });

  it('should skip entries for unknown skill ids', () => {
    render(<RecentSkillsRow recentIds={['nonexistent-id']} onPick={vi.fn()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
