import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PinStar } from './PinStar';

afterEach(() => cleanup());

describe('PinStar', () => {
  it('renders unpressed when not pinned', () => {
    render(<PinStar isPinned={false} onToggle={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Pin Pazuzu'));
  });

  it('renders pressed when pinned', () => {
    render(<PinStar isPinned={true} onToggle={vi.fn()} nmName="Pazuzu" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Unpin Pazuzu'));
  });

  it('clicking calls onToggle', () => {
    const onToggle = vi.fn();
    render(<PinStar isPinned={false} onToggle={onToggle} nmName="Pazuzu" />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('click does not bubble (stopPropagation)', () => {
    const onToggle = vi.fn();
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <PinStar isPinned={false} onToggle={onToggle} nmName="Pazuzu" />
      </div>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
