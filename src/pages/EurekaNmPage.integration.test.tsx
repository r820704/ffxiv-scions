import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EurekaNmPage from './EurekaNmPage';

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('EurekaNmPage — 自定義 tab integration', () => {
  it('shows empty NM table when 自定義 tab is opened with no pins', () => {
    render(<MemoryRouter><EurekaNmPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('tab', { name: /自定義/ }));

    // No NM rows in tbody (only the thead row exists)
    const allRows = screen.getAllByRole('row');
    // header row only — no NM rows
    expect(allRows.length).toBe(1);
  });

  it('shows pinned NMs across zones with zone chips in 自定義 tab', () => {
    render(<MemoryRouter><EurekaNmPage /></MemoryRouter>);

    // On Anemos tab (default), pin Pazuzu (Lv 20, last in zone)
    const pinPazuzu = screen.getByLabelText(/Pin 帕祖祖/);
    fireEvent.click(pinPazuzu);

    // Switch to 恆冰 tab + pin Cassie (id: copycat-cassie, Lv 36)
    fireEvent.click(screen.getByRole('tab', { name: /恆冰/ }));
    fireEvent.click(screen.getByLabelText(/Pin 複製魔花凱西/));

    // Switch to 自定義
    fireEvent.click(screen.getByRole('tab', { name: /自定義/ }));

    // Both NMs should be visible
    expect(screen.getByText('帕祖祖')).toBeInTheDocument();
    expect(screen.getByText('複製魔花凱西')).toBeInTheDocument();

    // Zone chips show TC zone short names (常風之地 / 恆冰之地 etc.)
    const table = screen.getByRole('table');
    expect(within(table).getAllByText('常風之地').length).toBeGreaterThanOrEqual(1);
    expect(within(table).getAllByText('恆冰之地').length).toBeGreaterThanOrEqual(1);
  });

  it('unpinning from 自定義 tab removes the NM and updates original zone tab', () => {
    render(<MemoryRouter><EurekaNmPage /></MemoryRouter>);

    // Pin Pazuzu
    fireEvent.click(screen.getByLabelText(/Pin 帕祖祖/));

    // Go to 自定義 tab
    fireEvent.click(screen.getByRole('tab', { name: /自定義/ }));
    expect(screen.getByText('帕祖祖')).toBeInTheDocument();

    // Unpin from 自定義 tab
    fireEvent.click(screen.getByLabelText(/Unpin 帕祖祖/));

    // Should disappear from 自定義 tab
    expect(screen.queryByText('帕祖祖')).not.toBeInTheDocument();

    // Going back to 常風 shows it (unpinned, ☆ empty)
    fireEvent.click(screen.getByRole('tab', { name: /常風/ }));
    expect(screen.getByText('帕祖祖')).toBeInTheDocument();
    expect(screen.getByLabelText(/Pin 帕祖祖/)).toBeInTheDocument();  // ☆ empty again
  });
});
