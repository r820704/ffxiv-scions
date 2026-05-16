import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteFooter from './SiteFooter';

afterEach(() => cleanup());

function renderFooter() {
  return render(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>
  );
}

describe('SiteFooter', () => {
  it('renders SQUARE ENIX copyright', () => {
    renderFooter();
    expect(screen.getByText(/SQUARE ENIX/)).toBeInTheDocument();
  });

  it('links the greeting to the about page', () => {
    renderFooter();
    const link = screen.getByRole('link', { name: /路過打聲招呼/ });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/about');
  });

  it('keeps character names alongside the greeting', () => {
    renderFooter();
    expect(screen.getByText(/TC 迦樓羅 Skuld/)).toBeInTheDocument();
    expect(screen.getByText(/CN 柔风海湾 Skuld/)).toBeInTheDocument();
  });

  it('renders third-party notices link', () => {
    renderFooter();
    const link = screen.getByRole('link', { name: /第三方資料致謝/ });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toMatch(/THIRD-PARTY-NOTICES\.md$/);
  });

  it('displays the app version from __APP_VERSION__ (vite-injected)', () => {
    renderFooter();
    // Matches v + semver-ish digits, optionally followed by "+" suffix when
    // the build commit is past the latest release tag (in-development build).
    // Avoids hard-coding a specific version so the test stays valid across
    // release-please bumps.
    expect(screen.getByText(/^v\d+\.\d+\.\d+\+?$/)).toBeInTheDocument();
  });
});
