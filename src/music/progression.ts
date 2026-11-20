import { NUMBER_CHORD_SOURCE, NumberChord, RenderedChord, parseNumberChord, renderNumberChord } from './chords';
import { Key, parseKey, transposeKey } from './keys';

/**
 * Tokeniser for progressions written the way this band writes them:
 *
 *   "1 - 4 - 1 - 4 - 1 - 2 - 5 (3 - 4 - 5)"
 *   "[4 - 6 - 5] x 4"     "1 - 2,3 - 4"     "5 - 5# - 6"     "4min - 1 (7,3)"
 *
 * Nothing is thrown away: anything that isn't a chord is kept as text or
 * punctuation so the original instruction still reads correctly.
 */

export type Token =
  | { kind: 'chord'; raw: string; chord: NumberChord }
  /**
   * Passing chord(s) into a target, written "2,3" (no space): 2 is played as a
   * passing chord on the way to 3. In "2,3,4,5" the last number is the target.
   */
  | { kind: 'passing'; raw: string; chords: { raw: string; chord: NumberChord }[] }
  /** Either chord, written "1~6" in normalised data (the PDF's "1/6 (1 on the first one, 6 for the remaining)"). */
  | { kind: 'alt'; raw: string; chords: { raw: string; chord: NumberChord }[] }
  | { kind: 'sep'; raw: string }
  | { kind: 'comma'; raw: string }
  | { kind: 'open'; raw: string }
  | { kind: 'close'; raw: string }
  | { kind: 'repeat'; raw: string; times?: number }
  | { kind: 'arrow'; raw: string }
  | { kind: 'hold'; raw: string }
  /** Inline key change, written "{key:G}" in normalised data. */
  | { kind: 'key'; raw: string; key: Key }
  | { kind: 'newline'; raw: string }
  | { kind: 'text'; raw: string };

const CHORD = NUMBER_CHORD_SOURCE;
const BOUNDARY = '(?![0-9A-Za-z#♯])';

const RULES: Array<[RegExp, (m: RegExpExecArray) => Token]> = [
  [/\n/y, (m) => ({ kind: 'newline', raw: m[0] })],
  [/[ \t​ ]+/y, () => ({ kind: 'text', raw: ' ' })], // whitespace, dropped below
  [/\{key:([^}]+)\}/y, (m) => {
    const key = parseKey(m[1]);
    return key ? { kind: 'key', raw: m[0], key } : { kind: 'text', raw: m[0] };
  }],
  [/(?:——>|—>|-->|->|→|=>)/y, (m) => ({ kind: 'arrow', raw: m[0] })],
  [/(?:…+\.*|\.{2,})/y, (m) => ({ kind: 'hold', raw: m[0] })],
  [/[xX*×]\s?(\d+)(?![0-9])/y, (m) => ({ kind: 'repeat', raw: m[0], times: Number(m[1]) })],
  [new RegExp(`${CHORD}(?:,${CHORD})+${BOUNDARY}`, 'y'), (m) => splitGroup(m[0], ',', 'passing')],
  [new RegExp(`${CHORD}(?:~${CHORD})+${BOUNDARY}`, 'y'), (m) => splitGroup(m[0], '~', 'alt')],
  [new RegExp(`${CHORD}${BOUNDARY}`, 'y'), (m) => {
    const chord = parseNumberChord(m[0]);
    return chord ? { kind: 'chord', raw: m[0], chord } : { kind: 'text', raw: m[0] };
  }],
  [/[-–—]+/y, (m) => ({ kind: 'sep', raw: m[0] })],
  [/,/y, (m) => ({ kind: 'comma', raw: m[0] })],
  [/[[(]/y, (m) => ({ kind: 'open', raw: m[0] })],
  [/[\])]/y, (m) => ({ kind: 'close', raw: m[0] })],
  [/[^\s\-–—,[\]()→…{]+/y, (m) => ({ kind: 'text', raw: m[0] })],
];

