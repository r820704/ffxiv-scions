import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WeatherFilterBar from './WeatherFilterBar';

afterEach(cleanup);

describe('WeatherFilterBar', () => {
  it('renders all unique Eureka weathers as chips', () => {
    render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: '靈風' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '熱浪' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '晴朗' })).toBeTruthy();
  });

  it('calls onToggle with English key when chip clicked', () => {
    const onToggle = vi.fn();
    render(<WeatherFilterBar selected={new Set()} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: '靈風' }));
    expect(onToggle).toHaveBeenCalledWith('Umbral Wind');
  });

  it('marks selected chips with amber background', () => {
    render(<WeatherFilterBar selected={new Set(['Gales'])} onToggle={vi.fn()} />);
    const btn = screen.getByRole('button', { name: '強風' });
    expect(btn.className).toContain('bg-amber-600');
  });
});
