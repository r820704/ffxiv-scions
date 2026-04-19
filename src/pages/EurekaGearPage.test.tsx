import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import EurekaGearPage from './EurekaGearPage';

afterEach(() => cleanup());

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

  it('switching display to 可兌換 with enough inventory keeps only the affordable one', async () => {
    localStorage.setItem(
      'eureka-gear-inventory-v1',
      JSON.stringify({ materials: { 9: 5 }, ownedGear: {}, updatedAt: '' }),
    );
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('radio', { name: '可兌換' }));
    expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument();
    expect(screen.queryByText('帕格斯頭盔')).toBeNull();
  });

  it('toggling 已持有 checkbox on a card + switching to 未持有 hides it', async () => {
    render(<EurekaGearPage />);
    await waitFor(() => expect(screen.getByText('阿涅摩斯之刀')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('checkbox', { name: /阿涅摩斯之刀 已持有/ }));
    fireEvent.click(screen.getByRole('radio', { name: '未持有' }));
    expect(screen.queryByText('阿涅摩斯之刀')).toBeNull();
    expect(screen.getByText('帕格斯頭盔')).toBeInTheDocument();
  });
});
