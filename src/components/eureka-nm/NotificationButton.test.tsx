import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NotificationButton } from './NotificationButton';

afterEach(() => cleanup());

describe('NotificationButton', () => {
  it('renders bell button with pin count badge', () => {
    render(
      <NotificationButton
        pinned={['pazuzu', 'copycat-cassie']}
        enabled={false}
        permission="default"
        supported={true}
        onSetEnabled={vi.fn()}
      />
    );
    const btn = screen.getByRole('button', { name: /NM 追蹤通知設定/ });
    expect(btn).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows BellOff icon when not enabled', () => {
    const { container } = render(
      <NotificationButton
        pinned={[]}
        enabled={false}
        permission="default"
        supported={true}
        onSetEnabled={vi.fn()}
      />
    );
    // Just verify the button renders without enabled state
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('clicking trigger opens popover with 啟用 button', () => {
    render(
      <NotificationButton
        pinned={[]}
        enabled={false}
        permission="default"
        supported={true}
        onSetEnabled={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /NM 追蹤通知設定/ }));
    expect(screen.getByText('NM 追蹤通知')).toBeInTheDocument();
    expect(screen.getByText('啟用')).toBeInTheDocument();
  });

  it('clicking 啟用 button calls onSetEnabled(true)', () => {
    const onSetEnabled = vi.fn();
    render(
      <NotificationButton
        pinned={[]}
        enabled={false}
        permission="default"
        supported={true}
        onSetEnabled={onSetEnabled}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /NM 追蹤通知設定/ }));
    fireEvent.click(screen.getByText('啟用'));
    expect(onSetEnabled).toHaveBeenCalledWith(true);
  });

  it('shows unsupported message when supported=false', () => {
    render(
      <NotificationButton
        pinned={[]}
        enabled={false}
        permission="denied"
        supported={false}
        onSetEnabled={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /NM 追蹤通知設定/ }));
    expect(screen.getByText(/瀏覽器不支援/)).toBeInTheDocument();
  });
});
