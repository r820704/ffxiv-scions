import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewPanel } from './PreviewPanel';

const materials = { 21801: { nameTC: '禁地水晶', icon: 60000 } };

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
});
