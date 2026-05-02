import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NmSearchResultRow from './NmSearchResultRow';
import type { EurekaNm } from '@/data/eureka-nm-data';

afterEach(cleanup);

const fixedNow = new Date('2026-04-18T12:00:00Z').getTime();

const conditionalNm: EurekaNm = {
  id: 'king-arthro',
  nameTw: '亞瑟羅王',
  nameEn: 'King Arthro',
  zone: 'Eureka Pagos',
  level: 30,
  trigger: { nm: { weather: ['Fog'] } },
};

const unconditionalNm: EurekaNm = {
  id: 'sabotender-corrido',
  nameTw: '寇里多仙人掌怪',
  nameEn: 'Sabotender Corrido',
  zone: 'Eureka Anemos',
  level: 1,
};

describe('NmSearchResultRow', () => {
  it('renders NM TC name + EN name + level + zone', () => {
    render(
      <NmSearchResultRow
        nm={conditionalNm}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByText('亞瑟羅王')).toBeTruthy();
    expect(screen.getByText('King Arthro')).toBeTruthy();
    expect(screen.getByText(/Lv\.30/)).toBeTruthy();
    expect(screen.getByText(/恆冰之地/)).toBeTruthy();
  });

  it('shows 常駐 chip + "無條件、隨時可刷" for unconditional NM', () => {
    render(
      <NmSearchResultRow
        nm={unconditionalNm}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByText('常駐')).toBeTruthy();
    expect(screen.getByText(/無條件/)).toBeTruthy();
  });

  it('shows trigger condition for conditional NM', () => {
    render(
      <NmSearchResultRow
        nm={conditionalNm}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
      />,
    );
    expect(screen.getByText(/條件：薄霧/)).toBeTruthy();
  });

  it('calls onScrollToCell when a hit button is clicked', () => {
    const onScrollToCell = vi.fn();
    render(
      <NmSearchResultRow
        nm={conditionalNm}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={onScrollToCell}
      />,
    );
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]!);
      expect(onScrollToCell).toHaveBeenCalled();
    }
  });

  it('calls onOpenDetail when NM name button clicked', () => {
    const handleOpenDetail = vi.fn();
    render(
      <NmSearchResultRow
        nm={conditionalNm}
        now={fixedNow}
        forecastCount={48}
        onScrollToCell={vi.fn()}
        onOpenDetail={handleOpenDetail}
      />,
    );
    const buttons = screen.getAllByRole('button');
    // First button should be the NM name (when onOpenDetail is provided)
    fireEvent.click(buttons[0]!);
    expect(handleOpenDetail).toHaveBeenCalledWith('king-arthro');
  });
});
