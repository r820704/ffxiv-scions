import { describe, it, expect, afterEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OnboardingBanner, reopenOnboarding } from './OnboardingBanner';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('OnboardingBanner', () => {
  it('renders by default when localStorage is clean', () => {
    render(<OnboardingBanner />);
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
    // Lead sentence stays visible regardless of expand/collapse
    expect(screen.getByText(/4\.x（紅蓮之狂潮）的傳說武器/)).toBeInTheDocument();
  });

  it('does NOT render when localStorage has dismissed flag', () => {
    localStorage.setItem('eureka-gear-onboarding-dismissed', '1');
    render(<OnboardingBanner />);
    expect(screen.queryByRole('region', { name: /禁地兵裝說明/ })).not.toBeInTheDocument();
  });

  it('clicking close button hides banner and sets localStorage', () => {
    render(<OnboardingBanner />);
    const closeBtn = screen.getByRole('button', { name: /關閉說明/ });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('region', { name: /禁地兵裝說明/ })).not.toBeInTheDocument();
    expect(localStorage.getItem('eureka-gear-onboarding-dismissed')).toBe('1');
  });

  it('has correct aria-label on close button', () => {
    render(<OnboardingBanner />);
    const closeBtn = screen.getByRole('button', { name: /關閉說明/ });
    expect(closeBtn).toHaveAttribute('aria-label', '關閉說明');
  });

  it('shows all three track descriptions when expanded by default', () => {
    render(<OnboardingBanner />);
    expect(screen.getByText(/依職業，16 階段/)).toBeInTheDocument();
    expect(screen.getByText(/外觀專用、不影響戰力/)).toBeInTheDocument();
    expect(screen.getByText(/戰鬥用，4 階段，依職能共用/)).toBeInTheDocument();
  });

  it('toggle button collapses and expands the three-track detail list', () => {
    render(<OnboardingBanner />);
    const toggle = screen.getByRole('button', { name: /收合三軌說明/ });
    fireEvent.click(toggle);
    expect(screen.queryByText(/依職業，16 階段/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /展開三軌說明/ }));
    expect(screen.getByText(/依職業，16 階段/)).toBeInTheDocument();
  });

  it('persists collapse state to localStorage', () => {
    render(<OnboardingBanner />);
    fireEvent.click(screen.getByRole('button', { name: /收合三軌說明/ }));
    expect(localStorage.getItem('eureka-gear-onboarding-expanded')).toBe('0');
  });

  it('respects persisted collapsed state on next mount', () => {
    localStorage.setItem('eureka-gear-onboarding-expanded', '0');
    render(<OnboardingBanner />);
    expect(screen.queryByText(/依職業，16 階段/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /展開三軌說明/ })).toBeInTheDocument();
  });

  it('reopenOnboarding() makes a dismissed banner reappear without remount', () => {
    localStorage.setItem('eureka-gear-onboarding-dismissed', '1');
    render(<OnboardingBanner />);
    // Pre-condition: banner hidden because of dismissed flag.
    expect(screen.queryByRole('region', { name: /禁地兵裝說明/ })).not.toBeInTheDocument();
    // Trigger the page-header `?` button equivalent.
    act(() => reopenOnboarding());
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
    // localStorage flag should also have been cleared so a hard reload doesn't re-hide it.
    expect(localStorage.getItem('eureka-gear-onboarding-dismissed')).toBeNull();
  });
});
