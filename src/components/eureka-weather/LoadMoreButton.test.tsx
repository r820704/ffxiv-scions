import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LoadMoreButton from './LoadMoreButton';

afterEach(cleanup);

describe('LoadMoreButton', () => {
  it('renders text with the increment amount', () => {
    render(<LoadMoreButton count={48} step={24} max={96} onLoadMore={vi.fn()} />);
    expect(screen.getByText(/載入更多 \+24/)).toBeTruthy();
  });

  it('calls onLoadMore with new count when clicked', () => {
    const onLoadMore = vi.fn();
    render(<LoadMoreButton count={48} step={24} max={96} onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByText(/載入更多/));
    expect(onLoadMore).toHaveBeenCalledWith(72);
  });

  it('caps the new count at max', () => {
    const onLoadMore = vi.fn();
    render(<LoadMoreButton count={80} step={24} max={96} onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByText(/載入更多/));
    expect(onLoadMore).toHaveBeenCalledWith(96);
  });

  it('renders nothing when at max', () => {
    const { container } = render(
      <LoadMoreButton count={96} step={24} max={96} onLoadMore={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
