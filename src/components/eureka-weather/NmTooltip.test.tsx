import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import NmTooltip from './NmTooltip';
import type { EurekaNm } from '@/data/eureka-nm-data';

afterEach(cleanup);

const pazuzu: EurekaNm = {
  id: 'pazuzu',
  nameTw: '帕祖祖',
  nameEn: 'Pazuzu',
  zone: 'Eureka Anemos',
  level: 20,
  trigger: { weather: ['Gales'], timeOfDay: 'night' },
};

const fafnir: EurekaNm = {
  id: 'fafnir',
  nameTw: '法夫納',
  nameEn: 'Fafnir',
  zone: 'Eureka Anemos',
  level: 17,
  trigger: { timeOfDay: 'night' },
};

describe('NmTooltip', () => {
  it('renders children directly when nms is empty', () => {
    render(
      <NmTooltip nms={[]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    expect(screen.getByTestId('cell')).toBeTruthy();
    expect(screen.queryByText('可能出現')).toBeNull();
  });

  it('shows tooltip content on hover', () => {
    render(
      <NmTooltip nms={[pazuzu, fafnir]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    fireEvent.mouseEnter(screen.getByTestId('cell').parentElement!);
    expect(screen.getByText('可能出現')).toBeTruthy();
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    expect(screen.getByText('法夫納')).toBeTruthy();
    expect(screen.getByText('強風+夜間')).toBeTruthy();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    const trigger = screen.getByTestId('cell').parentElement!;
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('帕祖祖')).toBeNull();
  });

  it('shows level for each NM', () => {
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    fireEvent.mouseEnter(screen.getByTestId('cell').parentElement!);
    expect(screen.getByText('Lv.20')).toBeTruthy();
  });

  describe('pin behavior (M1)', () => {
    it('keeps popover open after mouseLeave when clicked (pinned)', async () => {
      render(
        <NmTooltip nms={[pazuzu]}>
          <div data-testid="cell">cell</div>
        </NmTooltip>,
      );
      const trigger = screen.getByTestId('cell').parentElement!;
      fireEvent.mouseEnter(trigger);
      fireEvent.click(trigger);
      fireEvent.mouseLeave(trigger);
      expect(await screen.findByText('帕祖祖')).toBeTruthy();
    });

    it('closes after second click (unpin) followed by mouseLeave', async () => {
      render(
        <NmTooltip nms={[pazuzu]}>
          <div data-testid="cell">cell</div>
        </NmTooltip>,
      );
      const trigger = screen.getByTestId('cell').parentElement!;
      fireEvent.click(trigger); // pin
      fireEvent.click(trigger); // unpin
      fireEvent.mouseLeave(trigger);
      await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull());
    });
  });

  it('calls onOpenDetail and closes popover when NM name button is clicked', async () => {
    const handle = vi.fn();
    render(
      <NmTooltip nms={[pazuzu]} onOpenDetail={handle}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    const trigger = screen.getByTestId('cell').parentElement!;
    fireEvent.click(trigger); // pin to open
    const nameButton = screen.getByRole('button', { name: '帕祖祖' });
    fireEvent.click(nameButton);
    expect(handle).toHaveBeenCalledWith('pazuzu');
    await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull());
  });
});
