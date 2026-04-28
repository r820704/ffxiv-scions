import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NmDetailModal from './NmDetailModal';

afterEach(cleanup);

describe('NmDetailModal', () => {
  it('renders nothing when nmId is null', () => {
    const { container } = render(<NmDetailModal nmId={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows NM TC + EN name + level when open', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    expect(screen.getByText('帕祖祖')).toBeInTheDocument();
    expect(screen.getByText('Pazuzu')).toBeInTheDocument();
    expect(screen.getByText(/Lv\.20/)).toBeInTheDocument();
  });

  it('shows trigger condition (formatNmTrigger output)', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    // Pazuzu trigger is Gales + night → formatNmTrigger returns 強風+夜間
    expect(screen.getByText(/強風/)).toBeInTheDocument();
    expect(screen.getByText(/夜間/)).toBeInTheDocument();
  });

  it('shows 常駐 text when NM has no trigger', () => {
    // Pick an NM from eurekaNms with no trigger (常駐)
    // 'teles' is unconditional in eureka-nm-data.ts (no trigger field)
    render(<NmDetailModal nmId="teles" onClose={() => {}} />);
    expect(screen.getByText(/常駐.*隨時可刷|隨時可刷/)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handle = vi.fn();
    render(<NmDetailModal nmId="pazuzu" onClose={handle} />);
    fireEvent.click(screen.getByLabelText('關閉'));
    expect(handle).toHaveBeenCalledOnce();
  });

  it('calls onClose when ESC pressed', () => {
    const handle = vi.fn();
    render(<NmDetailModal nmId="pazuzu" onClose={handle} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handle).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop clicked', () => {
    const handle = vi.fn();
    render(<NmDetailModal nmId="pazuzu" onClose={handle} />);
    fireEvent.click(screen.getByTestId('detail-backdrop'));
    expect(handle).toHaveBeenCalledOnce();
  });

  it('does NOT call onClose when modal content clicked', () => {
    const handle = vi.fn();
    render(<NmDetailModal nmId="pazuzu" onClose={handle} />);
    // Click on the modal title (inside the content, not on backdrop)
    fireEvent.click(screen.getByText('帕祖祖'));
    expect(handle).not.toHaveBeenCalled();
  });

  it('shows NM coord in info section and renders an NM pin on the map', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    // Pazuzu's NM coord from EurekaHelper is 7.4, 21.6
    expect(screen.getByText(/7\.4,\s*21\.6/)).toBeInTheDocument();
    // The map renders an "NM" pin (rose-colored, kind=nm)
    const nmPin = screen.getAllByText('NM').find(
      (el) => el.getAttribute('data-pin-kind') === 'nm',
    );
    expect(nmPin).toBeDefined();
    expect(nmPin?.className).toMatch(/bg-rose-/);
  });
});
