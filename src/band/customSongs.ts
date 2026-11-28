import { applyChordEdits, hasEdits, isChordEditRecord, type ChordEdits } from './chordEdits';
import type { Library, SectionKind, Song, SongCollection } from '../data/types';

/** What the "Add a song" form collects. Nothing is filled in for the user. */
export interface SongDraft {
  title: string;
  key: string;
  musician: string;
  notes: string;
  sections: { name: string; kind: SectionKind; progression: string; lyricCue: string }[];
}

export const ADDED_COLLECTIONS: SongCollection[] = ['Band additions', 'My songs'];

export function isAddedSong(song: Song): boolean {
  return ADDED_COLLECTIONS.includes(song.collection);
}

export function emptyDraft(): SongDraft {
  return { title: '', key: '', musician: '', notes: '', sections: [{ name: 'Verse', kind: 'verse', progression: '', lyricCue: '' }] };
}

function slug(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'song';
}

export function newSongId(title: string, rand = Math.random().toString(36).slice(2, 7)): string {
  return `added-${slug(title)}-${rand}`;
}

/** Turn the form into a Song. Sections are kept exactly as typed. */
export function draftToSong(draft: SongDraft, id: string, collection: SongCollection): Song {
  const key = draft.key.trim() || null;
  const musician = draft.musician.trim();
  const sections = draft.sections
    .filter((s) => s.name.trim() || s.progression.trim() || s.lyricCue.trim())
    .map((s, i) => {
      const progression = s.progression.trim();
      const cue = s.lyricCue.trim();
      return {
        id: `s${i + 1}`,
        name: s.name.trim() || `Section ${i + 1}`,
        kind: s.kind,
        ...(progression ? { progression } : {}),
        ...(cue ? { lyricCue: cue } : {}),
        source: [s.name.trim(), cue && `(${cue})`, progression].filter(Boolean).join(' '),
        page: 0,
      };
    });
  const notes = draft.notes.split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    id,
    title: draft.title.trim(),
    collection,
    sourcePages: [],
    arrangements: [{
      id: `${id}~1`,
      label: musician,
      musicians: musician ? [musician] : [],
      originalKey: key,
      keyText: key ?? '',
      sourcePages: [],
      sections,
      ...(notes.length ? { performanceNotes: notes } : {}),
    }],
  };
}

export function songToDraft(song: Song): SongDraft {
  const a = song.arrangements[0];
  return {
    title: song.title,
    key: a.originalKey ?? '',
    musician: a.musicians[0] ?? '',
    notes: (a.performanceNotes ?? []).join('\n'),
    sections: a.sections.map((s) => ({ name: s.name, kind: s.kind, progression: s.progression ?? '', lyricCue: s.lyricCue ?? '' })),
  };
}

/**
 * PDF songs (with any chord edits applied), then band additions, then this
 * device's own songs. Added songs never replace PDF songs. Chord edits made on
 * this device win over the band's for the same song.
 */
export function mergeLibrary(base: Library, band: Song[], mine: Song[], myEdits: Record<string, ChordEdits> = {}): Library {
  const bandEdits = new Map<string, ChordEdits>();
  for (const s of band) if (isChordEditRecord(s)) bandEdits.set(s.id, s.chordEdits);
  if (!band.length && !mine.length && !Object.keys(myEdits).length) return base;
  const songs = base.songs.map((s) => {
    const mineE = myEdits[s.id];
    if (hasEdits(mineE)) return applyChordEdits(s, mineE, 'device');
    return applyChordEdits(s, bandEdits.get(s.id), 'band');
  });
  const taken = new Set(base.songs.map((s) => s.id));
  const extra: Song[] = [];
  for (const s of band) if (!isChordEditRecord(s) && !taken.has(s.id)) { taken.add(s.id); extra.push({ ...s, collection: 'Band additions' }); }
  for (const s of mine) if (!taken.has(s.id)) { taken.add(s.id); extra.push({ ...s, collection: 'My songs' }); }
  return { ...base, songs: [...songs, ...extra] };
}

/** "PDF page 4", or "Added in the app" for songs that aren't in the PDF. */
export function pagesLabel(pages: number[]): string {
  const real = pages.filter((p) => p > 0);
  if (!real.length) return 'Added in the app';
  return `PDF page${real.length > 1 ? 's' : ''} ${real.join(', ')}`;
}
