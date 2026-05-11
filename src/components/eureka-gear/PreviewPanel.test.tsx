import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewPanel } from './PreviewPanel';
import { ELEMENTAL_ARMOR_STAGES } from '../../types/eureka-gear';
import { ELEMENTAL_ARMOR_COSTS } from '../../data/eureka-armor-costs';

const materials = {
  21801: { nameTC: '禁地水晶', icon: 60000 },
  24124: { nameTC: '湧火水晶', icon: 60000 },
};

describe('PreviewPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows hint when target is undefined', () => {
    const { container } = render(
      <PreviewPanel
        currentStage="anemos"
        targetStage={undefined}
        inventory={{}}
        onSetCurrent={() => {}}
        onClearTarget={() => {}}
        materialsMap={materials}
      />,
    );
    expect(container.textContent).toContain('選擇下方任一階段');
  });

  it('shows required materials when target > current', () => {
    render(
      <PreviewPanel
        currentStage="antiquated"
        targetStage="anemos-base"
        inventory={{ 21801: 50 }}
        onSetCurrent={() => {}}
        onClearTarget={() => {}}
        materialsMap={materials}
      />,
    );
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('shows downgrade state when target < current', () => {
    render(
      <PreviewPanel
        currentStage="pyros"
        targetStage="anemos"
        inventory={{}}
        onSetCurrent={() => {}}
        onClearTarget={() => {}}
        materialsMap={materials}
      />,
    );
    expect(screen.getByRole('button', { name: /設為目前階段/ })).toBeInTheDocument();
  });

  it('calls onSetCurrent when 升階段 button clicked (upgrade path)', () => {
    const onSetCurrent = vi.fn();
    render(
      <PreviewPanel
        currentStage="antiquated"
        targetStage="anemos-base"
        inventory={{ 21801: 100 }}
        onSetCurrent={onSetCurrent}
        onClearTarget={() => {}}
        materialsMap={materials}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /升階段/ }));
    expect(onSetCurrent).toHaveBeenCalledOnce();
  });

  it('does not render upgrade button when target is undefined', () => {
    render(
      <PreviewPanel
        currentStage="anemos"
        targetStage={undefined}
        inventory={{}}
        onSetCurrent={() => {}}
        onClearTarget={() => {}}
        materialsMap={materials}
      />,
    );
    expect(screen.queryByRole('button', { name: /升階段|取得/ })).toBeNull();
  });

  describe('未取得舊化 state (currentStage=undefined)', () => {
    it('shows 從 未開始 → target 需要 heading when target is set', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          startHint="完成70級職業任務或從失物管理人兌換"
        />,
      );
      expect(screen.getByText(/從.*未開始.*→.*禁地兵裝.*需要/)).toBeInTheDocument();
    });

    it('renders startHint as the first material list item', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          startHint="完成70級職業任務或從失物管理人兌換"
        />,
      );
      expect(screen.getByText(/完成70級職業任務或從失物管理人兌換.*× 1/)).toBeInTheDocument();
    });

    it('button label is 取得 (not 升階段) when currentStage is undefined', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          startHint="完成70級職業任務或從失物管理人兌換"
        />,
      );
      expect(screen.getByRole('button', { name: /取得/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /升階段/ })).toBeNull();
    });

    it('clicking 取得 button calls onSetCurrent', () => {
      const onSetCurrent = vi.fn();
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos"
          inventory={{}}
          onSetCurrent={onSetCurrent}
          onClearTarget={() => {}}
          materialsMap={materials}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /取得/ }));
      expect(onSetCurrent).toHaveBeenCalledOnce();
    });

    it('does not show startHint when currentStage is defined', () => {
      render(
        <PreviewPanel
          currentStage="antiquated"
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          startHint="完成70級職業任務或從失物管理人兌換"
        />,
      );
      expect(screen.queryByText(/完成70級職業任務/)).toBeNull();
    });

    it('shows full antiquated → target material cost (currentStage undefined, target anemos)', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos-base"
          inventory={{ 21801: 50 }}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          startHint="完成70級職業任務或從失物管理人兌換"
        />,
      );
      // antiquated → anemos-base = 100 × 禁地水晶
      expect(screen.getByText(/禁地水晶 × 100/)).toBeInTheDocument();
    });

    it('elemental armor: shows 湧火水晶 × 40 when currentStage undefined and target elemental', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="elemental+1"
          inventory={{ 24124: 10 }}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          stages={ELEMENTAL_ARMOR_STAGES}
          costs={ELEMENTAL_ARMOR_COSTS}
          slot="head"
        />,
      );
      expect(screen.getByText(/湧火水晶 × 40/)).toBeInTheDocument();
    });
  });
});
