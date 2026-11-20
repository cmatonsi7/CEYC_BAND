import { DIATONIC_QUALITY, Key, ChordQualityName, degreeNote, keyPrefersFlats } from './keys';
import { Note, noteToString, simplifyNote } from './notes';

/** A scale degree with an optional chromatic alteration (b7 = degree 7, alter -1). */
export interface Degree {
  degree: number; // 1–7
  alter: number; // -1, 0, +1
}

/**
 * A Nashville Number System chord, independent of key.
 * `quality` is only set when the source spells it out (m, min, maj, dim...).
 */
export interface NumberChord {
  root: Degree;
  quality?: ChordQualityName;
  /** Extensions / suspensions exactly as written: "7", "maj7", "sus4", "add9". */
  extension: string;
  bass?: Degree;
}

export interface RenderedChord {
  /** Display name, e.g. "F#m", "Bb/D", "D#". */
  name: string;
  root: Note;
  quality: ChordQualityName | 'unknown';
  /** True when the source does not specify enough to be sure of the quality. */
  uncertain: boolean;
}

const QUALITY_WORDS: Array<[RegExp, ChordQualityName]> = [
  [/^(min|mi|m|-)(?!aj)/, 'min'],
  [/^(maj|M)(?![0-9])/, 'maj'],
  [/^(dim|°|o)(?![a-z])/, 'dim'],
  [/^(aug|\+)/, 'aug'],
];

/**
 * Regex for one number-chord token. Accepts both prefix (#6, b7, ♭7) and the
 * postfix accidental this band uses (6#, 5#).
 * Groups: 1 prefix acc, 2 degree, 3 postfix acc, 4 suffix, 5 bass prefix, 6 bass degree, 7 bass postfix
 */
export const NUMBER_CHORD_SOURCE =
  '([#b♭♯]?)([1-7])([#♯]?)((?:maj7|maj9|maj|min7|min|m7b5|m7|m9|m|M|dim7|dim|°|aug|\\+|sus4|sus2|sus|add9|add2|add4|7|9|11|13)*)(?:\\/([#b♭♯]?)([1-7])([#♯]?))?';

const WHOLE = new RegExp(`^${NUMBER_CHORD_SOURCE}$`);

function accValue(prefix: string, postfix: string): number {
  const p = prefix === '#' || prefix === '♯' ? 1 : prefix === 'b' || prefix === '♭' ? -1 : 0;
  const q = postfix ? 1 : 0;
  return p + q;
}

/** Parse "6m", "#4dim", "5/7", "2maj", "4min", "b7", "6#". Returns null if not a chord. */
export function parseNumberChord(token: string): NumberChord | null {
  const m = WHOLE.exec(token);
  if (!m) return null;
  let suffix = m[4] ?? '';
  let quality: ChordQualityName | undefined;
  // Pull an explicit quality off the front of the suffix.
  if (suffix.startsWith('m7b5')) {
    quality = 'dim';
  } else {
    for (const [re, q] of QUALITY_WORDS) {
      const qm = re.exec(suffix);
      if (qm) {
        // "maj7" is an extension on a major chord, not a quality word followed by 7.
        if (q === 'maj' && /^maj[79]/.test(suffix)) break;
        quality = q;
        suffix = suffix.slice(qm[0].length);
        break;
      }
    }
  }
  const chord: NumberChord = {
    root: { degree: Number(m[2]), alter: accValue(m[1], m[3]) },
    extension: suffix,
  };
  if (quality) chord.quality = quality;
  if (m[6]) chord.bass = { degree: Number(m[6]), alter: accValue(m[5] ?? '', m[7] ?? '') };
  return chord;
}

const QUALITY_SUFFIX: Record<ChordQualityName, string> = { maj: '', min: 'm', dim: 'dim', aug: 'aug' };

function noteForDegree(key: Key, d: Degree): Note {
  return simplifyNote(degreeNote(key, d.degree, d.alter), keyPrefersFlats(key));
}

/**
 * Render a number chord as a letter-name chord in a key.
 *
 * Diatonic numbers take the key's natural triad quality (in a major key
 * 2, 3 and 6 are minor; 7 is diminished). Chromatic numbers (#5, b7) have no
 * natural quality, so unless the source spells one out the result is marked
 * uncertain and shows the root only.
 */
export function renderNumberChord(chord: NumberChord, key: Key): RenderedChord {
  const root = noteForDegree(key, chord.root);
  let quality: ChordQualityName | 'unknown';
  if (chord.quality) quality = chord.quality;
  else if (chord.root.alter === 0) quality = DIATONIC_QUALITY[key.mode][chord.root.degree - 1];
  else quality = 'unknown';

  let ext = chord.extension;
  let qualityText = quality === 'unknown' ? '' : QUALITY_SUFFIX[quality];
  // A diminished triad with a 7 written is a half-diminished chord (m7b5).
  if (quality === 'dim' && ext === '7' && !chord.quality) {
    qualityText = 'm7b5';
    ext = '';
  }
  let name = noteToString(root) + qualityText + ext;
  if (chord.bass) name += '/' + noteToString(noteForDegree(key, chord.bass));
  return { name, root, quality, uncertain: quality === 'unknown' };
}

/** Normalised NNS spelling (prefix accidentals), e.g. "6#" → "#6". */
export function numberChordToString(chord: NumberChord): string {
  const acc = (d: Degree) => (d.alter > 0 ? '#'.repeat(d.alter) : 'b'.repeat(-d.alter));
  const q = chord.quality === 'min' ? 'm' : chord.quality === 'maj' ? 'maj' : chord.quality === 'dim' ? 'dim' : chord.quality === 'aug' ? 'aug' : '';
  let s = acc(chord.root) + chord.root.degree + q + chord.extension;
  if (chord.bass) s += '/' + acc(chord.bass) + chord.bass.degree;
  return s;
}
