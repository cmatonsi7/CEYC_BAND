import { useState } from 'react';
import type { Arrangement, Notation, SongSection } from '../data/types';
import { type KeyContext, resolveSection, sectionKey } from '../data/library';
import { keyToString, renderMelody } from '../music';
import { Progression } from './Progression';
import { FlagList } from './ui';
import { Icon } from './Icon';

export const KIND_STYLE: Record<SongSection['kind'], { label: string; dot: string }> = {
  intro: { label: 'Intro', dot: 'bg-sky-500' },
  verse: { label: 'Verse', dot: 'bg-emerald-500' },
  prechorus: { label: 'Pre-Chorus', dot: 'bg-amber-500' },
  chorus: { label: 'Chorus', dot: 'bg-rose-500' },
  bridge: { label: 'Bridge', dot: 'bg-violet-500' },
  interlude: { label: 'Interlude', dot: 'bg-teal-500' },
  outro: { label: 'Outro', dot: 'bg-slate-500' },
  melody: { label: 'Melody', dot: 'bg-fuchsia-500' },
  cue: { label: 'Lyric cue', dot: 'bg-orange-400' },
  correction: { label: 'Correction', dot: 'bg-red-600' },
  other: { label: 'Note', dot: 'bg-stone-400' },
};

export function SectionCard({ arrangement, section, ctx, notation, writtenKey }: {
  arrangement: Arrangement;
  section: SongSection;
  ctx: KeyContext;
  notation: Notation;
  writtenKey: string | null;
}) {
  const [showSource, setShowSource] = useState(false);
  const target = resolveSection(arrangement, section);
  const key = sectionKey(ctx, section);
  const progression = section.progression || target?.progression || '';
  const modulates = !!section.key && section.key !== writtenKey;
  const style = KIND_STYLE[section.kind];

  return (
    <section id={`sec-${section.id}`} className="card scroll-mt-36 p-4 sm:p-5 animate-fade-up">
      <header className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
        <h3 className="font-semibold">{section.name}</h3>
        {section.lyricCue && section.kind !== 'cue' && <span className="text-sm italic text-muted">“{section.lyricCue}”</span>}
        {section.kind === 'cue' && <span className="text-xs text-faint">lyric cue</span>}
        {modulates && key && (
          <span className="rounded-md border border-accent/40 px-1.5 text-xs font-semibold text-accent">Key change · {keyToString(key)}</span>
        )}
        <span className="ml-auto text-xs text-faint">p. {section.page}</span>
      </header>

      {target && (
        <p className="mb-2 text-sm text-muted">
          Same as <a href={`#sec-${target.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${target.id}`)?.scrollIntoView({ behavior: 'smooth' }); }} className="font-medium text-ink underline decoration-line underline-offset-2">{target.name}</a>
          {modulates && key ? `, played in ${keyToString(key)}` : ''}
        </p>
      )}

      {progression && <Progression text={progression} keyCtx={key} notation={notation} />}

      {section.melody && (
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-faint">Melody</span>
          <span className="font-semibold tabular-nums tracking-wide text-chord">
            {notation !== 'nns' && key ? renderMelody(section.melody, key) : section.melody}
          </span>
          {notation === 'both' && key && <span className="text-xs text-faint">({section.melody})</span>}
        </div>
      )}

      {!progression && !section.melody && !target && <p className="text-sm italic text-faint">No progression written in the PDF.</p>}

      {section.instructions?.length ? (
        <ul className="mt-3 space-y-1 border-l-2 border-accent/50 pl-3 text-sm text-ink/85">
          {section.instructions.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      ) : null}

      {section.flags?.length ? <div className="mt-3"><FlagList flags={section.flags} /></div> : null}

      <button onClick={() => setShowSource((s) => !s)} className="mt-3 inline-flex items-center gap-1 text-xs text-faint hover:text-muted" aria-expanded={showSource}>
        <Icon name="file" size={13} /> {showSource ? 'Hide' : 'Show'} PDF text
      </button>
      {showSource && (
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-sunken px-3 py-2 font-sans text-xs text-muted">{section.source}</pre>
      )}
    </section>
  );
}
