import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import NmTooltip, { NmTooltipProvider } from './NmTooltip';
import type { EurekaNm } from '@/data/eureka-nm-data';

const originalMatchMedia = window.matchMedia;

function mockHoverCapability(canHover: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('hover: hover') ? canHover : true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

const pazuzu: EurekaNm = {
  id: 'pazuzu',
  nameTw: '帕祖祖',
  nameEn: 'Pazuzu',
  zone: 'Eureka Anemos',
  level: 20,
  trigger: { nm: { weather: ['Gales'] }, mob: { timeOfDay: 'night' } },
};

const fafnir: EurekaNm = {
  id: 'fafnir',
  nameTw: '法夫納',
  nameEn: 'Fafnir',
  zone: 'Eureka Anemos',
  level: 17,
  trigger: { nm: { timeOfDay: 'night' } },
};

describe('NmTooltip', () => {
  it('renders children directly when nms is empty', () => {
    render(
      <NmTooltip nms={[]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    expect(screen.getByTestId('cell')).toBeTruthy();
    expect(screen.queryByText('符合觸發條件')).toBeNull();
  });

  it('opens tooltip on mouse hover (hover-capable device)', () => {
    render(
      <NmTooltip nms={[pazuzu, fafnir]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    fireEvent.mouseEnter(screen.getByTestId('cell').parentElement!);
    expect(screen.getByText('符合觸發條件')).toBeTruthy();
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    expect(screen.getByText('法夫納')).toBeTruthy();
    expect(screen.getByText('強風+夜間')).toBeTruthy();
  });

  it('does not open on hover when device cannot hover (touch-only)', () => {
    mockHoverCapability(false);
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    fireEvent.mouseEnter(screen.getByTestId('cell').parentElement!);
    expect(screen.queryByText('帕祖祖')).toBeNull();
  });

  it('still opens on click for touch-only devices', () => {
    mockHoverCapability(false);
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    fireEvent.click(screen.getByTestId('cell').parentElement!);
    expect(screen.getByText('帕祖祖')).toBeTruthy();
  });

  it('auto-closes after pointer leaves trigger when not pinned', async () => {
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    const trigger = screen.getByTestId('cell').parentElement!;
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull(), { timeout: 1000 });
  });

  it('pins tooltip on click and stays open after pointer leaves', async () => {
    vi.useFakeTimers();
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    const trigger = screen.getByTestId('cell').parentElement!;
    fireEvent.mouseEnter(trigger);
    fireEvent.click(trigger);
    fireEvent.mouseLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('帕祖祖')).toBeTruthy();
  });

  it('closes pinned tooltip on second click of trigger', async () => {
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    const trigger = screen.getByTestId('cell').parentElement!;
    fireEvent.click(trigger);
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull());
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

  it('closes when ✕ button inside the tooltip is clicked', async () => {
    render(
      <NmTooltip nms={[pazuzu]}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    fireEvent.click(screen.getByTestId('cell').parentElement!);
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('關閉'));
    await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull());
  });

  it('closes other tooltip when hovering a sibling under NmTooltipProvider', async () => {
    render(
      <NmTooltipProvider>
        <NmTooltip nms={[pazuzu]}>
          <div data-testid="cell-a">A</div>
        </NmTooltip>
        <NmTooltip nms={[fafnir]}>
          <div data-testid="cell-b">B</div>
        </NmTooltip>
      </NmTooltipProvider>,
    );
    const triggerA = screen.getByTestId('cell-a').parentElement!;
    const triggerB = screen.getByTestId('cell-b').parentElement!;
    fireEvent.mouseEnter(triggerA);
    expect(screen.getByText('帕祖祖')).toBeTruthy();
    fireEvent.mouseEnter(triggerB);
    await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull());
    expect(screen.getByText('法夫納')).toBeTruthy();
  });

  it('calls onOpenDetail and closes popover when NM name button is clicked', async () => {
    const handle = vi.fn();
    render(
      <NmTooltip nms={[pazuzu]} onOpenDetail={handle}>
        <div data-testid="cell">cell</div>
      </NmTooltip>,
    );
    const trigger = screen.getByTestId('cell').parentElement!;
    fireEvent.mouseEnter(trigger);
    const nameButton = screen.getByRole('button', { name: '帕祖祖' });
    fireEvent.click(nameButton);
    expect(handle).toHaveBeenCalledWith('pazuzu');
    await waitFor(() => expect(screen.queryByText('帕祖祖')).toBeNull());
  });
});
