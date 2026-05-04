import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { DetailTab } from './DetailTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

afterEach(() => cleanup());

describe('DetailTab', () => {
  it('renders selected job weapon section', () => {
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}
        onStartChain={() => {}}
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
        weapons={[]}
        materialsMap={{}}
        onSelectJob={onSelectJob}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}
        onStartChain={() => {}}
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
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={onSetTarget}
        onRequestUpgrade={() => {}}
        onStartChain={() => {}}
      />,
    );
    const nodes = screen.getAllByRole('button', { name: /stage/ });
    fireEvent.click(nodes[3]!);
    expect(onSetTarget).toHaveBeenCalled();
  });

  describe('armor accordion', () => {
    function renderTab() {
      return render(
        <DetailTab
          inventory={emptyInventoryV3()}
          selectedJob="PLD"
          weapons={[]}
          materialsMap={{}}
          onSelectJob={() => {}}
          onSetTarget={() => {}}
          onRequestUpgrade={() => {}}
          onStartChain={() => {}}
        />,
      );
    }

    function slotButtons(slotChar: string) {
      // Accordion item buttons have aria-expanded set; filter by visible Chinese
      // slot label inside the button text (which is prefixed with ▼/▶).
      return screen
        .getAllByRole('button')
        .filter((b) => b.hasAttribute('aria-expanded') && (b.textContent ?? '').includes(slotChar));
    }

    it('default state: head slot expanded, others collapsed in each track', () => {
      renderTab();
      // 5 slots × 2 tracks = 10 accordion buttons total.
      const allAccordions = screen
        .getAllByRole('button')
        .filter((b) => b.hasAttribute('aria-expanded'));
      expect(allAccordions.length).toBe(10);

      const headBtns = slotButtons('頭');
      const bodyBtns = slotButtons('身');
      expect(headBtns.length).toBe(2);
      expect(bodyBtns.length).toBe(2);
      headBtns.forEach((b) => expect(b.getAttribute('aria-expanded')).toBe('true'));
      bodyBtns.forEach((b) => expect(b.getAttribute('aria-expanded')).toBe('false'));
    });

    it('clicking 身 header expands that slot in its track', () => {
      renderTab();
      const bodyBtns = slotButtons('身');
      expect(bodyBtns[0]!.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(bodyBtns[0]!);
      const updated = slotButtons('身');
      expect(updated[0]!.getAttribute('aria-expanded')).toBe('true');
      // The other track's body slot stays collapsed.
      expect(updated[1]!.getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking 頭 header collapses an expanded head slot', () => {
      renderTab();
      const headBtns = slotButtons('頭');
      expect(headBtns[0]!.getAttribute('aria-expanded')).toBe('true');
      fireEvent.click(headBtns[0]!);
      const updated = slotButtons('頭');
      expect(updated[0]!.getAttribute('aria-expanded')).toBe('false');
    });

    it('two tracks maintain independent accordion state', () => {
      renderTab();
      const bodyBtns = slotButtons('身');
      // Expand 身 in 常風 (first track) only.
      fireEvent.click(bodyBtns[0]!);
      const after = slotButtons('身');
      expect(after[0]!.getAttribute('aria-expanded')).toBe('true');
      expect(after[1]!.getAttribute('aria-expanded')).toBe('false');

      // Now collapse 頭 in 元素 (second track) only.
      const headBtns = slotButtons('頭');
      fireEvent.click(headBtns[1]!);
      const headsAfter = slotButtons('頭');
      expect(headsAfter[0]!.getAttribute('aria-expanded')).toBe('true');
      expect(headsAfter[1]!.getAttribute('aria-expanded')).toBe('false');
    });

    it('collapsed slots do not render their ChainStepper', () => {
      renderTab();
      // For each collapsed (身) slot accordion, the parent <div> should not contain
      // a stepper (it's only the button alone). The expanded head slots WILL contain one.
      const bodyBtns = slotButtons('身');
      bodyBtns.forEach((btn) => {
        const parent = btn.parentElement!;
        expect(within(parent).queryByTestId('stepper-container')).toBeNull();
      });
      const headBtns = slotButtons('頭');
      headBtns.forEach((btn) => {
        const parent = btn.parentElement!;
        expect(within(parent).queryByTestId('stepper-container')).not.toBeNull();
      });
    });
  });

  it('clicking stage 1 button when chain not started opens start dialog', () => {
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}
        onStartChain={() => {}}
      />,
    );
    const stageButtons = screen.getAllByRole('button', { name: /stage 1/ });
    fireEvent.click(stageButtons[0]!);
    expect(screen.getByText('標記為已開始')).toBeInTheDocument();
  });
});
