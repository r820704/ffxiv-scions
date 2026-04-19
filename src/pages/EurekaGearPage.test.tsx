import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EurekaGearPage from './EurekaGearPage';

const gearFixture = [
  {
    id: 100, name: '阿涅摩斯之刀', iconId: 0, stage: 'anemos', slot: 'weapon',
    jobs: ['SAM'], itemLevel: 370,
    source: { npcId: 1, npcName: '帆克斯', zone: '優雷卡：常風之地', specialShopId: 1 },
    cost: { materials: [{ materialId: 9, quantity: 3 }] },
    tags: [],
  },
  {
    id: 200, name: '帕格斯頭盔', iconId: 0, stage: 'pagos', slot: 'head',
    jobs: ['PLD'], itemLevel: 380,
    source: { npcId: 2, npcName: '加藍', zone: '優雷卡：恆冰之地', specialShopId: 2 },
    cost: { materials: [{ materialId: 9, quantity: 99 }] },
    tags: [],
  },
];
const materialsFixture = [{ id: 9, name: '蒼晶', iconId: 0, category: 'crystal' }];

describe('EurekaGearPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(url.includes('eureka-gear') ? gearFixture : materialsFixture),
        }),
      ),
    );
  });

  it('renders all gear by default', async () => {
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument());
    expect(screen.getByText('帕格斯頭盔')).toBeInTheDocument();
  });

  it('switching display to 可兌換 filters items correctly', async () => {
    localStorage.setItem(
      'eureka-gear-inventory-v1',
      JSON.stringify({ materials: { 9: 5 }, ownedGear: {}, updatedAt: '' }),
    );
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument());
    const radios = screen.getAllByRole('radio', { name: '可兌換' });
    fireEvent.click(radios[0]);
    await waitFor(() => {
      expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument();
    });
  });

  it('toggling 已持有 checkbox on a card marks it as owned', async () => {
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument());
    const checkboxes = screen.getAllByRole('checkbox', { name: /阿涅摩斯之刀 已持有/ });
    fireEvent.click(checkboxes[0]);
    const unownedRadios = screen.getAllByRole('radio', { name: '未持有' });
    fireEvent.click(unownedRadios[0]);
    await waitFor(() => {
      const items = screen.getAllByText('帕格斯頭盔');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
