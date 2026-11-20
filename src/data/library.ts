import { Key, parseKey, semitonesBetween, transposeKey } from '../music';
import type { Arrangement, Library, Song, SongSection } from './types';

/** Lower-case, strip punctuation and accents so "You’re" matches "youre". */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9#]+/g, ' ')
    .trim();
}

export function songKeys(song: Song): string[] {
  const keys = new Set<string>();
  for (const a of song.arrangements) {
    if (a.originalKey) keys.add(a.originalKey);
    a.keyOptions?.forEach((o) => keys.add(o.key));
    a.sections.forEach((s) => s.key && keys.add(s.key));
  }
  return [...keys];
}

export function songMusicians(song: Song): string[] {
  return [...new Set(song.arrangements.flatMap((a) => a.musicians))];
}

export function allMusicians(lib: Library): string[] {
  return [...new Set(lib.songs.flatMap(songMusicians))].sort();
}

/** Keys that appear as an arrangement's original key or key option, in circle-of-fifths-ish chromatic order. */
export function allOriginalKeys(lib: Library): string[] {
  const order = ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'Ab', 'A', 'Bb', 'B'];
  const set = new Set<string>();
  lib.songs.forEach((s) => s.arrangements.forEach((a) => {
    if (a.originalKey) set.add(a.originalKey);
    a.keyOptions?.forEach((o) => set.add(o.key));
  }));
  return [...set].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export interface SongFilter {
  query?: string;
  key?: string | 'none';
  musician?: string;
  collection?: string;
}

export function searchSongs(songs: Song[], f: SongFilter): Song[] {
  const q = f.query ? normalise(f.query) : '';
  const terms = q ? q.split(' ') : [];
  return songs.filter((song) => {
    if (terms.length) {
      const hay = normalise([song.title, ...(song.aliases ?? [])].join(' '));
      const hayCues = normalise(song.arrangements.flatMap((a) => a.sections.map((s) => s.lyricCue ?? '')).join(' '));
      if (!terms.every((t) => hay.includes(t) || hayCues.includes(t))) return false;
    }
    if (f.key === 'none') {
      if (song.arrangements.some((a) => a.originalKey || a.keyOptions?.length)) return false;
    } else if (f.key && !songKeys(song).includes(f.key)) return false;
    if (f.musician && !songMusicians(song).includes(f.musician)) return false;
    if (f.collection && song.collection !== f.collection) return false;
    return true;
  });
}

/** Sort with title matches before lyric-cue matches, then alphabetically. */
export function rankSongs(songs: Song[], query: string): Song[] {
  const q = normalise(query);
  const score = (s: Song) => {
    const t = normalise(s.title);
    if (!q) return 0;
    if (t === q) return 0;
    if (t.startsWith(q)) return 1;
    if (t.includes(q)) return 2;
    return 3;
  };
  return [...songs].sort((a, b) => score(a) - score(b) || sortTitle(a.title).localeCompare(sortTitle(b.title)));
}

/** "The Reason" sorts under R. */
export function sortTitle(title: string): string {
  return normalise(title).replace(/^(the|a|an) /, '');
}

export function groupAlphabetically(songs: Song[]): [string, Song[]][] {
  const groups = new Map<string, Song[]>();
  for (const s of [...songs].sort((a, b) => sortTitle(a.title).localeCompare(sortTitle(b.title)))) {
    const letter = sortTitle(s.title).charAt(0).toUpperCase() || '#';
    const l = /[A-Z]/.test(letter) ? letter : '#';
    groups.set(l, [...(groups.get(l) ?? []), s]);
  }
  return [...groups.entries()];
}

export function findSong(lib: Library, id: string): Song | undefined {
  return lib.songs.find((s) => s.id === id);
}

export function findArrangement(song: Song, id?: string | null): Arrangement {
  return song.arrangements.find((a) => a.id === id) ?? song.arrangements[0];
}

/** If a section only says "Interlude: Intro", return the section it points to. */
export function resolveSection(arr: Arrangement, section: SongSection): SongSection | undefined {
  return section.refersTo ? arr.sections.find((s) => s.id === section.refersTo) : undefined;
}

/** The progression to play for a section, following "same as Intro" references. */
export function playableProgression(arr: Arrangement, section: SongSection): string {
  if (section.progression) return section.progression;
  const target = resolveSection(arr, section);
  return target?.progression ?? '';
}

/**
 * Keys in play for an arrangement at a chosen performance key.
 *
 * `shift` is the number of semitones from the written key to the chosen key.
 * A section that modulates (key: "G" in a song written in F) moves by the
 * same amount, so the relationship between sections is preserved.
 */
export interface KeyContext {
  /** Key the arrangement is written in, or null if the PDF gives none. */
  written: Key | null;
  /** Key the user is viewing in (may equal written). null = no key chosen. */
  viewing: Key | null;
  shift: number;
}

export function keyContext(arr: Arrangement, chosenKey?: string | null): KeyContext {
  const written = parseKey(arr.originalKey);
  const chosen = parseKey(chosenKey ?? undefined);
  if (written && chosen) return { written, viewing: chosen, shift: semitonesBetween(written, chosen) };
  if (written) return { written, viewing: written, shift: 0 };
  // No written key: the user's chosen key becomes the reference for the numbers.
  return { written: null, viewing: chosen, shift: 0 };
}

export function sectionKey(ctx: KeyContext, section: SongSection): Key | null {
  const own = parseKey(section.key);
  if (own) return ctx.written ? transposeKey(own, ctx.shift) : own;
  return ctx.viewing;
}

export function arrangementFlags(arr: Arrangement): string[] {
  return [...(arr.flags ?? []), ...arr.sections.flatMap((s) => (s.flags ?? []).map((f) => `${s.name}: ${f}`))];
}

export function songFlagCount(song: Song): number {
  return (song.flags?.length ?? 0) + song.arrangements.reduce((n, a) => n + arrangementFlags(a).length, 0);
}

/** Label for an arrangement tab. */
export function arrangementLabel(arr: Arrangement, index: number): string {
  return arr.label || (index === 0 ? 'Main' : `Arrangement ${index + 1}`);
}
