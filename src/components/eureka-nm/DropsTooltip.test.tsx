import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DropsTooltip } from './DropsTooltip';

afterEach(() => cleanup());

describe('DropsTooltip', () => {
  it('renders 📦 button for NM with notable drops', () => {
    render(<DropsTooltip nmId="copycat-cassie" />);
    expect(screen.getByRole('button', { name: /copycat-cassie drops/i })).toBeInTheDocument();
  });

  it('renders null for NM without notable drops', () => {
    const { container } = render(<DropsTooltip nmId="sabotender-corrido" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null for unknown NM id', () => {
    const { container } = render(<DropsTooltip nmId="does-not-exist" />);
    expect(container.firstChild).toBeNull();
  });
});
