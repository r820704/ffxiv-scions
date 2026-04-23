import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DetailTab } from './DetailTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

afterEach(() => cleanup());

describe('DetailTab', () => {
  it('renders selected job weapon section', () => {
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}
      />,
    );
    expect(screen.getAllByText(/武器/).length).toBeGreaterThan(0);
  });

  it('job switcher dropdown exists and fires onSelectJob', () => {
    const onSelectJob = vi.fn();
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        materialsMap={{}}
        onSelectJob={onSelectJob}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}
      />,
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'WAR' } });
    expect(onSelectJob).toHaveBeenCalledWith('WAR');
  });

  it('clicking a stepper node fires onSetTarget', () => {
    const onSetTarget = vi.fn();
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={onSetTarget}
        onRequestUpgrade={() => {}}
      />,
    );
    const nodes = screen.getAllByRole('button', { name: /stage/ });
    fireEvent.click(nodes[3]!);
    expect(onSetTarget).toHaveBeenCalled();
  });
});
