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

  it('renders 6 column headers', () => {
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
    expect(screen.getByText('觸發條件')).toBeInTheDocument();
    expect(screen.getByText(/冷卻/)).toBeInTheDocument();
    expect(screen.getByText('記錄')).toBeInTheDocument();
  });
});
