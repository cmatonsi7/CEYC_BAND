import { describe, expect, it } from 'vitest';
import {
  degreeNote, keyToString, noteToString, parseKey, parseNumberChord, renderNumberChord,
  renderProgression, semitonesBetween, tokenize, transposeKey, allKeys,
} from './index';

const k = (s: string) => parseKey(s)!;
const chords = (p: string, key: string, shift = 0) => renderProgression(p, k(key), 'chords', shift);

describe('keys', () => {
  it('parses keys', () => {
    expect(keyToString(k('F#'))).toBe('F#');
    expect(keyToString(k('Ab'))).toBe('Ab');
    expect(keyToString(k('C# minor'))).toBe('C#m');
    expect(parseKey('H')).toBeNull();
    expect(parseKey('')).toBeNull();
  });
  it('spells scale degrees by letter', () => {
    expect(noteToString(degreeNote(k('F#'), 7))).toBe('E#');
    expect(noteToString(degreeNote(k('Db'), 4))).toBe('Gb');
    expect(noteToString(degreeNote(k('A'), 3))).toBe('C#');
    expect(noteToString(degreeNote(k('C'), 7, -1))).toBe('Bb');
    expect(noteToString(degreeNote(k('Am'), 3))).toBe('C');
  });
  it('transposes keys with conventional spellings', () => {
    expect(keyToString(transposeKey(k('F'), 1))).toBe('F#');
    expect(keyToString(transposeKey(k('F'), 2))).toBe('G');
    expect(keyToString(transposeKey(k('C'), 1))).toBe('Db');
    expect(keyToString(transposeKey(k('G'), 1))).toBe('Ab');
    expect(keyToString(transposeKey(k('B'), 1))).toBe('C');
    expect(keyToString(transposeKey(k('Ab'), -1))).toBe('G');
    expect(semitonesBetween(k('F'), k('G'))).toBe(2);
    expect(semitonesBetween(k('G'), k('F'))).toBe(10);
  });
  it('lists twelve keys', () => {
    expect(allKeys('major').map(keyToString)).toEqual(['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
  });
});

describe('number chords', () => {
  it('parses the notations used in the PDF', () => {
    expect(parseNumberChord('6#')).toMatchObject({ root: { degree: 6, alter: 1 } });
    expect(parseNumberChord('#6')).toMatchObject({ root: { degree: 6, alter: 1 } });
    expect(parseNumberChord('♭7')).toMatchObject({ root: { degree: 7, alter: -1 } });
    expect(parseNumberChord('4min')).toMatchObject({ quality: 'min' });
    expect(parseNumberChord('4m')).toMatchObject({ quality: 'min' });
    expect(parseNumberChord('6m')).toMatchObject({ quality: 'min' });
    expect(parseNumberChord('3maj')).toMatchObject({ quality: 'maj' });
    expect(parseNumberChord('7maj')).toMatchObject({ root: { degree: 7 }, quality: 'maj' });
    expect(parseNumberChord('4maj7')).toMatchObject({ extension: 'maj7' });
    expect(parseNumberChord('5/4')).toMatchObject({ bass: { degree: 4, alter: 0 } });
    expect(parseNumberChord('8')).toBeNull();
    expect(parseNumberChord('hi')).toBeNull();
  });
  it('uses diatonic qualities by default', () => {
    const r = (t: string, key = 'A') => renderNumberChord(parseNumberChord(t)!, k(key)).name;
    expect(r('1')).toBe('A');
    expect(r('2')).toBe('Bm');
    expect(r('3')).toBe('C#m');
    expect(r('4')).toBe('D');
    expect(r('5')).toBe('E');
    expect(r('6')).toBe('F#m');
    expect(r('7')).toBe('G#dim');
    expect(r('3maj')).toBe('C#');
    expect(r('5min')).toBe('Em');
    expect(r('2m7')).toBe('Bm7');
    expect(r('57')).toBe('E7');
    expect(r('4maj7')).toBe('Dmaj7');
    expect(r('1/3')).toBe('A/C#');
    expect(r('6', 'Am')).toBe('F');
  });
  it('marks chromatic numbers without a written quality as uncertain', () => {
    const c = renderNumberChord(parseNumberChord('5#')!, k('G'));
    expect(c.name).toBe('D#');
    expect(c.uncertain).toBe(true);
    expect(renderNumberChord(parseNumberChord('b7')!, k('E')).name).toBe('D');
    expect(renderNumberChord(parseNumberChord('#4dim')!, k('C')).name).toBe('F#dim');
  });
  it('keeps chromatic spellings readable in flat and sharp keys', () => {
    expect(renderNumberChord(parseNumberChord('1#')!, k('G')).name).toBe('G#');
    expect(renderNumberChord(parseNumberChord('6#')!, k('F#')).name).toBe('E');
    expect(renderNumberChord(parseNumberChord('b5')!, k('Ab')).name).toBe('D');
    expect(renderNumberChord(parseNumberChord('#5')!, k('C#')).name).toBe('A');
  });
});

describe('progressions', () => {
  it('converts the brief example in A', () => {
    expect(chords('4 – 1 – 5 – 6 – 2 – 5 – 1', 'A')).toBe('D - A - E - F#m - Bm - E - A');
  });
  it('transposes across all twelve keys without text replacement', () => {
    const expected: Record<string, string> = {
      C: 'F - C - G - Am', Db: 'Gb - Db - Ab - Bbm', D: 'G - D - A - Bm', Eb: 'Ab - Eb - Bb - Cm',
      E: 'A - E - B - C#m', F: 'Bb - F - C - Dm', 'F#': 'B - F# - C# - D#m', G: 'C - G - D - Em',
      Ab: 'Db - Ab - Eb - Fm', A: 'D - A - E - F#m', Bb: 'Eb - Bb - F - Gm', B: 'E - B - F# - G#m',
    };
    for (const [key, out] of Object.entries(expected)) expect(chords('4 - 1 - 5 - 6', key)).toBe(out);
  });
  it('keeps the original numbers in number mode', () => {
    expect(renderProgression('1 - 6# - 4', k('C'), 'nns')).toBe('1 - 6# - 4');
  });
  it('handles passing chords, repeats, brackets and cues', () => {
    expect(chords('[4 - 6 - 5] x 4', 'Eb')).toBe('[Ab - Cm - Bb] x 4');
    expect(chords('1 - 2,3 - 4', 'F')).toBe('F - Gm,Am - Bb');
    expect(chords('4min - 1 (7,3)', 'C')).toBe('Fm - C (Bdim,Em)');
    expect(chords('4 - 2 - 1 - 6 - 5 → back to verse', 'G')).toBe('C - Am - G - Em - D → back to verse');
    expect(chords('6… 4', 'G')).toBe('Em … C');
    expect(chords('1~6 - 4', 'A')).toBe('A or F#m - D');
  });
  it('keeps unreadable runs as text instead of guessing', () => {
    const t = tokenize('4171');
    expect(t).toEqual([{ kind: 'text', raw: '4171' }]);
    expect(chords('1736:54', 'C')).toBe('1736:54');
  });
  it('follows inline key changes and shifts them with the song', () => {
    const p = '2 - 5 {key:G} 1 - 4';
    expect(chords(p, 'F')).toBe('Gm - C [Key: G] G - C');
    // Whole song up a tone: F→G and G→A.
    expect(chords(p, 'G', 2)).toBe('Am - D [Key: A] A - D');
  });
});

describe('passing chords', () => {
  it('reads "2,3" as 2 passing into 3, with the target last', () => {
    const t = tokenize('1 - 2,3 - 4');
    expect(t[2]).toMatchObject({ kind: 'passing', raw: '2,3' });
    const p = t[2] as Extract<typeof t[number], { kind: 'passing' }>;
    expect(p.chords.map((c) => c.raw)).toEqual(['2', '3']);
    expect(renderProgression('2,3,4,5 - 1', k('Ab'), 'chords')).toBe('Bbm,Cm,Db,Eb - Ab');
  });
  it('treats "6#" as 6 sharp', () => {
    expect(chords('1 - 6# - 4', 'C')).toBe('C - A# - F');
    expect(chords('1 - #6 - 4', 'C')).toBe('C - A# - F');
  });
  it('keeps a comma followed by a space as a phrase break, not a passing chord', () => {
    expect(tokenize('5 - 4 - 1, 5 - 4 - 1').filter((x) => x.kind === 'passing')).toHaveLength(0);
  });
});
