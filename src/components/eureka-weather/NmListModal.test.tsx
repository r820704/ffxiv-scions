import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NmListModal from './NmListModal';

afterEach(cleanup);

describe('NmListModal', () => {
  it('renders nothing when zone is null', () => {
    const { container } = render(
      <NmListModal zone={null} onClose={() => {}} onOpenDetail={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('lists all NMs of the zone, sorted by level', () => {
    render(
      <NmListModal zone="Eureka Anemos" onClose={() => {}} onOpenDetail={() => {}} />,
    );
    // Anemos has Lv.1-20, 20 NMs total
    expect(screen.getByText(/全部 NM/)).toBeTruthy();
    expect(screen.getByText('寇里多仙人掌怪')).toBeTruthy(); // Lv.1
    expect(screen.getByText('帕祖祖')).toBeTruthy(); // Lv.20
    // Verify sorted by level: first Lv chip is 1, last is 20
    const lvLabels = screen.getAllByText(/^\d+$/);
    expect(lvLabels[0]!.textContent).toBe('1');
    expect(lvLabels[lvLabels.length - 1]!.textContent).toBe('20');
  });

  it('shows trigger condition for each NM', () => {
    render(
      <NmListModal zone="Eureka Anemos" onClose={() => {}} onOpenDetail={() => {}} />,
    );
    // 龐巴德 (Lv.10) — night-only
    expect(screen.getAllByText('夜間').length).toBeGreaterThanOrEqual(1);
    // 帕祖祖 — Gales+night
    expect(screen.getByText('強風+夜間')).toBeTruthy();
    // Sabotender Corrido — unconditional
    expect(screen.getAllByText('常駐').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking a row calls onOpenDetail with NM id and onClose', () => {
    const onOpenDetail = vi.fn();
    const onClose = vi.fn();
    render(
      <NmListModal zone="Eureka Anemos" onClose={onClose} onOpenDetail={onOpenDetail} />,
    );
    fireEvent.click(screen.getByText('帕祖祖'));
    expect(onOpenDetail).toHaveBeenCalledWith('pazuzu');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <NmListModal zone="Eureka Anemos" onClose={onClose} onOpenDetail={() => {}} />,
    );
    fireEvent.click(screen.getByTestId('list-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on ✕ button click', () => {
    const onClose = vi.fn();
    render(
      <NmListModal zone="Eureka Anemos" onClose={onClose} onOpenDetail={() => {}} />,
    );
    fireEvent.click(screen.getByLabelText('關閉'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <NmListModal zone="Eureka Anemos" onClose={onClose} onOpenDetail={() => {}} />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when modal content clicked', () => {
    const onClose = vi.fn();
    render(
      <NmListModal zone="Eureka Anemos" onClose={onClose} onOpenDetail={() => {}} />,
    );
    fireEvent.click(screen.getByText(/全部 NM/));
    expect(onClose).not.toHaveBeenCalled();
  });
});
