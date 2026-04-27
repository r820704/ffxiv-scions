import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});
