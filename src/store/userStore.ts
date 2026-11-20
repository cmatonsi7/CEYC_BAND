import type { Setlist, SetlistSong, Settings, UserData } from '../data/types';

/**
 * Local-first storage for everything personal: favourites, notes, preferred
 * keys, setlists and settings. Backed by localStorage behind a small
 * interface so it can later sync to a backend.
 */
export interface UserStore {
  get(): UserData;
  update(fn: (d: UserData) => UserData): void;
  subscribe(listener: () => void): () => void;
}

export const STORAGE_KEY = 'ceyc-music-library:v1';

export const DEFAULT_SETTINGS: Settings = {
  notation: 'chords',
  theme: 'system',
  performanceFontScale: 1,
  keepScreenOn: true,
};

export function emptyUserData(): UserData {
  return {
    version: 1,
    favourites: [],
    recent: [],
    notes: {},
    preferredKeys: {},
    preferredArrangements: {},
    setlists: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Accept older or partial saves without crashing. */
export function migrate(raw: unknown): UserData {
  const base = emptyUserData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<UserData>;
  return {
    version: 1,
    favourites: Array.isArray(r.favourites) ? r.favourites.filter((x) => typeof x === 'string') : [],
    recent: Array.isArray(r.recent) ? r.recent.filter((x) => x && typeof x.songId === 'string') : [],
    notes: r.notes && typeof r.notes === 'object' ? r.notes : {},
    preferredKeys: r.preferredKeys && typeof r.preferredKeys === 'object' ? r.preferredKeys : {},
    preferredArrangements: r.preferredArrangements && typeof r.preferredArrangements === 'object' ? r.preferredArrangements : {},
    setlists: Array.isArray(r.setlists) ? r.setlists.filter((s) => s && typeof s.id === 'string' && Array.isArray(s.songs)) : [],
    settings: {
      ...base.settings,
      ...(r.settings ?? {}),
      notation: ['nns', 'chords', 'both'].includes(r.settings?.notation as string) ? r.settings!.notation : base.settings.notation,
    },
  };
}

interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export class LocalUserStore implements UserStore {
  private data: UserData;
  private listeners = new Set<() => void>();

  constructor(private readonly storage: StorageLike | null, private readonly key = STORAGE_KEY) {
    this.data = this.read();
  }

  private read(): UserData {
    try {
      const raw = this.storage?.getItem(this.key);
      return raw ? migrate(JSON.parse(raw)) : emptyUserData();
    } catch {
      return emptyUserData();
    }
  }

  get(): UserData {
    return this.data;
  }

  update(fn: (d: UserData) => UserData): void {
    this.data = fn(this.data);
    try {
      this.storage?.setItem(this.key, JSON.stringify(this.data));
    } catch {
      // Storage full or blocked (private mode): keep working in memory.
    }
    this.listeners.forEach((l) => l());
  }

  /** Pick up changes made in another tab. */
  reload(): void {
    this.data = this.read();
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// ---- Pure actions (unit-tested) ----

const now = () => new Date().toISOString();
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const actions = {
  toggleFavourite: (songId: string) => (d: UserData): UserData => ({
    ...d,
    favourites: d.favourites.includes(songId) ? d.favourites.filter((x) => x !== songId) : [songId, ...d.favourites],
  }),
  markViewed: (songId: string) => (d: UserData): UserData => ({
    ...d,
    recent: [{ songId, at: now() }, ...d.recent.filter((r) => r.songId !== songId)].slice(0, 20),
  }),
  setNote: (arrangementId: string, text: string) => (d: UserData): UserData => {
    const notes = { ...d.notes };
    if (text.trim()) notes[arrangementId] = text;
    else delete notes[arrangementId];
    return { ...d, notes };
  },
  setPreferredKey: (arrangementId: string, key: string | null) => (d: UserData): UserData => {
    const preferredKeys = { ...d.preferredKeys };
    if (key) preferredKeys[arrangementId] = key;
    else delete preferredKeys[arrangementId];
    return { ...d, preferredKeys };
  },
  setPreferredArrangement: (songId: string, arrangementId: string) => (d: UserData): UserData => ({
    ...d,
    preferredArrangements: { ...d.preferredArrangements, [songId]: arrangementId },
  }),
  updateSettings: (patch: Partial<Settings>) => (d: UserData): UserData => ({ ...d, settings: { ...d.settings, ...patch } }),

  createSetlist: (name: string, id = uid()) => (d: UserData): UserData => ({
    ...d,
    setlists: [{ id, name: name.trim() || 'Untitled setlist', songs: [], createdAt: now(), updatedAt: now() }, ...d.setlists],
  }),
  updateSetlist: (id: string, fn: (s: Setlist) => Setlist) => (d: UserData): UserData => ({
    ...d,
    setlists: d.setlists.map((s) => (s.id === id ? { ...fn(s), updatedAt: now() } : s)),
  }),
  deleteSetlist: (id: string) => (d: UserData): UserData => ({ ...d, setlists: d.setlists.filter((s) => s.id !== id) }),
  duplicateSetlist: (id: string, newId = uid()) => (d: UserData): UserData => {
    const src = d.setlists.find((s) => s.id === id);
    if (!src) return d;
    const copy: Setlist = {
      ...src,
      id: newId,
      name: `${src.name} (copy)`,
      songs: src.songs.map((s) => ({ ...s, uid: uid() })),
      createdAt: now(),
      updatedAt: now(),
    };
    const i = d.setlists.indexOf(src);
    const setlists = [...d.setlists];
    setlists.splice(i + 1, 0, copy);
    return { ...d, setlists };
  },
  replaceAll: (data: UserData) => (): UserData => migrate(data),
};

export const setlistOps = {
  add: (song: Omit<SetlistSong, 'uid'>) => (s: Setlist): Setlist => ({ ...s, songs: [...s.songs, { ...song, uid: uid() }] }),
  remove: (songUid: string) => (s: Setlist): Setlist => ({ ...s, songs: s.songs.filter((x) => x.uid !== songUid) }),
  move: (from: number, to: number) => (s: Setlist): Setlist => {
    if (from === to || from < 0 || from >= s.songs.length) return s;
    const songs = [...s.songs];
    const [item] = songs.splice(from, 1);
    songs.splice(Math.max(0, Math.min(to, songs.length)), 0, item);
    return { ...s, songs };
  },
  patch: (songUid: string, patch: Partial<SetlistSong>) => (s: Setlist): Setlist => ({
    ...s,
    songs: s.songs.map((x) => (x.uid === songUid ? { ...x, ...patch } : x)),
  }),
  rename: (name: string) => (s: Setlist): Setlist => ({ ...s, name }),
  setDate: (date: string) => (s: Setlist): Setlist => ({ ...s, date: date || undefined }),
};
