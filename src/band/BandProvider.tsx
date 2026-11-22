import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Setlist, Song } from '../data/types';
import { bandConfig } from './config';
import { BandError, SupabaseBandRepository, type BandRepository } from './repository';

const CACHE_KEY = 'ceyc-band-cache:v1';
const PIN_KEY = 'ceyc-band-pin';
const POLL_MS = 30_000;
const SAVE_DELAY_MS = 700;

/** off = not set up on this site; live = in sync with the band; offline = showing the last copy saved on this phone. */
export type BandStatus = 'off' | 'loading' | 'live' | 'offline';

export interface BandState {
  enabled: boolean;
  status: BandStatus;
  setlists: Setlist[];
  songs: Song[];
  lastSynced: string | null;
  error: string | null;
  /** True while changes are waiting to reach the band server. */
  saving: boolean;
  /** This device has the band PIN (can create and edit band items). */
  canEdit: boolean;
  unlock(pin: string): Promise<boolean>;
  lock(): void;
  refresh(): Promise<void>;
  /** Create or replace a band setlist and save it straight away. */
  publishSetlist(s: Setlist): Promise<void>;
  /** Change a band setlist. Updates on screen at once and saves shortly after typing stops. */
  updateSetlist(id: string, fn: (s: Setlist) => Setlist): void;
  deleteSetlist(id: string): Promise<void>;
  saveSong(s: Song): Promise<void>;
  deleteSong(id: string): Promise<void>;
}

const Ctx = createContext<BandState | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}
function storePin(pin: string | null) {
  try {
    if (pin) localStorage.setItem(PIN_KEY, pin);
    else localStorage.removeItem(PIN_KEY);
  } catch { /* ignore */ }
}
function readPin(): string | null {
  try { return localStorage.getItem(PIN_KEY); } catch { return null; }
}

