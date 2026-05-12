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

  it('button label is 升階段 with target name on upgrade path', () => {
    render(
      <PreviewPanel
        currentStage="antiquated"
        targetStage="anemos-base"
        inventory={{ 21801: 100 }}
        onSetCurrent={() => {}}
        onClearTarget={() => {}}
        materialsMap={materials}
        targetLabel="anemos-base 武器"
      />,
    );
    expect(screen.getByRole('button', { name: /升階段.*anemos-base 武器/ })).toBeInTheDocument();
  });

  it('clicking 升階段 button fires onSetCurrent', () => {
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
    expect(screen.queryByRole('button', { name: /升階段/ })).toBeNull();
  });

  describe('未取得舊化 state (currentStage=undefined)', () => {
    it('shows 從 未開始 → target 需要 heading', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
        />,
      );
      expect(screen.getByText(/從.*未開始.*→.*禁地兵裝.*需要/)).toBeInTheDocument();
    });

    it('renders prereqRows as list items with × 1 and obtain method in parens', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          prereqRows={[
            { name: '舊化的嘉拉汀', obtainMethod: '完成70級職業任務或從失物管理人兌換取得' },
            { name: '舊化的艾瓦拉克血十字盾', obtainMethod: '完成70級職業任務或從失物管理人兌換取得' },
          ]}
        />,
      );
      expect(screen.getByText(/舊化的嘉拉汀 × 1/)).toBeInTheDocument();
      expect(screen.getByText(/舊化的艾瓦拉克血十字盾 × 1/)).toBeInTheDocument();
      const obtainMethodEls = screen.getAllByText(/完成70級職業任務或從失物管理人兌換取得/);
      expect(obtainMethodEls.length).toBe(2);
    });

    it('button label is 升階段 (target) — no special "取得舊化" case', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          targetLabel="嘉拉汀·常風"
        />,
      );
      expect(screen.getByRole('button', { name: /升階段.*嘉拉汀·常風/ })).toBeInTheDocument();
    });

    it('clicking 升階段 button calls onSetCurrent', () => {
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
      fireEvent.click(screen.getByRole('button', { name: /升階段/ }));
      expect(onSetCurrent).toHaveBeenCalledOnce();
    });

    it('does not show prereqRows when currentStage is defined', () => {
      render(
        <PreviewPanel
          currentStage="antiquated"
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          prereqRows={[{ name: '舊化的嘉拉汀', obtainMethod: '完成70級職業任務' }]}
        />,
      );
      expect(screen.queryByText(/舊化的嘉拉汀 × 1/)).toBeNull();
      expect(screen.queryByText(/完成70級職業任務/)).toBeNull();
    });

    it('shows full antiquated → target material cost (currentStage undefined)', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="anemos-base"
          inventory={{ 21801: 50 }}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
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
