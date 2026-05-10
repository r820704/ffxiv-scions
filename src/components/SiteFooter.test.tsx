import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import SiteFooter from './SiteFooter';

afterEach(() => cleanup());

describe('SiteFooter', () => {
  it('renders SQUARE ENIX copyright', () => {
    render(<SiteFooter />);
    expect(screen.getByText(/SQUARE ENIX/)).toBeInTheDocument();
  });

  it('renders friendly greeting line', () => {
    render(<SiteFooter />);
    expect(screen.getByText(/路過打聲招呼/)).toBeInTheDocument();
  });

  it('renders third-party notices link', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', { name: /第三方資料致謝/ });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toMatch(/THIRD-PARTY-NOTICES\.md$/);
  });
});
