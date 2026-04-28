import { describe, it, expect } from 'vitest';
import { mapCoordToPercent } from './eureka-map-coords';

const ANEMOS_BOUNDS = { xMin: 1, xMax: 42, yMin: 1, yMax: 42 };

describe('mapCoordToPercent', () => {
  it('returns 0% / 0% at min boundary', () => {
    const r = mapCoordToPercent({ x: 1, y: 1 }, ANEMOS_BOUNDS);
    expect(r.left).toBe('0%');
    expect(r.top).toBe('0%');
  });

  it('returns 100% / 100% at max boundary', () => {
    const r = mapCoordToPercent({ x: 42, y: 42 }, ANEMOS_BOUNDS);
    expect(r.left).toBe('100%');
    expect(r.top).toBe('100%');
  });

  it('returns 50% / 50% at center', () => {
    const r = mapCoordToPercent({ x: 21.5, y: 21.5 }, ANEMOS_BOUNDS);
    expect(r.left).toBe('50%');
    expect(r.top).toBe('50%');
  });

  it('clamps out-of-bounds to 0% / 100%', () => {
    expect(mapCoordToPercent({ x: 0, y: 50 }, ANEMOS_BOUNDS).left).toBe('0%');
    expect(mapCoordToPercent({ x: 50, y: 0 }, ANEMOS_BOUNDS).top).toBe('0%');
    expect(mapCoordToPercent({ x: 0, y: 50 }, ANEMOS_BOUNDS).top).toBe('100%');
  });
});
