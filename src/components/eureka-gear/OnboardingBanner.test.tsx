import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { OnboardingBanner } from './OnboardingBanner';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('OnboardingBanner', () => {
  it('renders by default when localStorage is clean', () => {
    render(<OnboardingBanner />);
    expect(screen.getByRole('region', { name: /禁地兵裝說明/ })).toBeInTheDocument();
    expect(screen.getByText(/禁地兵裝有 3 個進度軸/)).toBeInTheDocument();
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

  it('displays all three progress track descriptions', () => {
    render(<OnboardingBanner />);
    expect(screen.getByText(/武器/)).toBeInTheDocument();
    expect(screen.getByText(/常風防具/)).toBeInTheDocument();
    expect(screen.getByText(/元素防具/)).toBeInTheDocument();
    expect(screen.getByText(/依職業，16 階段/)).toBeInTheDocument();
    expect(screen.getByText(/外觀專用，5 階段，依職業/)).toBeInTheDocument();
    expect(screen.getByText(/戰鬥用，4 階段，依職能共用/)).toBeInTheDocument();
  });
});
