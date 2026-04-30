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

// jsdom does not implement matchMedia. Default to a "desktop with mouse" profile:
// hover-capable + fine pointer match, coarse pointer (touch) does not. Tests that
// need to simulate touch can override this stub per-test.
if (typeof window !== 'undefined' && !window.matchMedia) {
  const defaultMatch = (query: string): boolean => {
    if (query.includes('hover: hover')) return true;
    if (query.includes('pointer: fine')) return true;
    if (query.includes('pointer: coarse')) return false;
    if (query.includes('hover: none')) return false;
    return false;
  };
  window.matchMedia = (query: string) =>
    ({
      matches: defaultMatch(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
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
    // In the noop fallback, listeners are silently dropped — this means the scheduler's
    // claim protocol degrades to "fire always" (no dedup). Only relevant if the host
    // environment lacks BroadcastChannel; Node 18+ exposes it natively so this path
    // should not activate in normal Vitest runs.
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
