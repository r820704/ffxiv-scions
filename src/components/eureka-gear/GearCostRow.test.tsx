import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GearCostRow from './GearCostRow';

describe('GearCostRow', () => {
  it('renders "✓" class when owned >= need', () => {
    const { container } = render(
      <GearCostRow materialName="常風水晶" need={3} owned={5} />,
    );
    expect(screen.getByText(/常風水晶/)).toBeInTheDocument();
    expect(screen.getByText(/× 3/)).toBeInTheDocument();
    expect(screen.getByText(/持有 5/)).toBeInTheDocument();
    expect(container.querySelector('[data-sufficient="true"]')).not.toBeNull();
  });

  it('renders "✗" class when owned < need', () => {
    const { container } = render(
      <GearCostRow materialName="湧火水晶" need={5} owned={2} />,
    );
    expect(container.querySelector('[data-sufficient="false"]')).not.toBeNull();
  });
});
