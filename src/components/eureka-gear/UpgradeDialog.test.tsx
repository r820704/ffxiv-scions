import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UpgradeDialog } from './UpgradeDialog';

describe('UpgradeDialog', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders title with target stage', () => {
    render(
      <UpgradeDialog isOpen direction="up" targetStage="pyros" sharedJobs={[]} onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByRole('heading', { name: /pyros/ })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <UpgradeDialog isOpen direction="up" targetStage="pyros" sharedJobs={[]} onConfirm={onConfirm} onCancel={() => {}} />,
    );
    const buttons = screen.getAllByRole('button', { name: /確定/ });
    fireEvent.click(buttons[0]!);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('shows shared jobs list when sharedJobs length > 1', () => {
    render(
      <UpgradeDialog isOpen direction="up" targetStage="pyros" sharedJobs={['PLD', 'WAR']} onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText(/PLD/)).toBeInTheDocument();
    expect(screen.getByText(/WAR/)).toBeInTheDocument();
  });

  it('does not show shared jobs section when sharedJobs length <= 1', () => {
    render(
      <UpgradeDialog isOpen direction="up" targetStage="pyros" sharedJobs={['DRG']} onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.queryByText(/此更動會同步反映到/)).toBeNull();
  });

  it('does not render dialog when isOpen is false', () => {
    render(
      <UpgradeDialog isOpen={false} direction="up" targetStage="pyros" sharedJobs={[]} onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = vi.fn();
    render(
      <UpgradeDialog isOpen direction="up" targetStage="pyros" sharedJobs={[]} onConfirm={() => {}} onCancel={onCancel} />,
    );
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});
