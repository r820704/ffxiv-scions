import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NmDetailMap from './NmDetailMap';

afterEach(cleanup);

describe('NmDetailMap', () => {
  it('renders zone map image with correct src', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[]} />);
    const img = screen.getByAltText(/常風|Anemos/i);
    expect(img.getAttribute('src')).toMatch(/anemos\.jpg/);
  });

  it('renders one pin with label "1" for single pin', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[{ x: 21.5, y: 21.5, label: '1' }]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders multiple pins with labels', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[
      { x: 10, y: 10, label: '1' },
      { x: 30, y: 30, label: '2' },
      { x: 20, y: 40, label: '3' },
    ]} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows fallback text when image fails to load', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[]} />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText(/地圖暫不可用/)).toBeInTheDocument();
  });

  it('applies highlighted class to pin with highlighted=true', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[
      { x: 10, y: 10, label: '1', highlighted: true },
    ]} />);
    const pin = screen.getByText('1');
    // The pulsing animation class should apply when highlighted
    expect(pin.className).toMatch(/pulse|animate/);
  });

  it('renders an NM pin with rose color and trigger pins with amber color', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[
      { x: 7.4, y: 21.6, label: 'NM', kind: 'nm' },
      { x: 8.6, y: 20.2, label: '1', kind: 'trigger' },
    ]} />);
    const nmPin = screen.getByText('NM');
    const triggerPin = screen.getByText('1');
    expect(nmPin.className).toMatch(/bg-rose-/);
    expect(triggerPin.className).toMatch(/bg-amber-/);
    expect(nmPin.getAttribute('data-pin-kind')).toBe('nm');
    expect(triggerPin.getAttribute('data-pin-kind')).toBe('trigger');
  });

  it('offsets the NM pin and draws a leader line when it overlaps a trigger pin', () => {
    // Pazuzu case: NM at 7.4,21.6 vs trigger at 8.6,20.2 — % distance ~4 < threshold
    const { container } = render(<NmDetailMap zone="Eureka Anemos" pins={[
      { x: 7.4, y: 21.6, label: 'NM', kind: 'nm' },
      { x: 8.6, y: 20.2, label: '1', kind: 'trigger' },
    ]} />);
    const nmPin = screen.getByText('NM');
    const triggerPin = screen.getByText('1');
    expect(nmPin.getAttribute('data-pin-offset')).toBe('true');
    expect(triggerPin.getAttribute('data-pin-offset')).toBe('false');
    expect(container.querySelector('svg line')).not.toBeNull();
  });

  it('does NOT offset the NM pin when it is far from any trigger pin', () => {
    render(<NmDetailMap zone="Eureka Anemos" pins={[
      { x: 7.4, y: 21.6, label: 'NM', kind: 'nm' },
      { x: 30, y: 30, label: '1', kind: 'trigger' },
    ]} />);
    const nmPin = screen.getByText('NM');
    expect(nmPin.getAttribute('data-pin-offset')).toBe('false');
  });
});
