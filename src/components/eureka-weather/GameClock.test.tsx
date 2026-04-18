import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import GameClock from './GameClock';

afterEach(cleanup);

describe('GameClock', () => {
  it('renders game and client time in HH:MM format', () => {
    render(<GameClock />);
    expect(screen.getAllByText(/^\d{2}:\d{2}$/).length).toBeGreaterThanOrEqual(2);
  });

  it('shows day or night badge', () => {
    render(<GameClock />);
    const text = document.body.textContent ?? '';
    expect(text.includes('白天') || text.includes('夜晚')).toBe(true);
  });

  it('shows countdown to next transition', () => {
    render(<GameClock />);
    const text = document.body.textContent ?? '';
    expect(/距離(白天|夜晚)\s*\d+分\d{2}秒/.test(text)).toBe(true);
  });
});
