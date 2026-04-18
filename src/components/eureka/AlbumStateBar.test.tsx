import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AlbumStateBar from './AlbumStateBar';

afterEach(cleanup);

const baseProps = {
  learnedCount: 5,
  total: 56,
  disabled: false,
  onLearnAll: vi.fn(),
  onReset: vi.fn(),
};

describe('AlbumStateBar', () => {
  it('should render progress text and both buttons', () => {
    render(<AlbumStateBar {...baseProps} />);
    expect(screen.getByText('5 / 56')).toBeTruthy();
    expect(screen.getByRole('button', { name: '全開' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '重置' })).toBeTruthy();
  });

  it('should invoke handlers on click', () => {
    const onLearnAll = vi.fn();
    const onReset = vi.fn();
    render(<AlbumStateBar {...baseProps} onLearnAll={onLearnAll} onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: '全開' }));
    fireEvent.click(screen.getByRole('button', { name: '重置' }));
    expect(onLearnAll).toHaveBeenCalled();
    expect(onReset).toHaveBeenCalled();
  });

  it('should disable buttons when disabled prop is true', () => {
    render(<AlbumStateBar {...baseProps} disabled />);
    expect(screen.getByRole('button', { name: '全開' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '重置' }).hasAttribute('disabled')).toBe(true);
  });
});
