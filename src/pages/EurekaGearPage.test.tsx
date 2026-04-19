import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
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
  it('renders all chains by default', async () => {
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText(/禁地兵裝/)).toBeInTheDocument());
    // 10 chain cards from EUREKA_CHAINS registry
    expect(screen.getAllByRole('button', { name: /展開|收合/ }).length).toBeGreaterThanOrEqual(10);
  });

  it('filters to DRG only when DRG job chip clicked', async () => {
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText(/禁地兵裝/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '龍騎士' }));
    expect(screen.getByText('龍騎士 · 龍鬚')).toBeInTheDocument();
    expect(screen.queryByText('騎士 · 嘉拉汀')).toBeNull();
  });
});
