import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Icon, type IconName } from './Icon';

const NAV: { to: string; label: string; short: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', short: 'Home', icon: 'home', end: true },
  { to: '/library', label: 'Music Library', short: 'Library', icon: 'library' },
  { to: '/setlists', label: 'Setlists', short: 'Setlists', icon: 'list' },
  { to: '/accompaniment', label: 'Service Accompaniment', short: 'Service', icon: 'service' },
  { to: '/favourites', label: 'Favourites', short: 'Favourites', icon: 'heart' },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: 'settings' },
];

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[252px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line px-3 py-5 lg:flex">
        <Brand />
        <nav className="mt-6 space-y-0.5" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? 'bg-surface text-ink shadow-[0_0_0_1px_rgb(var(--line))]' : 'text-muted hover:bg-sunken hover:text-ink'}`
              }
            >
              <Icon name={n.icon} size={18} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-3 text-[11px] leading-relaxed text-faint">
          Built from “CEYC Band Progressions”. Your favourites, notes and setlists stay on this device.
        </p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Brand compact />
        <NavLink to="/settings" className="icon-btn" aria-label="Settings">
          <Icon name="settings" size={19} />
        </NavLink>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
        <Outlet />
      </main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.filter((n) => n.to !== '/settings').map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive ? 'text-accent' : 'text-muted'}`}
          >
            <Icon name={n.icon} size={21} />
            {n.short}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink to="/" className="flex items-center gap-2.5 px-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink">
        <Icon name="music" size={17} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold tracking-tight">CEYC Band</span>
        {!compact && <span className="block text-[11px] text-muted">Music Library</span>}
      </span>
    </NavLink>
  );
}
