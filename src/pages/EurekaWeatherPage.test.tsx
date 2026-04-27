import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import EurekaWeatherPage from './EurekaWeatherPage';

afterEach(cleanup);

describe('EurekaWeatherPage', () => {
  it('renders all 4 Eureka zone rows with TC names', () => {
    render(<EurekaWeatherPage />);
    expect(screen.getByText('優雷卡常風之地')).toBeTruthy();
    expect(screen.getByText('優雷卡恆冰之地')).toBeTruthy();
    expect(screen.getByText('優雷卡湧火之地')).toBeTruthy();
    expect(screen.getByText('優雷卡豐水之地')).toBeTruthy();
  });

  it('renders game clock label', () => {
    render(<EurekaWeatherPage />);
    expect(screen.getByText('艾奧傑亞時間')).toBeTruthy();
  });

  it('renders weather filter bar', () => {
    render(<EurekaWeatherPage />);
    // Section labels of the M4 two-group filter bar
    expect(screen.getByText(/觸發 NM/)).toBeTruthy();
    expect(screen.getByText(/一般天氣/)).toBeTruthy();
  });

  it('renders a help button in the page header', () => {
    render(<EurekaWeatherPage />);
    expect(screen.getByRole('button', { name: /說明/ })).toBeTruthy();
  });

  it('opens HelpModal when help button is clicked', () => {
    render(<EurekaWeatherPage />);
    fireEvent.click(screen.getByRole('button', { name: /說明/ }));
    expect(screen.getByText(/怎麼讀格子/)).toBeTruthy();
  });
});
