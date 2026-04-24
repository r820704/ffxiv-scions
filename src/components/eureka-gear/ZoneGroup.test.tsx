import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ZoneGroup } from './ZoneGroup';

afterEach(() => cleanup());

describe('ZoneGroup', () => {
  it('renders zone TC name in header', () => {
    render(<ZoneGroup zone="pyros" items={[]} materialsMap={{}} />);
    expect(screen.getByText(/湧火之地/)).toBeInTheDocument();
  });

  it('renders material rows with shortage info', () => {
    render(
      <ZoneGroup
        zone="pyros"
        items={[{ materialId: 24124, shortage: 25, totalNeeded: 50 }]}
        materialsMap={{ 24124: { nameTC: '湧火晶簇', icon: 0 } }}
      />,
    );
    expect(screen.getByText(/湧火晶簇/)).toBeInTheDocument();
    expect(screen.getByText(/缺 25 \/ 總需 50/)).toBeInTheDocument();
  });

  it('shows 已足夠 when all items have 0 shortage', () => {
    render(
      <ZoneGroup
        zone="pyros"
        items={[{ materialId: 24124, shortage: 0, totalNeeded: 10 }]}
        materialsMap={{ 24124: { nameTC: '湧火晶簇', icon: 0 } }}
      />,
    );
    expect(screen.getByText(/已足夠/)).toBeInTheDocument();
  });
});
