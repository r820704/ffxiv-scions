import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import HelpModal from './HelpModal';

afterEach(cleanup);

describe('HelpModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<HelpModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders sections when isOpen', () => {
    render(<HelpModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText(/怎麼讀格子/)).toBeInTheDocument();
    expect(screen.getByText(/怎麼用篩選/)).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT call onClose when isOpen is false (Escape is no-op)', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen={false} onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
