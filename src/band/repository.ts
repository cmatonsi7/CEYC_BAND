import type { Setlist, Song } from '../data/types';

/**
 * Shared band data: setlists and songs everyone with the app link can see.
 * Reads are open; every write carries the band edit PIN, which the database
 * checks (see supabase/setup.sql).
 */
export interface BandRepository {
  listSetlists(): Promise<Setlist[]>;
  listSongs(): Promise<Song[]>;
  checkPin(pin: string): Promise<boolean>;
  saveSetlist(pin: string, setlist: Setlist): Promise<void>;
  deleteSetlist(pin: string, id: string): Promise<void>;
  saveSong(pin: string, song: Song): Promise<void>;
  deleteSong(pin: string, id: string): Promise<void>;
}

export class BandError extends Error {
  constructor(message: string, readonly kind: 'pin' | 'network' | 'server') {
    super(message);
  }
}

interface SetlistRow { id: string; name: string; service_date: string | null; songs: Setlist['songs']; updated_at: string }
interface SongRow { id: string; title: string; song: Song; updated_at: string }

/** Talks to Supabase's REST API directly with fetch: no SDK needed. */
export class SupabaseBandRepository implements BandRepository {
  constructor(private readonly url: string, private readonly anonKey: string, private readonly fetchImpl: typeof fetch = (...a) => fetch(...a)) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.url}/rest/v1/${path}`, {
        ...init,
        cache: 'no-store',
        headers: { apikey: this.anonKey, Authorization: `Bearer ${this.anonKey}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      });
    } catch {
      throw new BandError('Can’t reach the band server. Check your connection.', 'network');
    }
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = (body && (body.message as string)) || `Band server error (${res.status})`;
      throw new BandError(msg.includes('Wrong band PIN') ? 'That band PIN isn’t right.' : msg, msg.includes('Wrong band PIN') ? 'pin' : 'server');
    }
    return body as T;
  }

  private rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    return this.request<T>(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) });
  }

  async listSetlists(): Promise<Setlist[]> {
    const rows = await this.request<SetlistRow[]>('band_setlists?select=*');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      date: r.service_date ?? undefined,
      songs: Array.isArray(r.songs) ? r.songs : [],
      createdAt: r.updated_at,
      updatedAt: r.updated_at,
    }));
  }

  async listSongs(): Promise<Song[]> {
    const rows = await this.request<SongRow[]>('band_songs?select=*');
    return rows.filter((r) => r.song && Array.isArray(r.song.arrangements)).map((r) => ({ ...r.song, id: r.id, title: r.title }));
  }

  checkPin(pin: string): Promise<boolean> {
    return this.rpc<boolean>('band_check_pin', { p_pin: pin });
  }

  async saveSetlist(pin: string, s: Setlist): Promise<void> {
    await this.rpc('band_save_setlist', { p_pin: pin, p_setlist: { id: s.id, name: s.name, date: s.date ?? '', songs: s.songs } });
  }

  async deleteSetlist(pin: string, id: string): Promise<void> {
    await this.rpc('band_delete_setlist', { p_pin: pin, p_id: id });
  }

  async saveSong(pin: string, song: Song): Promise<void> {
    await this.rpc('band_save_song', { p_pin: pin, p_song: song });
  }

  async deleteSong(pin: string, id: string): Promise<void> {
    await this.rpc('band_delete_song', { p_pin: pin, p_id: id });
  }
}
