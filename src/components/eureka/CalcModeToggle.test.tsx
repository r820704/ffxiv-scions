import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CalcModeToggle from './CalcModeToggle';

afterEach(cleanup);

describe('CalcModeToggle', () => {
  it('should render two buttons with labels', () => {
    render(<CalcModeToggle calcMode="album" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /圖鑑全開計算/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /技能格計算/ })).toBeTruthy();
  });

  it('should mark album as selected when calcMode is album', () => {
    render(<CalcModeToggle calcMode="album" onChange={() => {}} />);
    const albumBtn = screen.getByRole('button', { name: /圖鑑全開計算/ });
    expect(albumBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('should call onChange with slots when slots button is clicked', () => {
    const onChange = vi.fn();
    render(<CalcModeToggle calcMode="album" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /技能格計算/ }));
    expect(onChange).toHaveBeenCalledWith('slots');
  });
});
