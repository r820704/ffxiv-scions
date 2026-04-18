import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import GameClock from './GameClock';

afterEach(cleanup);

describe('GameClock', () => {
  it('renders a game time in HH:MM format', () => {
    render(<GameClock />);
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeTruthy();
  });

  it('shows day or night badge', () => {
    render(<GameClock />);
    const text = document.body.textContent ?? '';
    expect(text.includes('白天') || text.includes('夜晚')).toBe(true);
  });

  it('shows countdown to next transition', () => {
    render(<GameClock />);
    const text = document.body.textContent ?? '';
    expect(/距離(白天|夜晚)\s*\d+m\s*\d{2}s/.test(text)).toBe(true);
  });
});
