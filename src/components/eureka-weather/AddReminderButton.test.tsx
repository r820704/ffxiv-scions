import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);
import AddReminderButton from './AddReminderButton';
import { RemindersProvider } from '@/hooks/useReminders';

function setup(props: React.ComponentProps<typeof AddReminderButton>) {
  return render(
    <RemindersProvider>
      <AddReminderButton {...props} />
    </RemindersProvider>,
  );
}

describe('AddReminderButton', () => {
  const baseProps = {
    zone: 'Eureka Anemos' as const,
    weather: 'Gales',
    targetMs: Date.now() + 5 * 60_000,
    source: 'm9-zone-hit' as const,
    onToast: vi.fn(),
  };

  it('renders bell icon with accessible name', () => {
    setup(baseProps);
    expect(screen.getByRole('button', { name: /提醒/ })).toBeInTheDocument();
  });

  it('clicking adds a reminder when supported and permission already granted', async () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    class N {
      static permission = 'granted';
      static requestPermission = async () => 'granted';
    }
    (globalThis as { Notification?: unknown }).Notification = N as unknown;

    const onToast = vi.fn();
    setup({ ...baseProps, onToast });
    const btn = screen.getByRole('button', { name: /提醒/ });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');

    (globalThis as { Notification?: unknown }).Notification = original;
  });

  it('toasts when unsupported', () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    delete (globalThis as { Notification?: unknown }).Notification;
    const onToast = vi.fn();
    setup({ ...baseProps, onToast });
    fireEvent.click(screen.getByRole('button', { name: /提醒/ }));
    expect(onToast).toHaveBeenCalledWith(expect.stringMatching(/不支援|加入主畫面/));
    (globalThis as { Notification?: unknown }).Notification = original;
  });

  it('toasts when permission denied', () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    class N {
      static permission = 'denied';
      static requestPermission = async () => 'denied';
    }
    (globalThis as { Notification?: unknown }).Notification = N as unknown;
    const onToast = vi.fn();
    setup({ ...baseProps, onToast });
    fireEvent.click(screen.getByRole('button', { name: /提醒/ }));
    expect(onToast).toHaveBeenCalledWith(expect.stringMatching(/拒絕|瀏覽器設定/));
    (globalThis as { Notification?: unknown }).Notification = original;
  });

  it('clicking removes reminder when already set', async () => {
    const original = (globalThis as { Notification?: unknown }).Notification;
    class N {
      static permission = 'granted';
      static requestPermission = async () => 'granted';
    }
    (globalThis as { Notification?: unknown }).Notification = N as unknown;

    localStorage.clear();
    const onToast = vi.fn();
    setup({ ...baseProps, onToast });
    const btn = screen.getByRole('button', { name: /提醒/ });

    // Click once to set
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');

    // Click again to remove
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    (globalThis as { Notification?: unknown }).Notification = original;
  });
});
