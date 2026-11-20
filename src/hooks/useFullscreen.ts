import { useCallback, useEffect, useState } from 'react';

export function useFullscreen() {
  const supported = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  const toggle = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  }, []);
  return { supported, on, toggle };
}
