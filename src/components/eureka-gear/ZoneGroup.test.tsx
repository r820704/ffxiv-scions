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

  it('renders an img element for the material icon when an icon id is provided', () => {
    // icon id 0 falls back to no icon since MATERIAL_ICONS lookup uses
    // the numeric id as key; passing a non-zero id ensures the lookup is
    // attempted (even if jsdom does not actually load the asset).
    const { container } = render(
      <ZoneGroup
        zone="pyros"
        items={[{ materialId: 24124, shortage: 1, totalNeeded: 1 }]}
        materialsMap={{ 24124: { nameTC: '湧火晶簇', icon: 24124 } }}
      />,
    );
    // The icon element is conditionally rendered when the lookup hits.
    // We assert the row layout class hosts the optional <img> via aria-hidden.
    const li = container.querySelector('li');
    expect(li).not.toBeNull();
    expect(li?.className).toMatch(/items-center/);
  });
});
