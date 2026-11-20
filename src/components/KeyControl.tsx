import { useEffect, useRef, useState } from 'react';
import { allKeys, keyToString, parseKey, pitchClass, transposeKey } from '../music';
import type { KeyOption } from '../data/types';
import { Icon } from './Icon';

/**
 * Key selector: step down/up a semitone, or pick any key (and labelled key
 * options such as "Busi · Eb") from a menu.
 */
export function KeyControl({ written, value, options, onChange, size = 'md' }: {
  written: string | null;
  value: string | null;
  options?: KeyOption[];
  onChange: (key: string | null) => void;
  size?: 'md' | 'lg';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const current = parseKey(value) ?? parseKey(written);
  const step = (n: number) => {
    const base = current ?? parseKey('C')!;
    const next = keyToString(transposeKey(base, n));
    onChange(next === written ? null : next);
  };
  const choose = (k: string) => {
    onChange(k === written ? null : k);
    setOpen(false);
  };
  const h = size === 'lg' ? 'h-12' : 'h-10';
  const isSame = (a: string, b: string | null) => {
    const ka = parseKey(a), kb = parseKey(b);
    return !!ka && !!kb && pitchClass(ka.tonic) === pitchClass(kb.tonic) && ka.mode === kb.mode;
  };

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <div className={`inline-flex items-center rounded-xl border border-line bg-surface ${h}`}>
        <button className={`grid ${h} w-10 place-items-center text-muted hover:text-ink`} onClick={() => step(-1)} aria-label="Key down a semitone">
          <Icon name="minus" size={18} />
        </button>
        <button
          className={`flex ${h} min-w-[5.5rem] items-center justify-center gap-1.5 border-x border-line px-3 font-semibold ${size === 'lg' ? 'text-lg' : 'text-sm'}`}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Choose key"
        >
          <span className="text-xs font-medium text-muted">Key</span>
          {current ? keyToString(current) : '—'}
          <Icon name="chevronDown" size={14} className="text-faint" />
        </button>
        <button className={`grid ${h} w-10 place-items-center text-muted hover:text-ink`} onClick={() => step(1)} aria-label="Key up a semitone">
          <Icon name="plus" size={18} />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-line bg-surface p-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] animate-fade-up">
          {(written || options?.length) && (
            <div className="mb-3 space-y-1">
              {written && (
                <OptionRow label="Written key" k={written} active={!value || isSame(written, value)} onClick={() => choose(written)} />
              )}
              {options?.filter((o) => o.key !== written || o.label !== 'Original').map((o) => (
                <OptionRow key={o.label + o.key} label={o.label} k={o.key} active={!!value && isSame(o.key, value)} onClick={() => choose(o.key)} />
              ))}
            </div>
          )}
          <p className="eyebrow mb-2">All keys</p>
          <div role="listbox" className="grid grid-cols-6 gap-1">
            {allKeys('major').map((k) => {
              const s = keyToString(k);
              const active = current && isSame(s, keyToString(current));
              return (
                <button
                  key={s}
                  role="option"
                  aria-selected={!!active}
                  onClick={() => choose(s)}
                  className={`h-9 rounded-lg text-sm font-semibold ${active ? 'bg-accent text-accent-ink' : 'hover:bg-sunken'}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {value && (
            <button className="btn-quiet mt-2 h-8 w-full text-xs" onClick={() => { onChange(null); setOpen(false); }}>
              {written ? 'Reset to written key' : 'Clear key (show numbers)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OptionRow({ label, k, active, onClick }: { label: string; k: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-sm ${active ? 'bg-accent-soft text-accent' : 'hover:bg-sunken'}`}>
      <span>{label}</span>
      <span className="font-semibold">{k}</span>
    </button>
  );
}
