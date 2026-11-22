/**
 * Music library data model.
 *
 * Song → Arrangement → SongSection. Service accompaniment is kept separate
 * because it isn't tied to a song. Every section keeps `source`, the text
 * exactly as it appears in the PDF, next to the normalised `progression`.
 */

export type SectionKind =
  | 'intro' | 'verse' | 'prechorus' | 'chorus' | 'bridge' | 'interlude' | 'outro'
  | 'melody' | 'cue' | 'correction' | 'other';

export interface SongSection {
  id: string;
  /** Display name, e.g. "Pre-Chorus", "Verse (F#)". */
  name: string;
  kind: SectionKind;
  /** The label as written in the PDF when it differs from `name` (e.g. "Bride"). */
  sourceLabel?: string;
  /** Lyric cue the band uses to find their place, e.g. "Lord Jesus you reign". */
  lyricCue?: string;
  /** Number-system progression in the band's notation (see src/music/progression.ts). */
  progression?: string;
  /** Melody line as scale degrees, e.g. "2,3,2,1,1". */
  melody?: string;
  /** Key this section's numbers are relative to, when it differs from the arrangement key (modulation). */
  key?: string;
  /** This section repeats another section of the same arrangement (e.g. "Interlude: Intro"). */
  refersTo?: string;
  instructions?: string[];
  /** Ambiguities to check against the PDF. */
  flags?: string[];
  /** Verbatim source text from the PDF. */
  source: string;
  /** PDF page number. 0 for sections of songs added in the app. */
  page: number;
}

export interface KeyOption {
  key: string;
  /** Who plays it there, or "LW key" / "Original". */
  label: string;
}

export interface Arrangement {
  id: string;
  /** Short label: the musician, or "Version 1 (page 4)". Empty for a song's only arrangement. */
  label: string;
  musicians: string[];
  /** The key the numbers are written against. null when the PDF gives none. */
  originalKey: string | null;
  /** The key line exactly as written in the PDF. */
  keyText: string;
  /** Other keys listed for the same progression (e.g. Beautiful: Eb Busi / E Tawa). */
  keyOptions?: KeyOption[];
  sourcePages: number[];
  sections: SongSection[];
  performanceNotes?: string[];
  modulationNotes?: string[];
  flags?: string[];
}

/** 'Band additions' and 'My songs' are songs added in the app, not in the PDF. */
export type SongCollection = 'Song List' | 'Today’s Songs' | 'Band additions' | 'My songs';

export interface Song {
  id: string;
  title: string;
  aliases?: string[];
  /** The heading the song sits under in the PDF. */
  collection: SongCollection;
  sourcePages: number[];
  arrangements: Arrangement[];
  flags?: string[];
}

export interface AccompanimentItem {
  id: string;
  title: string;
  kind: 'prayer' | 'offering' | 'reference';
  page: number;
  key: string | null;
  progression: string;
  source: string;
  reference?: { label: string; url: string };
  notes: string[];
  flags: string[];
}

export interface Library {
  version: number;
  source: { title: string; file: string; pages: number };
  songs: Song[];
  accompaniment: AccompanimentItem[];
}

// ---- User data (stored locally) ----

/** nns = number degrees, chords = chord names, both = chord names with the degree under each. */
export type Notation = 'nns' | 'chords' | 'both';

export interface SetlistSong {
  /** Unique within the setlist so the same song can appear twice. */
  uid: string;
  songId: string;
  arrangementId: string;
  performanceKey?: string;
  notes?: string;
}

export interface Setlist {
  id: string;
  name: string;
  date?: string;
  songs: SetlistSong[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  notation: Notation;
  theme: 'system' | 'light' | 'dark';
  performanceFontScale: number;
  keepScreenOn: boolean;
}

export interface UserData {
  version: 1;
  favourites: string[];
  recent: { songId: string; at: string }[];
  /** keyed by arrangement id */
  notes: Record<string, string>;
  /** keyed by arrangement id */
  preferredKeys: Record<string, string>;
  /** keyed by song id */
  preferredArrangements: Record<string, string>;
  setlists: Setlist[];
  /** Songs added on this device only (not in the PDF, not shared with the band). */
  customSongs: Song[];
  settings: Settings;
}
