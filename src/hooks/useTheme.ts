import { useEffect } from 'react';
import { useUserData } from '../store/UserDataProvider';

/** Apply light/dark/system theme to <html>. */
export function useTheme() {
  const theme = useUserData((d) => d.settings.theme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
