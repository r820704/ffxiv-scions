import { describe, it, expect, afterEach } from 'vitest';
import { act, render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OnboardingBanner, toggleOnboarding } from './OnboardingBanner';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('OnboardingBanner', () => {
  it('renders by default when localStorage is clean', () => {
    render(<OnboardingBanner />);
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
    expect(screen.getByText(/4\.x（紅蓮解放者）的武器與套裝系列/)).toBeInTheDocument();
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

  it('shows all three track descriptions', () => {
    render(<OnboardingBanner />);
    expect(screen.getByText(/依職業，共 16 階段/)).toBeInTheDocument();
    expect(screen.getByText(/外觀專用，不影響角色能力值/)).toBeInTheDocument();
    expect(screen.getByText(/戰鬥用，共 3 階段，依職能共用/)).toBeInTheDocument();
  });

  it('shows 優雷卡元素加持 footnote', () => {
    render(<OnboardingBanner />);
    expect(screen.getByText(/優雷卡元素加持：在優雷卡區域內/)).toBeInTheDocument();
  });

  it('toggleOnboarding() reveals an X-dismissed banner and clears the flag', () => {
    localStorage.setItem('eureka-gear-onboarding-dismissed', '1');
    render(<OnboardingBanner />);
    expect(screen.queryByRole('region', { name: /禁地兵裝說明/ })).not.toBeInTheDocument();
    act(() => toggleOnboarding());
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
    expect(localStorage.getItem('eureka-gear-onboarding-dismissed')).toBeNull();
  });

  it('toggleOnboarding() also hides a currently-visible banner without setting the flag', () => {
    render(<OnboardingBanner />);
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
    act(() => toggleOnboarding());
    expect(screen.queryByRole('region', { name: /禁地兵裝說明/ })).not.toBeInTheDocument();
    expect(localStorage.getItem('eureka-gear-onboarding-dismissed')).toBeNull();
    act(() => toggleOnboarding());
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
  });
});
