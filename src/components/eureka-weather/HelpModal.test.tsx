import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import HelpModal from './HelpModal';

afterEach(cleanup);

describe('HelpModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<HelpModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders both sections when isOpen', () => {
    render(<HelpModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText(/怎麼讀格子/)).toBeTruthy();
    expect(screen.getByText(/怎麼用篩選/)).toBeTruthy();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<HelpModal isOpen onClose={onClose} />);
    const backdrop = container.querySelector('[data-modal-backdrop]') as HTMLElement;
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText(/我知道了/));
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT close when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText(/怎麼讀格子/));
    expect(onClose).not.toHaveBeenCalled();
  });
});
