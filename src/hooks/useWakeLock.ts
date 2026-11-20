import { useEffect, useState } from 'react';

type Sentinel = { release(): Promise<void>; addEventListener(t: 'release', cb: () => void): void };

/** Keep the screen awake while `enabled`, where the browser supports the Wake Lock API. */
export function useWakeLock(enabled: boolean) {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!enabled || !supported) return;
    let sentinel: Sentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        sentinel = await (navigator as unknown as { wakeLock: { request(t: 'screen'): Promise<Sentinel> } }).wakeLock.request('screen');
        if (cancelled) return void sentinel.release();
        setActive(true);
        sentinel.addEventListener('release', () => setActive(false));
      } catch {
        setActive(false);
      }
    };
    request();
    // The lock is dropped when the tab is hidden; take it again on return.
    const onVis = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      sentinel?.release().catch(() => {});
      setActive(false);
    };
  }, [enabled, supported]);
  return { supported, active };
}
