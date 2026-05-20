import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { NmTable } from './NmTable';
import { eurekaNms } from '@/data/eureka-nm-data';

afterEach(() => cleanup());

const anemos = eurekaNms.filter(n => n.zone === 'Eureka Anemos');

describe('NmTable', () => {
  it('renders one row per NM plus header row', () => {
    render(
      <NmTable
        nms={anemos}
        records={{}}
        pinned={[]}
        now={Date.now()}
        onTogglePin={vi.fn()}
        onPop={vi.fn()}
        onClear={vi.fn()}
        onSetCustom={vi.fn()}
      />
    );
    expect(screen.getAllByRole('row').length).toBe(anemos.length + 1);
  });

  it('renders column headers: 等級 / NM 名稱 / 位置 / 觸發怪 / NM 條件 / 條件 / 冷卻 / 記錄', () => {
    render(
      <NmTable
        nms={anemos.slice(0, 1)}
        records={{}}
        pinned={[]}
        now={Date.now()}
        onTogglePin={vi.fn()}
        onPop={vi.fn()}
        onClear={vi.fn()}
        onSetCustom={vi.fn()}
      />
    );
    expect(screen.getByText('等級')).toBeInTheDocument();
    expect(screen.getByText('NM 名稱')).toBeInTheDocument();
    expect(screen.getByText('位置')).toBeInTheDocument();
    expect(screen.getByText('觸發怪')).toBeInTheDocument();
    expect(screen.getByText('NM 條件')).toBeInTheDocument();
    expect(screen.getByText('條件')).toBeInTheDocument();  // mobile-only header
    expect(screen.getByText('冷卻')).toBeInTheDocument();
    expect(screen.getByText('記錄')).toBeInTheDocument();
  });
});
