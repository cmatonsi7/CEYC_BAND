import type { Notation } from '../data/types';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions } from '../store/userStore';

export const NOTATION_OPTIONS: { value: Notation; label: string; hint: string }[] = [
  { value: 'nns', label: 'Numbers', hint: 'Number degrees (Nashville), e.g. 1 – 2›3 – 4' },
  { value: 'chords', label: 'Chords', hint: 'Chord names in the chosen key, e.g. F – Gm›Am – Bb' },
  { value: 'both', label: 'Both', hint: 'Chord names with the number degree under each one' },
];

/** Numbers / Chords / Both switch. The choice is remembered and shared by every screen. */
export function NotationSwitch({ size = 'md', tone = 'default' }: { size?: 'md' | 'lg'; tone?: 'default' | 'stage' }) {
  const notation = useUserData((d) => d.settings.notation);
  const update = useUpdate();
  const lg = size === 'lg';
  return (
    <div role="radiogroup" aria-label="Show progressions as" className={`inline-flex rounded-xl bg-sunken p-1 ${lg ? 'h-12' : 'h-10'}`}>
      {NOTATION_OPTIONS.map((o) => {
        const on = notation === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            title={o.hint}
            onClick={() => update(actions.updateSettings({ notation: o.value }))}
            className={`rounded-lg px-3 font-semibold transition-colors ${lg ? 'min-w-[4.5rem] text-base' : 'text-sm'} ${
              on ? (tone === 'stage' ? 'bg-accent text-accent-ink' : 'bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]') : 'text-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Cycle to the next notation (used by the "N" shortcut in Performance Mode). */
export function nextNotation(n: Notation): Notation {
  const i = NOTATION_OPTIONS.findIndex((o) => o.value === n);
  return NOTATION_OPTIONS[(i + 1) % NOTATION_OPTIONS.length].value;
}
