import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NmDetailModal from './NmDetailModal';

afterEach(cleanup);

describe('NmDetailModal', () => {
  it('renders nothing when nmId is null', () => {
    render(<NmDetailModal nmId={null} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows NM TC + EN name + level when open', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    expect(screen.getByText('帕祖祖')).toBeInTheDocument();
    expect(screen.getByText('Pazuzu')).toBeInTheDocument();
    // Pazuzu Lv.25; trigger mob Shadow Wraith is also Lv.25, so getAllByText is used.
    expect(screen.getAllByText(/Lv\.25/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows NM 出現條件 and 觸發怪條件 sections', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    // Section labels
    expect(screen.getByText('NM 出現條件')).toBeInTheDocument();
    expect(screen.getByText('觸發怪條件')).toBeInTheDocument();
    // Pazuzu: nm condition = 強風, mob condition = 夜間
    expect(screen.getByText('強風')).toBeInTheDocument();
    expect(screen.getAllByText('夜間').length).toBeGreaterThanOrEqual(1);
  });

  it('shows — for both conditions when NM has no trigger', () => {
    // 'teles' is unconditional (no trigger field)
    render(<NmDetailModal nmId="teles" onClose={() => {}} />);
    expect(screen.queryByText(/常駐.*隨時可刷/)).toBeNull();
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onClose when ESC pressed', () => {
    const handle = vi.fn();
    render(<NmDetailModal nmId="pazuzu" onClose={handle} />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(handle).toHaveBeenCalled();
  });

  it('shows NM coord with short zone name and parens', () => {
    render(<NmDetailModal nmId="pazuzu" onClose={() => {}} />);
    // Pazuzu's NM coord 7.4, 21.6, zone 'Eureka Anemos' → short '常風之地'
    expect(screen.getByText(/常風之地\s*\(7\.4,\s*21\.6\)/)).toBeInTheDocument();
    const nmPin = screen.getAllByText('NM').find(
      (el) => el.getAttribute('data-pin-kind') === 'nm',
    );
    expect(nmPin).toBeDefined();
    expect(nmPin?.className).toMatch(/bg-nm/);
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
    // Note: Fafnir itself is also Lv.22 now, so getAllByText is used.
    expect(screen.getAllByText('Lv.22').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByAltText('火屬性')).toBeTruthy();
    expect(screen.getAllByText('夜間').length).toBeGreaterThanOrEqual(1);
  });

  it('omits timeOfDay chip for trigger mob without time-of-day attribute', () => {
    // sabotender-corrido's trigger mob (Flowering Sabotender) has no timeOfDay.
    render(<NmDetailModal nmId="sabotender-corrido" onClose={() => {}} />);
    const trigList = screen.getByText('觸發方式：在以下地點擊殺').parentElement!;
    expect(trigList.querySelector('[class*="indigo-950"]')).toBeNull();
  });

  it('renders 特殊掉落 section for NM with notable drops', () => {
    render(<NmDetailModal nmId="copycat-cassie" onClose={vi.fn()} />);
    expect(screen.getByText('特殊掉落')).toBeInTheDocument();
    // Drops use EN fallback per CLAUDE.md TC strict rule
    expect(screen.getByText("Cassie's Earring")).toBeInTheDocument();
  });

  it('does not render 特殊掉落 section for NM without notable drops', () => {
    render(<NmDetailModal nmId="sabotender-corrido" onClose={vi.fn()} />);
    expect(screen.queryByText('特殊掉落')).not.toBeInTheDocument();
  });
});
