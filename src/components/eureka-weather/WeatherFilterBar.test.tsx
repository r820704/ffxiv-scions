import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WeatherFilterBar from './WeatherFilterBar';

afterEach(cleanup);

describe('WeatherFilterBar', () => {
  it('renders all unique Eureka weathers as chips', () => {
    render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /靈風/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /熱浪/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /晴朗/ })).toBeTruthy();
  });

  it('calls onToggle with English key when chip clicked', () => {
    const onToggle = vi.fn();
    render(<WeatherFilterBar selected={new Set()} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /靈風/ }));
    expect(onToggle).toHaveBeenCalledWith('Umbral Wind');
  });

  it('marks selected chips with amber background', () => {
    render(<WeatherFilterBar selected={new Set(['Gales'])} onToggle={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /強風/ });
    expect(btn.className).toContain('bg-amber-600');
  });

  it('renders a weather icon in each chip', () => {
    const { container } = render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((b) => {
      expect(b.querySelector('img, span[aria-hidden="true"]')).toBeTruthy();
    });
  });

  describe('clear-all button (M13)', () => {
    it('does NOT render clear button when no weather is selected', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} onClearAll={vi.fn()} />);
      expect(screen.queryByText(/清除全部/)).toBeNull();
    });

    it('renders clear button with selected count when at least one weather is selected', () => {
      render(
        <WeatherFilterBar
          selected={new Set(['Gales', 'Showers'])}
          onToggle={vi.fn()}
          onClearAll={vi.fn()}
        />,
      );
      expect(screen.getByText(/清除全部 \(2\)/)).toBeTruthy();
    });

    it('calls onClearAll when clear button is clicked', () => {
      const onClearAll = vi.fn();
      render(
        <WeatherFilterBar
          selected={new Set(['Gales'])}
          onToggle={vi.fn()}
          onClearAll={onClearAll}
        />,
      );
      fireEvent.click(screen.getByText(/清除全部/));
      expect(onClearAll).toHaveBeenCalledOnce();
    });

    it('does NOT render clear button when onClearAll prop is omitted', () => {
      render(<WeatherFilterBar selected={new Set(['Gales'])} onToggle={vi.fn()} />);
      expect(screen.queryByText(/清除全部/)).toBeNull();
    });
  });

  describe('jump-to-now button (Q2)', () => {
    it('renders the button when onJumpToNow prop is provided', () => {
      render(
        <WeatherFilterBar
          selected={new Set()}
          onToggle={vi.fn()}
          onJumpToNow={vi.fn()}
        />,
      );
      expect(screen.getByText(/回到現在/)).toBeTruthy();
    });

    it('does NOT render the button when onJumpToNow prop is omitted', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      expect(screen.queryByText(/回到現在/)).toBeNull();
    });

    it('calls onJumpToNow when button is clicked', () => {
      const onJumpToNow = vi.fn();
      render(
        <WeatherFilterBar
          selected={new Set()}
          onToggle={vi.fn()}
          onJumpToNow={onJumpToNow}
        />,
      );
      fireEvent.click(screen.getByText(/回到現在/));
      expect(onJumpToNow).toHaveBeenCalledOnce();
    });
  });
});
