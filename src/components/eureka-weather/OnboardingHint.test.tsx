import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import OnboardingHint from './OnboardingHint';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe('OnboardingHint', () => {
  it('renders by default on first visit', () => {
    render(<OnboardingHint />);
    expect(screen.getByText(/點任一格子/)).toBeTruthy();
  });

  it('hides after dismiss button is clicked + persists to localStorage', () => {
    render(<OnboardingHint />);
    fireEvent.click(screen.getByLabelText('關閉提示'));
    expect(screen.queryByText(/點任一格子/)).toBeNull();
    expect(localStorage.getItem('eureka-weather-onboarding-dismissed')).toBe('true');
  });

  it('does not render when localStorage flag is set', () => {
    localStorage.setItem('eureka-weather-onboarding-dismissed', 'true');
    render(<OnboardingHint />);
    expect(screen.queryByText(/點任一格子/)).toBeNull();
  });
});
