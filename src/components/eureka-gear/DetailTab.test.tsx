import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { DetailTab } from './DetailTab';
import { emptyInventoryV3 } from '../../utils/eureka-gear-migrate';

beforeEach(() => {
  window.localStorage.clear();
});
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

      />,
    );
    expect(screen.getAllByText(/武器/).length).toBeGreaterThan(0);
  });

  it('job picker chips fire onSelectJob when clicked', () => {
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

      />,
    );
    const picker = screen.getByRole('complementary', { name: '職業選擇' });
    const warChip = within(picker).getByRole('button', { name: '戰士' });
    fireEvent.click(warChip);
    expect(onSelectJob).toHaveBeenCalledWith('WAR');
  });

  it('job picker marks the selected job with aria-pressed', () => {
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="WAR"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}

      />,
    );
    const picker = screen.getByRole('complementary', { name: '職業選擇' });
    const warChip = within(picker).getByRole('button', { name: '戰士' });
    expect(warChip.getAttribute('aria-pressed')).toBe('true');
    const pldChip = within(picker).getByRole('button', { name: '騎士' });
    expect(pldChip.getAttribute('aria-pressed')).toBe('false');
  });

  it('clicking a stepper node fires onSetTarget', () => {
    const onSetTarget = vi.fn();
    const inv = {
      ...emptyInventoryV3(),
      weapons: { 'pld-galatyn': { currentStage: 'antiquated' as const } },
    };
    render(
      <DetailTab
        inventory={inv}
        selectedJob="PLD"
        weapons={[]}
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

    it('default state: all armor slots collapsed in each track', () => {
      renderTab();
      // 5 slots × 2 tracks = 10 accordion buttons + 2 track section buttons + 1 weapon accordion = 13.
      // Exclude StageListPanel toggles (text contains "階段列表") which also
      // carry aria-expanded but are not accordion controls.
      const allAccordions = screen
        .getAllByRole('button')
        .filter(
          (b) =>
            b.hasAttribute('aria-expanded') &&
            !(b.textContent ?? '').includes('階段列表'),
        );
      expect(allAccordions.length).toBe(13);

      const headBtns = slotButtons('頭');
      const bodyBtns = slotButtons('身');
      expect(headBtns.length).toBe(2);
      expect(bodyBtns.length).toBe(2);
      headBtns.forEach((b) => expect(b.getAttribute('aria-expanded')).toBe('false'));
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

    it('clicking 頭 header expands a collapsed head slot', () => {
      renderTab();
      const headBtns = slotButtons('頭');
      expect(headBtns[0]!.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(headBtns[0]!);
      const updated = slotButtons('頭');
      expect(updated[0]!.getAttribute('aria-expanded')).toBe('true');
    });

    it('two tracks maintain independent accordion state', () => {
      renderTab();
      const bodyBtns = slotButtons('身');
      // Expand 身 in 常風 (first track) only.
      fireEvent.click(bodyBtns[0]!);
      const after = slotButtons('身');
      expect(after[0]!.getAttribute('aria-expanded')).toBe('true');
      expect(after[1]!.getAttribute('aria-expanded')).toBe('false');

      // Now expand 頭 in 元素 (second track) only.
      const headBtns = slotButtons('頭');
      fireEvent.click(headBtns[1]!);
      const headsAfter = slotButtons('頭');
      expect(headsAfter[0]!.getAttribute('aria-expanded')).toBe('false');
      expect(headsAfter[1]!.getAttribute('aria-expanded')).toBe('true');
    });

    it('collapsed slots do not render their ChainStepper', () => {
      renderTab();
      // All armor slots are collapsed by default; none should have a stepper.
      // Skip '手' because the weapon accordion ('主手') text also matches it.
      for (const slotLabel of ['頭', '身', '腿', '腳']) {
        const btns = slotButtons(slotLabel);
        btns.forEach((btn) => {
          const parent = btn.parentElement!;
          expect(within(parent).queryByTestId('stepper-container')).toBeNull();
        });
      }
    });

    describe('expand state persistence (survives unmount/remount like tab switch)', () => {
      it('per-slot expand state of each track is restored on remount', () => {
        const { unmount } = renderTab();
        // Expand 身 in 常風 (first track) and 頭 in 元素 (second track).
        fireEvent.click(slotButtons('身')[0]!);
        fireEvent.click(slotButtons('頭')[1]!);
        unmount();

        // Remount: previously expanded slots should still be expanded.
        renderTab();
        const bodyAfter = slotButtons('身');
        const headAfter = slotButtons('頭');
        expect(bodyAfter[0]!.getAttribute('aria-expanded')).toBe('true');
        expect(bodyAfter[1]!.getAttribute('aria-expanded')).toBe('false');
        expect(headAfter[0]!.getAttribute('aria-expanded')).toBe('false');
        expect(headAfter[1]!.getAttribute('aria-expanded')).toBe('true');
      });

      it('section-level expand state is restored on remount', () => {
        const { unmount } = renderTab();
        // Find the two armor section toggles (常風防具 / 元素防具) — they have
        // aria-expanded and the text matches the title.
        const sectionBtns = screen
          .getAllByRole('button')
          .filter((b) => b.hasAttribute('aria-expanded') && (b.textContent ?? '').match(/(常風|元素)防具/));
        expect(sectionBtns.length).toBe(2);
        // Both default to expanded; collapse the elemental track.
        const elementalBtn = sectionBtns.find((b) => (b.textContent ?? '').includes('元素'))!;
        expect(elementalBtn.getAttribute('aria-expanded')).toBe('true');
        fireEvent.click(elementalBtn);
        expect(elementalBtn.getAttribute('aria-expanded')).toBe('false');
        unmount();

        // Remount: elemental section should still be collapsed.
        renderTab();
        const sectionBtnsAfter = screen
          .getAllByRole('button')
          .filter((b) => b.hasAttribute('aria-expanded') && (b.textContent ?? '').match(/(常風|元素)防具/));
        const elementalAfter = sectionBtnsAfter.find((b) => (b.textContent ?? '').includes('元素'))!;
        const anemosAfter = sectionBtnsAfter.find((b) => (b.textContent ?? '').includes('常風'))!;
        expect(elementalAfter.getAttribute('aria-expanded')).toBe('false');
        expect(anemosAfter.getAttribute('aria-expanded')).toBe('true');
      });
    });
  });

  it('clicking any stage on an unstarted chain calls onSetTarget directly (B1 unified behavior)', () => {
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
      />,
    );
    // Click stage 4 on the first weapon chain (anemos)
    const stageButtons = screen.getAllByRole('button', { name: /stage/ });
    fireEvent.click(stageButtons[3]!);
    expect(onSetTarget).toHaveBeenCalled();
    // First arg is the ChainRef; second is the stage
    const [, stage] = onSetTarget.mock.calls[0]!;
    expect(typeof stage).toBe('string');
  });

  it('clicking the currentStage on a started chain clears the target', () => {
    const onSetTarget = vi.fn();
    const inv = {
      ...emptyInventoryV3(),
      weapons: { 'pld-galatyn': { currentStage: 'anemos-base' as const, targetStage: 'anemos' as const } },
    };
    render(
      <DetailTab
        inventory={inv}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={onSetTarget}
        onRequestUpgrade={() => {}}
      />,
    );
    // Click stage 2 (anemos-base = current); should clear target
    const stageButtons = screen.getAllByRole('button', { name: /stage/ });
    fireEvent.click(stageButtons[1]!);
    expect(onSetTarget).toHaveBeenCalled();
    const [, stage] = onSetTarget.mock.calls[0]!;
    expect(stage).toBeUndefined();
  });

  it('全展開 button expands all armor slot accordions', () => {
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}

      />,
    );
    const allAccordions = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'));
    const collapsed = allAccordions.filter((b) => b.getAttribute('aria-expanded') === 'false');
    expect(collapsed.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: '展開所有防具欄位' }));
    // Only check accordion-type buttons (exclude StageListPanel toggles which stay
    // independently collapsed and are not controlled by the global expand button).
    const afterExpand = screen
      .getAllByRole('button')
      .filter(
        (b) =>
          b.hasAttribute('aria-expanded') &&
          !(b.textContent ?? '').includes('階段列表'),
      );
    afterExpand.forEach((b) => expect(b.getAttribute('aria-expanded')).toBe('true'));
  });

  it('clicking 重置 button for a started weapon opens confirm dialog and calls onClearChain on confirm', () => {
    const onClearChain = vi.fn();
    const inv = {
      ...emptyInventoryV3(),
      weapons: { 'pld-galatyn': { currentStage: 'antiquated' as const } },
    };
    render(
      <DetailTab
        inventory={inv}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}

        onClearChain={onClearChain}
      />,
    );
    const resetBtn = screen.getByRole('button', { name: /重置主手武器進度/ });
    fireEvent.click(resetBtn);
    expect(screen.getByText('重置此裝備進度')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '確認重置' }));
    expect(onClearChain).toHaveBeenCalled();
  });

  it('全收合 button collapses all armor slot accordions', () => {
    render(
      <DetailTab
        inventory={emptyInventoryV3()}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}

      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '收合所有防具欄位' }));
    // Weapon accordion is not controlled by the armor global collapse button.
    // Only check armor-related accordions (exclude weapon accordion "主手" and StageListPanel toggles).
    const armorAccordions = screen
      .getAllByRole('button')
      .filter(
        (b) =>
          b.hasAttribute('aria-expanded') &&
          !(b.textContent ?? '').includes('階段列表') &&
          !(b.textContent ?? '').includes('主手'),
      );
    armorAccordions.forEach((b) => expect(b.getAttribute('aria-expanded')).toBe('false'));
  });

  it('started anemos slot shows item name with iL in accordion header', () => {
    const inv = {
      ...emptyInventoryV3(),
      armor: {
        ...emptyInventoryV3().armor,
        anemos: { PLD: { head: { currentStage: 'anemos-base' as const } } },
      },
    };
    render(
      <DetailTab
        inventory={inv}
        selectedJob="PLD"
        weapons={[]}
        materialsMap={{}}
        onSelectJob={() => {}}
        onSetTarget={() => {}}
        onRequestUpgrade={() => {}}

      />,
    );
    expect(screen.getByText(/俠義頭冠/)).toBeInTheDocument();
    expect(screen.getByText(/iL335/)).toBeInTheDocument();
  });

  describe('armor track section collapse', () => {
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

        />,
      );
    }

    it('常風防具 section has a toggle button expanded by default', () => {
      renderTab();
      const toggle = screen.getByRole('button', { name: /收合 常風防具/ });
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('clicking 常風防具 header collapses the section', () => {
      renderTab();
      const toggle = screen.getByRole('button', { name: /收合 常風防具/ });
      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('元素防具 section also has a toggle button', () => {
      renderTab();
      expect(screen.getByRole('button', { name: /收合 元素防具/ })).toBeInTheDocument();
    });

    it('全展開 re-expands a manually-collapsed section header', () => {
      render(
        <DetailTab
          inventory={emptyInventoryV3()}
          selectedJob="PLD"
          weapons={[]}
          materialsMap={{}}
          onSelectJob={() => {}}
          onSetTarget={() => {}}
          onRequestUpgrade={() => {}}

        />,
      );
      // Collapse the 常風防具 section manually
      const toggle = screen.getByRole('button', { name: /收合 常風防具/ });
      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      // Click 全展開
      fireEvent.click(screen.getByRole('button', { name: '展開所有防具欄位' }));

      // Section header should be re-expanded
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });
  });
});
