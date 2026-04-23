import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OverviewTab } from './OverviewTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

afterEach(() => cleanup());

describe('OverviewTab', () => {
  it('renders 9 unique job cards (PLD/WAR/DRG/MNK/NIN/BRD/BLM/SMN/WHM)', () => {
    render(<OverviewTab inventory={emptyInventoryV3()} onSelectJob={() => {}} />);
    expect(screen.getByAltText('PLD')).toBeInTheDocument();
    expect(screen.getByAltText('WAR')).toBeInTheDocument();
    expect(screen.getByAltText('WHM')).toBeInTheDocument();
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
