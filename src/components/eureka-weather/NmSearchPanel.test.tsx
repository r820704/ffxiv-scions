import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NmSearchPanel from './NmSearchPanel';

afterEach(cleanup);

const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

describe('NmSearchPanel', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <NmSearchPanel
        isOpen={false}
        onClose={vi.fn()}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders search input + placeholder hint when open and query is empty', () => {
    render(
      <NmSearchPanel
        isOpen
        onClose={vi.fn()}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText(/搜尋 NM/)).toBeTruthy();
    expect(screen.getByText(/輸入關鍵字搜尋 NM/)).toBeTruthy();
  });

  it('shows results matching the query', () => {
    render(
      <NmSearchPanel
        isOpen
        onClose={vi.fn()}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/搜尋 NM/), { target: { value: '帕祖祖' } });
    expect(screen.getByText('帕祖祖')).toBeTruthy();
  });

  it('shows no-result message when no NM matches', () => {
    render(
      <NmSearchPanel
        isOpen
        onClose={vi.fn()}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/搜尋 NM/), { target: { value: 'zzzqqqxxx' } });
    expect(screen.getByText(/找不到符合/)).toBeTruthy();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <NmSearchPanel
        isOpen
        onClose={onClose}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    fireEvent.click(container.querySelector('[data-search-backdrop]') as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button (✕) is clicked', () => {
    const onClose = vi.fn();
    render(
      <NmSearchPanel
        isOpen
        onClose={onClose}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('關閉搜尋'));
    expect(onClose).toHaveBeenCalled();
  });
});
