import type { Song, SongSection } from '../data/types';

/**
 * Chord changes made in the app to a song from the PDF.
 *
 * Only what changed is stored, keyed by arrangement and section id, so the
 * PDF text, page numbers and flags stay as they are and a later rebuild of
 * the library keeps the edits. Progressions are kept exactly as typed, in the
 * band's notation ("6#", "2,3", "4/5", "|" ...).
 */
export interface ChordEdits {
  arrangements: Record<string, {
    /** Key the numbers are in, when it was changed. */
    key?: string;
    /** Section id → progression as typed. An empty string clears the PDF progression. */
    sections: Record<string, string>;
  }>;
  editedAt: string;
}

/** Shown next to an edited section so the band can see what the PDF had. */
export interface SectionEdit {
  original: string;
}

/**
 * Band chord edits are saved as a band song row with the same id as the PDF
 * song. Older copies of the app skip rows whose id matches a PDF song, so
 * they simply keep showing the PDF chords instead of breaking.
 */
export function isChordEditRecord(s: Song): s is Song & { chordEdits: ChordEdits } {
  const e = (s as { chordEdits?: unknown }).chordEdits;
  return !!e && typeof e === 'object' && typeof (e as ChordEdits).arrangements === 'object';
}

export function chordEditRecord(song: Song, edits: ChordEdits): Song & { chordEdits: ChordEdits } {
  return { id: song.id, title: song.title, collection: song.collection, sourcePages: song.sourcePages, arrangements: [], chordEdits: edits };
}

export function hasEdits(e: ChordEdits | null | undefined): e is ChordEdits {
  return !!e && Object.values(e.arrangements).some((a) => a.key !== undefined || Object.keys(a.sections).length > 0);
}

/** The song with the edits applied. Sections or arrangements that no longer exist are ignored. */
export function applyChordEdits(song: Song, edits: ChordEdits | null | undefined, by: 'band' | 'device'): Song {
  if (!hasEdits(edits)) return song;
  let touched = false;
  const arrangements = song.arrangements.map((a) => {
    const ae = edits.arrangements[a.id];
    if (!ae) return a;
    const sections = a.sections.map((s): SongSection => {
      if (!Object.prototype.hasOwnProperty.call(ae.sections, s.id)) return s;
      const next = ae.sections[s.id].trim();
      if (next === (s.progression ?? '')) return s;
      touched = true;
      const prev = s.edited?.original ?? s.progression ?? '';
      const { progression: _drop, ...rest } = s;
      return { ...rest, ...(next ? { progression: next } : {}), edited: { original: prev, by } };
    });
    const key = ae.key !== undefined && ae.key !== (a.originalKey ?? '') ? ae.key : undefined;
    if (key !== undefined) touched = true;
    return {
      ...a,
      sections,
      ...(key !== undefined ? { originalKey: key || null, keyEdited: { original: a.keyEdited?.original ?? a.originalKey, by } } : {}),
    };
  });
  return touched ? { ...song, arrangements, chordsEdited: { by, at: edits.editedAt } } : song;
}

/** Compare what's on screen in the editor with the PDF song and keep only the differences. */
export function diffChordEdits(original: Song, draft: Record<string, { key: string; sections: Record<string, string> }>, now = new Date().toISOString()): ChordEdits {
  const arrangements: ChordEdits['arrangements'] = {};
  for (const a of original.arrangements) {
    const d = draft[a.id];
    if (!d) continue;
    const sections: Record<string, string> = {};
    for (const s of a.sections) {
      if (!(s.id in d.sections)) continue;
      const typed = d.sections[s.id].trim();
      if (typed !== (s.progression ?? '').trim()) sections[s.id] = typed;
    }
    const key = d.key !== (a.originalKey ?? '') ? d.key : undefined;
    if (key !== undefined || Object.keys(sections).length) arrangements[a.id] = { ...(key !== undefined ? { key } : {}), sections };
  }
  return { arrangements, editedAt: now };
}
