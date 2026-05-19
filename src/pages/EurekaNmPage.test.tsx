import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EurekaNmPage from './EurekaNmPage';

afterEach(() => cleanup());

describe('EurekaNmPage', () => {
  it('renders page title 「惡名精英」', () => {
    render(<MemoryRouter><EurekaNmPage /></MemoryRouter>);
    expect(screen.getByText('惡名精英')).toBeInTheDocument();
  });
  it('renders 5 sub-tabs (Anemos / Pagos / Pyros / Hydatos / 自定義)', () => {
    render(<MemoryRouter><EurekaNmPage /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: /Anemos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pagos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pyros/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Hydatos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /自定義/i })).toBeInTheDocument();
  });
});
