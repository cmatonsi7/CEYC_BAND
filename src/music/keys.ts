import { Note, mod, noteAbove, noteToString, parseNotePrefix, pitchClass, spellPitchClass } from './notes';

export type Mode = 'major' | 'minor';

export interface Key {
  tonic: Note;
  mode: Mode;
}

/** Semitone offsets of each scale degree (1–7). */
export const SCALE_INTERVALS: Record<Mode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

/** Default triad quality for each diatonic degree. */
export const DIATONIC_QUALITY: Record<Mode, ChordQualityName[]> = {
  major: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
  minor: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
};

export type ChordQualityName = 'maj' | 'min' | 'dim' | 'aug';

/** Parse "G", "F#", "Bb", "Am", "C# minor", "Eb major". */
export function parseKey(input: string | undefined | null): Key | null {
  if (!input) return null;
  const s = input.trim();
  const r = parseNotePrefix(s);
  if (!r) return null;
  const rest = s.slice(r.length).trim().toLowerCase();
  let mode: Mode;
  if (rest === '' || rest === 'maj' || rest === 'major' || rest === 'M') mode = 'major';
  else if (rest === 'm' || rest === 'min' || rest === 'minor' || rest === '-') mode = 'minor';
  else return null;
  return { tonic: r.note, mode };
}

export function keyToString(key: Key): string {
  return noteToString(key.tonic) + (key.mode === 'minor' ? 'm' : '');
}

export function keysEqual(a: Key, b: Key): boolean {
  return pitchClass(a.tonic) === pitchClass(b.tonic) && a.mode === b.mode;
}

/**
 * Conventional spellings for key centres, used when a transposition lands on
 * a pitch class. Chooses the spelling with the simplest key signature
 * (Db over C#, F# over Gb, Eb minor over D# minor...).
 */
const MAJOR_KEY_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEY_NAMES = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];

export function conventionalKey(pc: number, mode: Mode): Key {
  const names = mode === 'major' ? MAJOR_KEY_NAMES : MINOR_KEY_NAMES;
  return parseKey(names[mod(pc, 12)])!;
}

/** All twelve keys of a mode, for key pickers. */
export function allKeys(mode: Mode): Key[] {
  return Array.from({ length: 12 }, (_, pc) => conventionalKey(pc, mode));
}

/** Semitones from key a's tonic up to key b's tonic (0–11). */
export function semitonesBetween(a: Key, b: Key): number {
  return mod(pitchClass(b.tonic) - pitchClass(a.tonic), 12);
}

/** Transpose a key by semitones, respelling it conventionally. */
export function transposeKey(key: Key, semitones: number): Key {
  if (mod(semitones, 12) === 0) return key;
  return conventionalKey(pitchClass(key.tonic) + semitones, key.mode);
}

/** Whether a key's signature uses flats (affects chromatic spellings). */
export function keyPrefersFlats(key: Key): boolean {
  // Relative-major tonic decides the signature.
  const majorTonic = key.mode === 'minor' ? noteAbove(key.tonic, 2, 3) : key.tonic;
  if (majorTonic.accidental < 0) return true;
  if (majorTonic.accidental > 0) return false;
  return majorTonic.letter === 'F';
}

/** The note of a scale degree, with an optional chromatic alteration. */
export function degreeNote(key: Key, degree: number, alter = 0): Note {
  const step = degree - 1;
  const semis = SCALE_INTERVALS[key.mode][step] + alter;
  return noteAbove(key.tonic, step, semis);
}

export { spellPitchClass };