function splitGroup(raw: string, sep: string, kind: 'passing' | 'alt'): Token {
  const chords = raw.split(sep).map((r) => ({ raw: r, chord: parseNumberChord(r) }));
  if (chords.some((c) => !c.chord)) return { kind: 'text', raw };
  return { kind, raw, chords: chords as { raw: string; chord: NumberChord }[] };
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  outer: while (i < input.length) {
    for (const [re, make] of RULES) {
      re.lastIndex = i;
      const m = re.exec(input);
      if (m && m[0].length > 0) {
        const t = make(m);
        // Whitespace only matters inside text runs; keep a single space marker.
        if (!(t.kind === 'text' && t.raw === ' ')) tokens.push(t);
        else if (tokens.length && tokens[tokens.length - 1].kind === 'text') tokens.push(t);
        i += m[0].length;
        continue outer;
      }
    }
    tokens.push({ kind: 'text', raw: input[i] });
    i += 1;
  }
  // Merge adjacent text tokens ("BACK", " ", "TO", " ", "VERSE") into one.
  const merged: Token[] = [];
  for (const t of tokens) {
    const prev = merged[merged.length - 1];
    if (t.kind === 'text' && prev?.kind === 'text') prev.raw += t.raw;
    else merged.push(t.kind === 'text' ? { ...t } : t);
  }
  return merged
    .map((t) => (t.kind === 'text' ? { ...t, raw: t.raw.trim() } : t))
    .filter((t) => !(t.kind === 'text' && t.raw === ''));
}

/** A token prepared for display in a given notation. */
export type DisplayToken =
  | { kind: 'chord'; nns: string; chord: RenderedChord | null; key: Key | null }
  | { kind: 'passing'; parts: { nns: string; chord: RenderedChord | null }[]; key: Key | null }
  | { kind: 'alt'; parts: { nns: string; chord: RenderedChord | null }[]; key: Key | null }
  | { kind: 'key'; key: Key; label: string }
  | { kind: Exclude<Token['kind'], 'chord' | 'passing' | 'alt' | 'key'>; raw: string };

/**
 * Resolve tokens against a key. Inline {key:X} markers change the key for the
 * chords that follow; they are themselves transposed by `shift` semitones so a
 * song with a modulation keeps its shape when the whole song is moved.
 */
export function resolveTokens(tokens: Token[], key: Key | null, shift = 0): DisplayToken[] {
  let current = key;
  const out: DisplayToken[] = [];
  for (const t of tokens) {
    switch (t.kind) {
      case 'chord':
        out.push({ kind: 'chord', nns: t.raw, chord: current ? renderNumberChord(t.chord, current) : null, key: current });
        break;
      case 'passing':
      case 'alt':
        out.push({
          kind: t.kind as 'passing',
          parts: t.chords.map((c) => ({ nns: c.raw, chord: current ? renderNumberChord(c.chord, current) : null })),
          key: current,
        });
        break;
      case 'key': {
        current = transposeKey(t.key, shift);
        out.push({ kind: 'key', key: current, label: t.raw });
        break;
      }
      default:
        out.push({ kind: t.kind, raw: t.raw });
    }
  }
  return out;
}

/** Plain-text rendering, mainly for tests and copy/paste. */
export function renderProgression(input: string, key: Key | null, mode: 'nns' | 'chords', shift = 0): string {
  const parts: string[] = [];
  for (const t of resolveTokens(tokenize(input), key, shift)) {
    if (t.kind === 'chord') parts.push(mode === 'chords' && t.chord ? t.chord.name : t.nns);
    else if (t.kind === 'passing') parts.push(t.parts.map((p) => (mode === 'chords' && p.chord ? p.chord.name : p.nns)).join(','));
    else if (t.kind === 'alt') parts.push(t.parts.map((p) => (mode === 'chords' && p.chord ? p.chord.name : p.nns)).join(' or '));
    else if (t.kind === 'key') parts.push(`[Key: ${keyLabel(t.key)}]`);
    else if (t.kind === 'sep') parts.push('-');
    else if (t.kind === 'newline') parts.push('\n');
    else parts.push(t.raw);
  }
  return parts.join(' ').replace(/ \n /g, '\n').replace(/ ,/g, ',').replace(/\( /g, '(').replace(/ \)/g, ')').replace(/\[ /g, '[').replace(/ \]/g, ']');
}

function keyLabel(k: Key): string {
  return k.tonic.letter + (k.tonic.accidental > 0 ? '#' : k.tonic.accidental < 0 ? 'b' : '') + (k.mode === 'minor' ? 'm' : '');
}

/** Count chords in a progression (used for search/summary). */
export function chordCount(input: string): number {
  return tokenize(input).reduce((n, t) => n + (t.kind === 'chord' ? 1 : t.kind === 'passing' || t.kind === 'alt' ? t.chords.length : 0), 0);
}
