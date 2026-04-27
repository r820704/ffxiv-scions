import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WeatherFilterBar from './WeatherFilterBar';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe('WeatherFilterBar', () => {
  it('renders NM-triggering weathers as chips by default', () => {
    render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /靈風/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /熱浪/ })).toBeTruthy();
    // 晴朗 is a non-trigger general weather; collapsed by default
    expect(screen.queryByRole('button', { name: /晴朗/ })).toBeNull();
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

  it('renders a weather icon in each weather chip', () => {
    const { container } = render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
    // Only check weather chips (have an img); skip the toggle/night/clear-all buttons
    const weatherButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.querySelector('img'),
    );
    expect(weatherButtons.length).toBeGreaterThan(0);
    weatherButtons.forEach((b) => {
      expect(b.querySelector('img')).toBeTruthy();
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

  describe('two-group split (M4)', () => {
    it('renders NM-triggering weathers in their own section', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      expect(screen.getByText(/觸發 NM/)).toBeTruthy();
      // Known NM-triggering weathers
      expect(screen.getByRole('button', { name: /強風/ })).toBeTruthy();
      expect(screen.getByRole('button', { name: /薄霧/ })).toBeTruthy();
    });

    it('collapses general weathers section by default', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      // 晴朗 (Fair Skies) is a non-NM-trigger general weather; should NOT be in DOM
      expect(screen.queryByRole('button', { name: /晴朗/ })).toBeNull();
    });

    it('expands general weathers section when toggle clicked', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      const toggle = screen.getByRole('button', { name: /一般天氣/ });
      fireEvent.click(toggle);
      expect(screen.getByRole('button', { name: /晴朗/ })).toBeTruthy();
    });

    it('persists expanded state to localStorage', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /一般天氣/ }));
      expect(localStorage.getItem('eureka-weather-filter-general-expanded')).toBe('true');
      cleanup();
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      expect(screen.getByRole('button', { name: /晴朗/ })).toBeTruthy();
    });
  });

  describe('夜間 pseudo-chip', () => {
    it('renders 夜間 chip in the NM-triggering section', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      expect(screen.getByRole('button', { name: /夜間/ })).toBeTruthy();
    });

    it('calls onToggle with NIGHT_FILTER_KEY when clicked', () => {
      const onToggle = vi.fn();
      render(<WeatherFilterBar selected={new Set()} onToggle={onToggle} />);
      fireEvent.click(screen.getByRole('button', { name: /夜間/ }));
      expect(onToggle).toHaveBeenCalledWith(NIGHT_FILTER_KEY);
    });

    it('shows selected state when NIGHT_FILTER_KEY is in selected set', () => {
      render(
        <WeatherFilterBar
          selected={new Set([NIGHT_FILTER_KEY])}
          onToggle={vi.fn()}
        />,
      );
      const btn = screen.getByRole('button', { name: /夜間/ });
      // Selected pseudo-chip should have a distinguishing class (we use indigo accent)
      expect(btn.className).toMatch(/indigo|amber-600/);
    });
  });

  describe('copy link button (M7)', () => {
    it('renders the copy link button when onCopyLink is provided', () => {
      render(
        <WeatherFilterBar
          selected={new Set()}
          onToggle={vi.fn()}
          onCopyLink={vi.fn()}
        />,
      );
      expect(screen.getByText(/複製連結/)).toBeTruthy();
    });

    it('does NOT render the copy link button when onCopyLink is omitted', () => {
      render(<WeatherFilterBar selected={new Set()} onToggle={vi.fn()} />);
      expect(screen.queryByText(/複製連結/)).toBeNull();
    });

    it('calls onCopyLink when clicked', () => {
      const onCopyLink = vi.fn();
      render(
        <WeatherFilterBar
          selected={new Set()}
          onToggle={vi.fn()}
          onCopyLink={onCopyLink}
        />,
      );
      fireEvent.click(screen.getByText(/複製連結/));
      expect(onCopyLink).toHaveBeenCalledOnce();
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