/** Server copy, but keep local versions of setlists that still have unsaved edits. */
export function mergeServerSetlists(server: Setlist[], local: Setlist[], dirty: Set<string>): Setlist[] {
  const merged = server.map((s) => (dirty.has(s.id) ? local.find((l) => l.id === s.id) ?? s : s));
  const unsavedNew = local.filter((l) => dirty.has(l.id) && !server.some((s) => s.id === l.id));
  return [...unsavedNew, ...merged];
}

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function BandProvider({ children, repository }: { children: ReactNode; repository?: BandRepository | null }) {
  const repo = useMemo<BandRepository | null>(() => {
    if (repository !== undefined) return repository;
    const cfg = bandConfig();
    return cfg ? new SupabaseBandRepository(cfg.url, cfg.anonKey) : null;
  }, [repository]);

  const cached = useMemo(() => readJson<{ setlists: Setlist[]; songs: Song[]; at: string | null }>(CACHE_KEY, { setlists: [], songs: [], at: null }), []);
  const [setlists, setSetlistsState] = useState<Setlist[]>(repo ? cached.setlists ?? [] : []);
  const [songs, setSongs] = useState<Song[]>(repo ? cached.songs ?? [] : []);
  const [lastSynced, setLastSynced] = useState<string | null>(repo ? cached.at : null);
  const [status, setStatus] = useState<BandStatus>(repo ? 'loading' : 'off');
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(() => (repo ? readPin() : null));
  const [pending, setPending] = useState(0);

  const latest = useRef(setlists);
  const setSetlists = useCallback((fn: (prev: Setlist[]) => Setlist[]) => {
    setSetlistsState((prev) => {
      const next = fn(prev);
      latest.current = next;
      return next;
    });
  }, []);
  /** Setlists with edits not yet saved: polling must not overwrite them. */
  const dirty = useRef(new Set<string>());
  const timers = useRef(new Map<string, number>());

  const failed = useCallback((e: unknown) => {
    if (e instanceof BandError && e.kind === 'pin') {
      setPin(null);
      storePin(null);
    }
    setError(e instanceof Error ? e.message : String(e));
  }, []);

  const refresh = useCallback(async () => {
    if (!repo) return;
    try {
      const [sl, sg] = await Promise.all([repo.listSetlists(), repo.listSongs()]);
      setSetlists((prev) => {
        const next = mergeServerSetlists(sl, prev, dirty.current);
        return sameJson(next, prev) ? prev : next;
      });
      setSongs((prev) => (sameJson(sg, prev) ? prev : sg));
      const at = new Date().toISOString();
      setLastSynced(at);
      setStatus('live');
      setError((e) => (e && /reach|server error/i.test(e) ? null : e));
      writeJson(CACHE_KEY, { setlists: sl, songs: sg, at });
    } catch (e) {
      setStatus('offline');
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [repo, setSetlists]);

  // Load now, then stay up to date while the app is open and on screen.
  useEffect(() => {
    if (!repo) return;
    refresh();
    const tick = () => { if (document.visibilityState === 'visible') refresh(); };
    const id = window.setInterval(tick, POLL_MS);
    window.addEventListener('focus', tick);
    window.addEventListener('online', tick);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', tick);
      window.removeEventListener('online', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [repo, refresh]);

  const requirePin = useCallback(() => {
    if (!repo) throw new BandError('Band sharing isn’t set up on this site.', 'server');
    if (!pin) throw new BandError('Enter the band PIN to make changes.', 'pin');
    return { r: repo, p: pin };
  }, [repo, pin]);

  const track = useCallback(async (fn: () => Promise<void>) => {
    setPending((n) => n + 1);
    try {
      await fn();
      setError(null);
    } catch (e) {
      failed(e);
      throw e;
    } finally {
      setPending((n) => n - 1);
    }
  }, [failed]);

  const flush = useCallback((id: string) => {
    timers.current.delete(id);
    const s = latest.current.find((x) => x.id === id);
    if (!s || !repo || !pin) return;
    track(async () => {
      await repo.saveSetlist(pin, s);
      // Only clean if nothing changed while the request was in flight.
      if (!timers.current.has(id)) dirty.current.delete(id);
    }).catch(() => {});
  }, [repo, pin, track]);

  // Save anything waiting when the page is hidden or closed.
  useEffect(() => {
    const flushAll = () => { for (const [id, t] of timers.current) { window.clearTimeout(t); flush(id); } };
    const onHide = () => { if (document.visibilityState === 'hidden') flushAll(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flushAll);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flushAll);
    };
  }, [flush]);

  const value: BandState = {
    enabled: !!repo,
    status,
    setlists,
    songs,
    lastSynced,
    error,
    saving: pending > 0 || timers.current.size > 0,
    canEdit: !!repo && !!pin,
    async unlock(raw) {
      if (!repo) return false;
      const p = raw.trim();
      if (!p) return false;
      const ok = await repo.checkPin(p);
      if (ok) {
        setPin(p);
        storePin(p);
        setError(null);
      }
      return ok;
    },
    lock() {
      setPin(null);
      storePin(null);
    },
    refresh,
    async publishSetlist(s) {
      const { r, p } = requirePin();
      const stamped = { ...s, updatedAt: new Date().toISOString() };
      dirty.current.add(s.id);
      setSetlists((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? stamped : x)) : [stamped, ...prev]));
      await track(async () => {
        await r.saveSetlist(p, stamped);
        dirty.current.delete(s.id);
      });
    },
    updateSetlist(id, fn) {
      requirePin();
      dirty.current.add(id);
      setSetlists((prev) => prev.map((x) => (x.id === id ? { ...fn(x), updatedAt: new Date().toISOString() } : x)));
      const old = timers.current.get(id);
      if (old) window.clearTimeout(old);
      timers.current.set(id, window.setTimeout(() => flush(id), SAVE_DELAY_MS));
      setPending((n) => n); // re-render for `saving`
    },
    async deleteSetlist(id) {
      const { r, p } = requirePin();
      const t = timers.current.get(id);
      if (t) { window.clearTimeout(t); timers.current.delete(id); }
      await track(async () => {
        await r.deleteSetlist(p, id);
        dirty.current.delete(id);
        setSetlists((prev) => prev.filter((x) => x.id !== id));
      });
    },
    async saveSong(song) {
      const { r, p } = requirePin();
      await track(async () => {
        await r.saveSong(p, song);
        setSongs((prev) => (prev.some((x) => x.id === song.id) ? prev.map((x) => (x.id === song.id ? song : x)) : [...prev, song]));
      });
    },
    async deleteSong(id) {
      const { r, p } = requirePin();
      await track(async () => {
        await r.deleteSong(p, id);
        setSongs((prev) => prev.filter((x) => x.id !== id));
      });
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBand(): BandState {
  const c = useContext(Ctx);
  if (!c) throw new Error('BandProvider missing');
  return c;
}

/** Next upcoming service first, then the most recent past or undated ones. */
export function sortBandSetlists(list: Setlist[], today = localToday()): Setlist[] {
  const upcoming = list.filter((s) => s.date && s.date >= today).sort((a, b) => a.date!.localeCompare(b.date!) || b.updatedAt.localeCompare(a.updatedAt));
  const rest = list.filter((s) => !(s.date && s.date >= today)).sort((a, b) => (b.date || b.updatedAt).localeCompare(a.date || a.updatedAt));
  return [...upcoming, ...rest];
}

export function localToday(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
