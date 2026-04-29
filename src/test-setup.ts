import '@testing-library/jest-dom/vitest';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom 25 (vitest 2.1) does not expose BroadcastChannel on the window proxy.
// Node has a native BroadcastChannel on globalThis — re-expose it so production
// code can `new BroadcastChannel(...)` in tests too.
if (typeof globalThis.BroadcastChannel === 'undefined') {
  class NoopBroadcastChannel {
    name: string;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    constructor(name: string) {
      this.name = name;
    }
    postMessage(_data: unknown) {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  globalThis.BroadcastChannel = NoopBroadcastChannel as unknown as typeof BroadcastChannel;
}

// jsdom does not implement the Notification API. Tests that need to assert
// notification firing will install their own mock per-test; this stub keeps
// `'Notification' in globalThis` true so feature detection runs the supported
// path by default.
if (typeof (globalThis as { Notification?: unknown }).Notification === 'undefined') {
  class NotificationStub {
    static permission: NotificationPermission = 'default';
    static requestPermission = async (): Promise<NotificationPermission> => 'default';
    title: string;
    body: string;
    tag: string;
    onclick: (() => void) | null = null;
    constructor(title: string, options?: { body?: string; tag?: string }) {
      this.title = title;
      this.body = options?.body ?? '';
      this.tag = options?.tag ?? '';
    }
    close() {}
  }
  (globalThis as { Notification?: unknown }).Notification = NotificationStub;
}
