import { Fragment, useMemo } from 'react';
import { type DisplayToken, type Key, keyToString, resolveTokens, tokenize } from '../music';
import type { Notation } from '../data/types';

/**
 * Renders a progression in number or chord notation. The tokenizer keeps
 * every bracket, repeat and cue, so nothing written in the PDF disappears.
 */
export function Progression({ text, keyCtx, notation, shift = 0, size = 'md' }: {
  text: string;
  keyCtx: Key | null;
  notation: Notation;
  shift?: number;
  size?: 'md' | 'lg' | 'stage';
}) {
  const tokens = useMemo(() => resolveTokens(tokenize(text), keyCtx, shift), [text, keyCtx, shift]);
  const showChords = notation === 'chords' && keyCtx !== null;
  const lines = useMemo(() => splitLines(tokens), [tokens]);

  const sizes = {
    md: 'text-[1.0625rem] gap-x-1.5 gap-y-1.5',
    lg: 'text-xl gap-x-2 gap-y-2',
    stage: 'gap-x-[0.35em] gap-y-[0.3em]',
  }[size];

  return (
    <div className={`space-y-1.5 ${size === 'stage' ? 'space-y-[0.35em]' : ''}`}>
      {lines.map((line, li) => (
        <div key={li} className={`flex flex-wrap items-baseline leading-snug ${sizes}`}>
          {line.map((t, i) => (
            <Fragment key={i}>{renderToken(t, showChords)}</Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

function splitLines(tokens: DisplayToken[]): DisplayToken[][] {
  const lines: DisplayToken[][] = [[]];
  for (const t of tokens) {
    if (t.kind === 'newline') lines.push([]);
    else lines[lines.length - 1].push(t);
  }
  return lines.filter((l) => l.length);
}

function ChordText({ nns, name, uncertain, showChords }: { nns: string; name?: string; uncertain?: boolean; showChords: boolean }) {
  if (!showChords || !name) {
    return <span className="font-semibold tabular-nums text-chord">{nns}</span>;
  }
  return (
    <span
      className="font-semibold text-chord"
      title={uncertain ? `${nns}: chord quality isn't written in the PDF, so only the root is shown` : nns}
    >
      {name}
      {uncertain && <sup className="ml-px text-[0.6em] font-bold text-warn">?</sup>}
    </span>
  );
}

function renderToken(t: DisplayToken, showChords: boolean) {
  switch (t.kind) {
    case 'chord':
      return <ChordText nns={t.nns} name={t.chord?.name} uncertain={t.chord?.uncertain} showChords={showChords} />;
    case 'split':
      return (
        <span className="inline-flex items-baseline rounded-md bg-sunken px-1.5" title="Split bar">
          {t.parts.map((p, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="px-0.5 text-faint">,</span>}
              <ChordText nns={p.nns} name={p.chord?.name} uncertain={p.chord?.uncertain} showChords={showChords} />
            </Fragment>
          ))}
        </span>
      );
    case 'alt':
      return (
        <span className="inline-flex items-baseline gap-1">
          {t.parts.map((p, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="text-[0.75em] text-muted">or</span>}
              <ChordText nns={p.nns} name={p.chord?.name} uncertain={p.chord?.uncertain} showChords={showChords} />
            </Fragment>
          ))}
        </span>
      );
    case 'key':
      return (
        <span className="rounded-md border border-accent/40 px-1.5 text-[0.75em] font-semibold text-accent">Key {keyToString(t.key)}</span>
      );
    case 'sep':
      return <span className="select-none text-faint" aria-hidden>–</span>;
    case 'comma':
      return <span className="-ml-1 select-none text-faint">,</span>;
    case 'open':
    case 'close':
      return <span className="text-muted">{t.raw}</span>;
    case 'repeat':
      return <span className="rounded-md bg-ink px-1.5 text-[0.8em] font-semibold text-bg">{t.raw.replace(/\s+/g, '')}</span>;
    case 'arrow':
      return <span className="text-accent">→</span>;
    case 'hold':
      return <span className="text-muted">…</span>;
    case 'text':
      return <span className="text-[0.8em] italic text-muted">{t.raw}</span>;
    default:
      return null;
  }
}
