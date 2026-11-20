import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-5 pt-2">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center animate-fade-up">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sunken text-muted">
        <Icon name={icon} size={22} />
      </div>
      <h2 className="font-semibold">{title}</h2>
      {children && <div className="mt-1.5 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-24 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label}…
    </div>
  );
}

export function FlagList({ flags, title = 'Check against the PDF' }: { flags: string[]; title?: string }) {
  if (!flags.length) return null;
  return (
    <div className="rounded-xl border border-warn/30 bg-warn-soft px-3.5 py-3 text-sm">
      <p className="mb-1.5 flex items-center gap-1.5 font-medium text-warn">
        <Icon name="flag" size={15} /> {title}
      </p>
      <ul className="space-y-1 text-ink/80">
        {flags.map((f, i) => (
          <li key={i} className="pl-5 -indent-3">· {f}</li>
        ))}
      </ul>
    </div>
  );
}

export function KeyBadge({ k, muted = false }: { k: string; muted?: boolean }) {
  return (
    <span className={`inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${muted ? 'bg-sunken text-muted' : 'bg-accent-soft text-accent'}`}>
      {k}
    </span>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <Icon name="chevronLeft" size={16} /> {children}
    </Link>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label, size = 'md' }: {
  value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; label: string; size?: 'md' | 'lg';
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-xl bg-sunken p-1 ${size === 'lg' ? 'h-12' : 'h-10'}`}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 text-sm font-medium transition-colors ${size === 'lg' ? 'min-w-[3.5rem] text-base' : ''} ${value === o.value ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-muted hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
