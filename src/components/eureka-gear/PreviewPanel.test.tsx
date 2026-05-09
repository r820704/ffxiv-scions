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

  it('calls onSetCurrent when set button clicked (upgrade path)', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /⬆.*設為目前階段/ }));
    expect(onSetCurrent).toHaveBeenCalledOnce();
  });

  it('does not render set-current button when target is undefined', () => {
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
    expect(screen.queryByRole('button', { name: /設為目前階段/ })).toBeNull();
  });

  describe('start panel', () => {
    it('uses 獲得 X 需要 header and renders startHint as a material list item', () => {
      render(
        <PreviewPanel
          currentStage="antiquated"
          targetStage={undefined}
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          showStartPanel
          startHint="前置：需持有 70 級職業套裝"
          onStartChain={() => {}}
        />,
      );
      expect(screen.getByText(/獲得.*70級職業套裝.*需要/)).toBeInTheDocument();
      // startHint is now rendered as a material list item with quantity × 1
      expect(screen.getByText(/前置：需持有 70 級職業套裝.*取得.*× 1/)).toBeInTheDocument();
    });

    it('shows materials list for elemental armor first stage (湧火水晶 × 40)', () => {
      render(
        <PreviewPanel
          currentStage="elemental"
          targetStage={undefined}
          inventory={{ 24124: 10 }}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          stages={ELEMENTAL_ARMOR_STAGES}
          costs={ELEMENTAL_ARMOR_COSTS}
          slot="head"
          currentLabel="禁地兵裝·元素"
          showStartPanel
          startHint="前置：持有 70 級職業套裝"
          onStartChain={() => {}}
        />,
      );
      expect(screen.getByText(/獲得 禁地兵裝·元素 需要/)).toBeInTheDocument();
      expect(screen.getByText(/湧火水晶 × 40/)).toBeInTheDocument();
      expect(screen.getByText(/有 10/)).toBeInTheDocument();
      expect(screen.getByText(/缺 30/)).toBeInTheDocument();
    });

    it('shows ✓ when inventory satisfies elemental start cost', () => {
      render(
        <PreviewPanel
          currentStage="elemental"
          targetStage={undefined}
          inventory={{ 24124: 50 }}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          stages={ELEMENTAL_ARMOR_STAGES}
          costs={ELEMENTAL_ARMOR_COSTS}
          slot="body"
          currentLabel="禁地兵裝·元素"
          showStartPanel
          onStartChain={() => {}}
        />,
      );
      expect(screen.getByText(/有 50 ✓/)).toBeInTheDocument();
    });

    it('calls onStartChain when start button clicked', () => {
      const onStartChain = vi.fn();
      render(
        <PreviewPanel
          currentStage="elemental"
          targetStage={undefined}
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          stages={ELEMENTAL_ARMOR_STAGES}
          costs={ELEMENTAL_ARMOR_COSTS}
          slot="head"
          currentLabel="禁地兵裝·元素"
          showStartPanel
          onStartChain={onStartChain}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /設為目前階段/ }));
      expect(onStartChain).toHaveBeenCalledOnce();
    });

    it('shows full antiquated → pendingStartTargetStage path when target is preset', () => {
      render(
        <PreviewPanel
          currentStage="antiquated"
          targetStage={undefined}
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          showStartPanel
          startHint="前置：完成 70 級職業任務"
          onStartChain={() => {}}
          pendingStartTargetStage="anemos"
          pendingStartTargetLabel="嘉拉汀·常風"
        />,
      );
      // Heading switches from "獲得 X 需要" to "從 X → Y 需要" when target preset.
      expect(screen.getByText(/從.*→.*嘉拉汀·常風.*需要/)).toBeInTheDocument();
      // Confirm button label mentions both start AND target.
      expect(screen.getByRole('button', { name: /設目標.*嘉拉汀·常風/ })).toBeInTheDocument();
    });
  });
});
