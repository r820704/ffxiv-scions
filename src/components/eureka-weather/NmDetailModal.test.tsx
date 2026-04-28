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
    // Shadow Wraith (trigger mob) also has night, so multiple 夜間 elements exist.
    expect(screen.getByText(/強風/)).toBeInTheDocument();
    expect(screen.getAllByText(/夜間/).length).toBeGreaterThanOrEqual(1);
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

  it('shows NM coord with short zone name and parens', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    // Pazuzu's NM coord 7.4, 21.6, zone 'Eureka Anemos' → short '常風之地'
    expect(screen.getByText(/常風之地\s*\(7\.4,\s*21\.6\)/)).toBeInTheDocument();
    const nmPin = screen.getAllByText('NM').find(
      (el) => el.getAttribute('data-pin-kind') === 'nm',
    );
    expect(nmPin).toBeDefined();
    expect(nmPin?.className).toMatch(/bg-rose-/);
  });

  it('does not render the deprecated zone+aliases header row', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    expect(screen.queryByText(/優雷卡常風之地/)).toBeNull();
    expect(screen.queryByText(/別名：/)).toBeNull();
  });

  it('renders trigger mob coord with short zone name and parens', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    // Every coord (NM + each trigger mob) should now match the new format.
    const matches = screen.getAllByText(/常風之地\s*\(\d+\.\d,\s*\d+\.\d\)/);
    // At least 1 NM coord + 1 trigger mob coord
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('shows trigger mob attrs (Lv / element / timeOfDay) for Fafnir → 龍化石', () => {
    render(<NmDetailModal nmId="fafnir" onClose={() => {}} />);
    // 龍化石: Lv.22, Fire, night per eureka-trigger-mob-data.ts
    // Note: Fafnir's own trigger condition also contains 夜間, so getAllByText is used.
    expect(screen.getByText('Lv.22')).toBeTruthy();
    expect(screen.getByAltText('火屬性')).toBeTruthy();
    expect(screen.getAllByText('夜間').length).toBeGreaterThanOrEqual(1);
  });

  it('omits timeOfDay chip for trigger mob without time-of-day attribute', () => {
    // sabotender-corrido's trigger mob (Flowering Sabotender) has no timeOfDay.
    render(<NmDetailModal nmId="sabotender-corrido" onClose={() => {}} />);
    const trigList = screen.getByText('在以下地點擊殺：').parentElement!;
    expect(trigList.querySelector('[class*="indigo-950"]')).toBeNull();
  });
});
