import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EurekaGearPage from './EurekaGearPage';

afterEach(() => cleanup());

const weapons = [
  { id: 1, chainId: 'drg-ryunohige', job: 'DRG', isShield: false, stage: 'anemos', itemLevel: 355, tcName: '龍鬚·常風', enName: 'Ryunohige Anemos', iconId: 0 },
  { id: 2, chainId: 'pld-galatyn', job: 'PLD', isShield: false, stage: 'pagos', itemLevel: 360, tcName: '神聖劍·恆冰', enName: 'Galatyn Pagos', iconId: 0 },
];
const mats = [{ id: 21801, tcName: '異質結晶', enName: 'Protean Crystal', iconId: 0, category: 'crystal' }];

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(url.includes('weapons') ? weapons : mats),
  })));
});

describe('EurekaGearPage', () => {
  it('renders three tabs', async () => {
    render(<MemoryRouter><EurekaGearPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/禁地兵裝/)).toBeInTheDocument());
    expect(screen.getByRole('tab', { name: /總覽/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /職業詳情/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /素材需求/ })).toBeInTheDocument();
  });

  it('default tab is overview (shows job grid)', async () => {
    render(<MemoryRouter><EurekaGearPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/禁地兵裝/)).toBeInTheDocument());
    expect(screen.getByTestId('job-grid')).toBeInTheDocument();
  });

  it('clicking farming tab switches content', async () => {
    render(<MemoryRouter><EurekaGearPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/禁地兵裝/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: /素材需求/ }));
    expect(screen.getByText(/沒有設定 target/)).toBeInTheDocument();
  });
});
