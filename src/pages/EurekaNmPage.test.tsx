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
  it('renders 5 sub-tabs (常風 / 恆冰 / 湧火 / 豐水 / 自定義)', () => {
    render(<MemoryRouter><EurekaNmPage /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: /常風/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /恆冰/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /湧火/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /豐水/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /自定義/ })).toBeInTheDocument();
  });
});
