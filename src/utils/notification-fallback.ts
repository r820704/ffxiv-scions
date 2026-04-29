// In-page fallback signals for when the OS notification banner is suppressed
// (Windows Focus Assist auto-rules, Chrome quieter messaging, multi-monitor
// gotchas, etc.). Both functions are synchronous and idempotent at the call
// site; they swallow failures so a fallback miss never breaks the fire path.

/**
 * Play a short two-tone beep using Web Audio API. Requires the page to have
 * received at least one user gesture (the bell click counts) — modern Chrome
 * unlocks audio per page once gesture is observed. Fails silently otherwise.
 */
export function playReminderBeep(): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const start = ctx.currentTime;

    const playTone = (offset: number, freq: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = start + offset;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    };

    playTone(0, 880, 0.2);     // A5
    playTone(0.25, 1320, 0.2); // E6

    // Release the AudioContext after the tones finish to free the device.
    window.setTimeout(() => {
      void ctx.close();
    }, 1000);
  } catch (err) {
    console.warn('[reminder] beep failed:', err);
  }
}

/**
 * Flash the document title between the original and `message` until the user
 * returns to the tab (visibility / focus) or `durationMs` elapses. Restores
 * the original title on cleanup.
 */
export function flashTitle(message: string, durationMs: number = 30_000): void {
  if (typeof document === 'undefined') return;
  const original = document.title;
  let showAlt = true;

  const interval = window.setInterval(() => {
    document.title = showAlt ? message : original;
    showAlt = !showAlt;
  }, 800);

  const stop = () => {
    window.clearInterval(interval);
    document.title = original;
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', onFocus);
    window.clearTimeout(timeoutId);
  };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') stop();
  };
  const onFocus = () => stop();

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('focus', onFocus);
  const timeoutId = window.setTimeout(stop, durationMs);
}
