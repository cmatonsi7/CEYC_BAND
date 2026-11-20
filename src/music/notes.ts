/**
 * Pitch and note-spelling primitives.
 *
 * Notes are spelled by letter + accidental so that scale degrees keep the
 * correct letter name (e.g. degree 7 of F# major is E#, not F). Pitch classes
 * are only used for interval arithmetic, never for naming.
 */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export type Letter = (typeof LETTERS)[number];

/** Pitch class of each natural letter (C = 0). */
const LETTER_PC: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export interface Note {
  letter: Letter;
  /** -2 = double flat, -1 = flat, 0 = natural, 1 = sharp, 2 = double sharp */
  accidental: number;
}

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export function pitchClass(note: Note): number {
  return mod(LETTER_PC[note.letter] + note.accidental, 12);
}

export function letterIndex(letter: Letter): number {
  return LETTERS.indexOf(letter);
}

export function letterPc(letter: Letter): number {
  return LETTER_PC[letter];
}

const NOTE_RE = /^([A-Ga-g])(##|bb|#|b|♯|♭|x)?/;

/** Parse a note name at the start of a string. Returns the note and the number of characters consumed. */
export function parseNotePrefix(input: string): { note: Note; length: number } | null {
  const m = NOTE_RE.exec(input);
  if (!m) return null;
  const letter = m[1].toUpperCase() as Letter;
  const acc = m[2] ?? '';
  const accidental =
    acc === '#' || acc === '♯' ? 1 : acc === 'b' || acc === '♭' ? -1 : acc === '##' || acc === 'x' ? 2 : acc === 'bb' ? -2 : 0;
  return { note: { letter, accidental }, length: m[0].length };
}

export function parseNote(input: string): Note | null {
  const r = parseNotePrefix(input.trim());
  if (!r || r.length !== input.trim().length) return null;
  return r.note;
}

export function accidentalString(acc: number): string {
  if (acc === 0) return '';
  if (acc === 1) return '#';
  if (acc === -1) return 'b';
  if (acc === 2) return '##';
  if (acc === -2) return 'bb';
  return acc > 0 ? '#'.repeat(acc) : 'b'.repeat(-acc);
}

export function noteToString(note: Note): string {
  return note.letter + accidentalString(note.accidental);
}

/** Respell a note with at most one accidental, preferring sharps or flats. */
export function simplifyNote(note: Note, preferFlats: boolean): Note {
  if (Math.abs(note.accidental) <= 1) return note;
  return spellPitchClass(pitchClass(note), preferFlats);
}

const SHARP_NAMES: Note[] = [
  { letter: 'C', accidental: 0 }, { letter: 'C', accidental: 1 }, { letter: 'D', accidental: 0 },
  { letter: 'D', accidental: 1 }, { letter: 'E', accidental: 0 }, { letter: 'F', accidental: 0 },
  { letter: 'F', accidental: 1 }, { letter: 'G', accidental: 0 }, { letter: 'G', accidental: 1 },
  { letter: 'A', accidental: 0 }, { letter: 'A', accidental: 1 }, { letter: 'B', accidental: 0 },
];
const FLAT_NAMES: Note[] = [
  { letter: 'C', accidental: 0 }, { letter: 'D', accidental: -1 }, { letter: 'D', accidental: 0 },
  { letter: 'E', accidental: -1 }, { letter: 'E', accidental: 0 }, { letter: 'F', accidental: 0 },
  { letter: 'G', accidental: -1 }, { letter: 'G', accidental: 0 }, { letter: 'A', accidental: -1 },
  { letter: 'A', accidental: 0 }, { letter: 'B', accidental: -1 }, { letter: 'B', accidental: 0 },
];

export function spellPitchClass(pc: number, preferFlats: boolean): Note {
  return (preferFlats ? FLAT_NAMES : SHARP_NAMES)[mod(pc, 12)];
}

/**
 * Spell the note that lies `letterSteps` letters and `semitones` semitones
 * above `from`. Interval-correct: a major third above D is F#, above Db is F.
 */
export function noteAbove(from: Note, letterSteps: number, semitones: number): Note {
  const letter = LETTERS[mod(letterIndex(from.letter) + letterSteps, 7)];
  const targetPc = mod(pitchClass(from) + semitones, 12);
  let accidental = targetPc - LETTER_PC[letter];
  if (accidental > 6) accidental -= 12;
  if (accidental < -6) accidental += 12;
  return { letter, accidental };
}
