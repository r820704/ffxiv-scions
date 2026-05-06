import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import SiteFooter from './SiteFooter';

afterEach(() => cleanup());

describe('SiteFooter', () => {
  it('renders SQUARE ENIX copyright', () => {
    render(<SiteFooter />);
    expect(screen.getByText(/SQUARE ENIX/)).toBeInTheDocument();
  });

  it('renders author info with TC and CN servers', () => {
    render(<SiteFooter />);
    expect(screen.getByText(/找我玩/)).toBeInTheDocument();
    expect(screen.getByText(/TC 迦樓羅 Skuld/)).toBeInTheDocument();
    expect(screen.getByText(/CN 柔风海湾 Skuld/)).toBeInTheDocument();
  });

  it('renders third-party notices link', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', { name: /第三方資料致謝/ });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toMatch(/THIRD-PARTY-NOTICES\.md$/);
  });
});
