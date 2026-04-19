import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import MaterialTile from './MaterialTile';

const material = { id: 1, name: '常風水晶', iconId: 0, category: 'crystal' as const };

describe('MaterialTile', () => {
  it('renders name and count', () => {
    const { container } = render(<MaterialTile material={material} count={5} onChange={() => {}} />);
    expect(screen.getByText('常風水晶')).toBeInTheDocument();
    const input = container.querySelector('input[type="number"]');
    expect(input).toHaveValue(5);
  });

  it('calls onChange(+1) when + is clicked', () => {
    const fn = vi.fn();
    const { container } = render(<MaterialTile material={material} count={5} onChange={fn} />);
    const plusButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.getAttribute('aria-label') === '+1'
    );
    fireEvent.click(plusButton!);
    expect(fn).toHaveBeenCalledWith(6);
  });

  it('calls onChange(-1) when - is clicked; clamps at zero', () => {
    const fn = vi.fn();
    const { container } = render(<MaterialTile material={material} count={0} onChange={fn} />);
    const minusButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.getAttribute('aria-label') === '-1'
    );
    fireEvent.click(minusButton!);
    expect(fn).toHaveBeenCalledWith(0);
  });

  it('accepts typed number via input', () => {
    const fn = vi.fn();
    const { container } = render(<MaterialTile material={material} count={5} onChange={fn} />);
    const input = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });
    expect(fn).toHaveBeenCalledWith(42);
  });
});
