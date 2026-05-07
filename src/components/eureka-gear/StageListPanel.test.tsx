import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StageListPanel } from './StageListPanel';
import { ARMOR_STAGES_BY_TRACK } from '../../types/eureka-gear';

afterEach(cleanup);

const stages = ARMOR_STAGES_BY_TRACK.anemos;

describe('StageListPanel', () => {
  it('renders collapsed by default', () => {
    render(
      <StageListPanel
        stages={stages}
        currentStage={null}
        onSelectTarget={vi.fn()}
      />
    );
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByRole('button', { name: /展開階段列表/ })).toBeInTheDocument();
  });

  it('expands on click and shows stage rows', () => {
    render(
      <StageListPanel
        stages={stages}
        currentStage={null}
        onSelectTarget={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /展開階段列表/ }));
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
  });

  it('calls onSelectTarget when a stage row is clicked', () => {
    const onSelectTarget = vi.fn();
    render(
      <StageListPanel
        stages={stages}
        currentStage={null}
        onSelectTarget={onSelectTarget}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /展開階段列表/ }));
    const rows = screen.getAllByRole('button');
    // rows[0] = toggle, rows[1..n] = stage rows
    fireEvent.click(rows[1]!);
    expect(onSelectTarget).toHaveBeenCalledWith(stages[0]);
  });

  it('marks current stage with 目前 label', () => {
    render(
      <StageListPanel
        stages={stages}
        currentStage="anemos-base"
        onSelectTarget={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /展開階段列表/ }));
    expect(screen.getByText('目前')).toBeInTheDocument();
  });

  it('marks target stage with 目標 label', () => {
    render(
      <StageListPanel
        stages={stages}
        currentStage="anemos-base"
        targetStage="anemos"
        onSelectTarget={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /展開階段列表/ }));
    expect(screen.getByText('目標')).toBeInTheDocument();
  });

  it('routes clicks to onSelectStart when chain not started and handler provided', () => {
    const onSelectStart = vi.fn();
    const onSelectTarget = vi.fn();
    render(
      <StageListPanel
        stages={stages}
        currentStage={null}
        onSelectTarget={onSelectTarget}
        onSelectStart={onSelectStart}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /展開階段列表/ }));
    const rows = screen.getAllByRole('button');
    // Click stage row 3 (anemos+1)
    fireEvent.click(rows[3]!);
    expect(onSelectStart).toHaveBeenCalledWith(stages[2]);
    expect(onSelectTarget).not.toHaveBeenCalled();
  });
});
