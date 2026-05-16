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

    it('renders prereqRows with × 1 inline and obtainMethod via ⓘ tooltip button', () => {
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
      // Item name + × 1 still rendered inline (no longer truncated)
      expect(screen.getByText(/舊化的嘉拉汀 × 1/)).toBeInTheDocument();
      expect(screen.getByText(/舊化的艾瓦拉克血十字盾 × 1/)).toBeInTheDocument();
      // obtainMethod moved off-screen into Radix Tooltip; verify ⓘ button exists per row
      expect(screen.getByRole('button', { name: /舊化的嘉拉汀 取得方式/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /舊化的艾瓦拉克血十字盾 取得方式/ })).toBeInTheDocument();
      // The raw obtainMethod text should NOT be inline anymore (avoids truncation)
      expect(screen.queryByText(/完成70級職業任務或從失物管理人兌換取得/)).toBeNull();
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

  describe('cost edge notes', () => {
    it('renders condition notes inline (no 70 級 / 元素武器 wording, no redundant slot prefix)', () => {
      render(
        <PreviewPanel
          currentStage={undefined}
          targetStage="elemental+2"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
          stages={ELEMENTAL_ARMOR_STAGES}
          costs={ELEMENTAL_ARMOR_COSTS}
          slot="head"
        />,
      );
      // antiquated → elemental: corrected text
      expect(screen.getByText(/需收集 50 個文理技能圖鑑.*至少完成一件任意職業的恆冰武器/)).toBeInTheDocument();
      // Old wrong wording is gone
      expect(screen.queryByText(/70 級職業套裝/)).toBeNull();
      expect(screen.queryByText(/至少擁有一件元素武器/)).toBeNull();
      // elemental → +1: clean text without "頭/手/腳：" prefix (system filters by slot)
      expect(screen.getByText(/需解鎖 56 個文理技能圖鑑/)).toBeInTheDocument();
      expect(screen.queryByText(/頭\/手\/腳：/)).toBeNull();
      expect(screen.queryByText(/身\/腿：/)).toBeNull();
      // 優雷卡的斷片 acquisition moved into material tooltip, no longer inline note
      expect(screen.queryByText(/優雷卡的斷片於.*獲取/)).toBeNull();
      // Wrong location "禁地王都" must NOT appear anywhere
      expect(screen.queryByText(/禁地王都/)).toBeNull();
    });

    it('does not render notes section when no edges have notes', () => {
      const { container } = render(
        <PreviewPanel
          currentStage="anemos-base"
          targetStage="anemos+1"
          inventory={{ 21801: 400 }}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
        />,
      );
      // anemos-base → anemos+1 has no notes
      expect(container.querySelector('ul.italic')).toBeNull();
    });
  });

  describe('material acquisition tooltip', () => {
    const fullMaterials = {
      ...materials,
      24808: { nameTC: '優雷卡的斷片', icon: 0 },
    };

    it('renders ⓘ tooltip button next to 優雷卡的斷片 row with corrected location text', () => {
      render(
        <PreviewPanel
          currentStage="elemental+1"
          targetStage="elemental+2"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={fullMaterials}
          stages={ELEMENTAL_ARMOR_STAGES}
          costs={ELEMENTAL_ARMOR_COSTS}
          slot="head"
        />,
      );
      // Material row shows as usual
      expect(screen.getByText(/優雷卡的斷片 × 21/)).toBeInTheDocument();
      // Acquisition tooltip button exists with aria-label scoped to this material
      const tipBtn = screen.getByRole('button', { name: /優雷卡的斷片 取得方式/ });
      expect(tipBtn).toBeInTheDocument();
    });

    it('does NOT render ⓘ tooltip for generic zone-mob materials (Protean / Pyros crystal)', () => {
      render(
        <PreviewPanel
          currentStage="antiquated"
          targetStage="anemos-base"
          inventory={{}}
          onSetCurrent={() => {}}
          onClearTarget={() => {}}
          materialsMap={materials}
        />,
      );
      // 亂屬性水晶 (Protean) is general drop — no tooltip
      expect(screen.queryByRole('button', { name: /禁地水晶 取得方式/ })).toBeNull();
    });
  });
});
