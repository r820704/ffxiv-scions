import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TriggerMobChips from './TriggerMobChips';

afterEach(cleanup);

describe('TriggerMobChips', () => {
  it('renders only level chip when no element/timeOfDay', () => {
    render(<TriggerMobChips attrs={{ level: 5 }} />);
    expect(screen.getByText('Lv.5')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByText('夜間')).toBeNull();
    expect(screen.queryByText('白天')).toBeNull();
  });

  it('renders element icon with proper alt text when element provided', () => {
    render(<TriggerMobChips attrs={{ level: 22, element: 'Fire' }} />);
    const img = screen.getByAltText('火屬性');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toMatch(/Fire\.png$/);
  });

  it('renders timeOfDay chip for night', () => {
    render(<TriggerMobChips attrs={{ level: 22, timeOfDay: 'night' }} />);
    expect(screen.getByText('夜間')).toBeTruthy();
  });

  it('renders timeOfDay chip for day', () => {
    render(<TriggerMobChips attrs={{ level: 5, timeOfDay: 'day' }} />);
    expect(screen.getByText('白天')).toBeTruthy();
  });

  it('renders all three chips together', () => {
    render(<TriggerMobChips attrs={{ level: 22, element: 'Ice', timeOfDay: 'night' }} />);
    expect(screen.getByText('Lv.22')).toBeTruthy();
    expect(screen.getByAltText('冰屬性')).toBeTruthy();
    expect(screen.getByText('夜間')).toBeTruthy();
  });
});
