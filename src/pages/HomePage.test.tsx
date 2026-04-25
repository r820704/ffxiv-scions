import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders all three feature cards with correct titles', () => {
    renderWithRouter(<HomePage />);

    expect(screen.getByText('優雷卡天氣')).toBeInTheDocument();
    expect(screen.getByText('文理技能')).toBeInTheDocument();
    expect(screen.getByText('禁地兵裝')).toBeInTheDocument();
  });

  it('renders all three card descriptions', () => {
    renderWithRouter(<HomePage />);

    expect(screen.getAllByText(/優雷卡四地圖天氣時間軸/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Eureka 文理技能查詢/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SB Eureka 武器與防具升級進度追蹤/).length).toBeGreaterThan(0);
  });

  it('renders 優雷卡天氣 card with correct href', () => {
    renderWithRouter(<HomePage />);

    const weatherLink = screen.getAllByRole('link').find(
      (link) => link.getAttribute('href') === '/eureka-weather' && link.textContent?.includes('優雷卡天氣')
    );
    expect(weatherLink).toBeInTheDocument();
  });

  it('renders 文理技能 card with correct href', () => {
    renderWithRouter(<HomePage />);

    const eurekaLink = screen.getAllByRole('link').find(
      (link) => link.getAttribute('href') === '/eureka' && link.textContent?.includes('文理技能')
    );
    expect(eurekaLink).toBeInTheDocument();
  });

  it('renders 禁地兵裝 card with correct href', () => {
    renderWithRouter(<HomePage />);

    const gearLink = screen.getAllByRole('link').find(
      (link) => link.getAttribute('href') === '/eureka-gear' && link.textContent?.includes('禁地兵裝')
    );
    expect(gearLink).toBeInTheDocument();
  });
});
