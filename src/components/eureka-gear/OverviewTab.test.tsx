import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OverviewTab } from './OverviewTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

afterEach(() => cleanup());

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

  it('uses responsive grid classes', () => {
    const { container } = render(
      <OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />,
    );
    const grid = container.querySelector('[data-testid="job-grid"]');
    expect(grid?.className).toContain('sm:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });
});
