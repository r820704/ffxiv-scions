import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EurekaWeatherPage from './EurekaWeatherPage';

afterEach(cleanup);

describe('EurekaWeatherPage', () => {
  it('renders all 4 Eureka zone rows with TC names', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('優雷卡常風之地')).toBeTruthy();
    expect(screen.getByText('優雷卡恆冰之地')).toBeTruthy();
    expect(screen.getByText('優雷卡湧火之地')).toBeTruthy();
    expect(screen.getByText('優雷卡豐水之地')).toBeTruthy();
  });

  it('renders game clock label', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('艾奧傑亞')).toBeTruthy();
  });

  it('renders weather filter bar', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    // Section labels of the M4 two-group filter bar
    expect(screen.getByText(/觸發 NM/)).toBeTruthy();
    expect(screen.getByText(/一般天氣/)).toBeTruthy();
  });

  it('renders a help button in the page header', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /說明/ })).toBeTruthy();
  });

  it('opens HelpModal when help button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /說明/ }));
    expect(screen.getByText(/怎麼讀格子/)).toBeTruthy();
  });

  it('renders an NM search button in the page header', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /搜尋 NM/ })).toBeTruthy();
  });

  it('opens NmSearchPanel when search button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /搜尋 NM/ }));
    expect(screen.getByPlaceholderText(/搜尋 NM/)).toBeTruthy();
  });
});

describe('EurekaWeatherPage - NM detail integration', () => {
  it('opens detail modal when URL has nm=pazuzu (deep link)', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather?nm=pazuzu']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('帕祖祖')).toBeInTheDocument();
  });

  it('clears nm param from URL when modal closed via close button', () => {
    render(
      <MemoryRouter initialEntries={['/eureka-weather?nm=pazuzu']}>
        <EurekaWeatherPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('關閉'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
