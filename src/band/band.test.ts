import { describe, expect, it } from 'vitest';
import { draftToSong, emptyDraft, mergeLibrary, newSongId, pagesLabel, songToDraft } from './customSongs';
import { mergeServerSetlists, sortBandSetlists } from './BandProvider';
import { BandError, SupabaseBandRepository } from './repository';
import type { Library, Setlist } from '../data/types';

const sl = (id: string, date?: string, name = id): Setlist => ({ id, name, date, songs: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' });

describe('added songs', () => {
  it('keeps exactly what was typed and drops empty sections', () => {
    const d = emptyDraft();
    d.title = '  Great Are You Lord ';
    d.key = 'G';
    d.musician = 'Tawa';
    d.notes = 'Chorus x3\n\n';
    d.sections = [
      { name: 'Verse', kind: 'verse', progression: '1 5 2,3 4', lyricCue: '' },
      { name: '', kind: 'chorus', progression: '', lyricCue: '' },
    ];
    const song = draftToSong(d, 'added-x', 'Band additions');
    expect(song.title).toBe('Great Are You Lord');
    expect(song.sourcePages).toEqual([]);
    const a = song.arrangements[0];
    expect(a.originalKey).toBe('G');
    expect(a.musicians).toEqual(['Tawa']);
    expect(a.performanceNotes).toEqual(['Chorus x3']);
    expect(a.sections).toHaveLength(1);
    expect(a.sections[0]).toMatchObject({ progression: '1 5 2,3 4', page: 0 });
    expect(songToDraft(song).sections[0].progression).toBe('1 5 2,3 4');
  });

  it('never invents a key', () => {
    const d = emptyDraft();
    d.title = 'No key';
    expect(draftToSong(d, 'a', 'My songs').arrangements[0].originalKey).toBeNull();
  });

  it('merges band and personal songs without replacing PDF songs', () => {
    const base = { version: 1, source: { title: '', file: '', pages: 1 }, accompaniment: [], songs: [{ id: 'pdf', title: 'PDF', collection: 'Song List', sourcePages: [1], arrangements: [] }] } as unknown as Library;
    const fake = (id: string) => draftToSong({ ...emptyDraft(), title: id }, id, 'My songs');
    const merged = mergeLibrary(base, [fake('pdf'), fake('b1')], [fake('m1'), fake('b1')]);
    expect(merged.songs.map((s) => `${s.id}:${s.collection}`)).toEqual(['pdf:Song List', 'b1:Band additions', 'm1:My songs']);
    expect(mergeLibrary(base, [], [])).toBe(base);
  });

  it('makes readable ids and page labels', () => {
    expect(newSongId('Way Maker!', 'abc12')).toBe('added-way-maker-abc12');
    expect(pagesLabel([])).toBe('Added in the app');
    expect(pagesLabel([3, 4])).toBe('PDF pages 3, 4');
  });
});

describe('band setlists', () => {
  it('keeps unsaved local edits when the server copy arrives', () => {
    const server = [sl('a', undefined, 'server A'), sl('b', undefined, 'server B')];
    const local = [sl('a', undefined, 'local A'), sl('new', undefined, 'brand new'), sl('b', undefined, 'old B')];
    const merged = mergeServerSetlists(server, local, new Set(['a', 'new']));
    expect(merged.map((s) => s.name)).toEqual(['brand new', 'local A', 'server B']);
  });

  it('puts the next service first', () => {
    const list = [sl('past', '2026-11-15'), sl('later', '2026-12-06'), sl('next', '2026-11-29'), sl('undated')];
    expect(sortBandSetlists(list, '2026-11-22').map((s) => s.id)).toEqual(['next', 'later', 'past', 'undated']);
  });
});

describe('SupabaseBandRepository', () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const respond = (status: number, body: unknown) => async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify(body), { status });
  };

  it('reads setlists with the public key and maps columns', async () => {
    calls.length = 0;
    const repo = new SupabaseBandRepository('https://x.supabase.co', 'anon', respond(200, [{ id: 'a', name: 'Sunday', service_date: '2026-11-29', songs: [{ uid: 'u', songId: 's', arrangementId: 's~1' }], updated_at: '2026-11-22T10:00:00Z' }]) as typeof fetch);
    const list = await repo.listSetlists();
    expect(list[0]).toMatchObject({ id: 'a', name: 'Sunday', date: '2026-11-29' });
    expect(calls[0].url).toBe('https://x.supabase.co/rest/v1/band_setlists?select=*');
    expect((calls[0].init.headers as Record<string, string>).apikey).toBe('anon');
  });

  it('sends the PIN with saves and reports a wrong PIN clearly', async () => {
    calls.length = 0;
    const repo = new SupabaseBandRepository('https://x.supabase.co', 'anon', respond(401, { code: '28P01', message: 'Wrong band PIN' }) as typeof fetch);
    const err = await repo.saveSetlist('1234', sl('a')).catch((e) => e);
    expect(err).toBeInstanceOf(BandError);
    expect(err.kind).toBe('pin');
    expect(JSON.parse(calls[0].init.body as string)).toMatchObject({ p_pin: '1234', p_setlist: { id: 'a', name: 'a' } });
    expect(calls[0].url).toBe('https://x.supabase.co/rest/v1/rpc/band_save_setlist');
  });

  it('turns a failed connection into a friendly offline error', async () => {
    const repo = new SupabaseBandRepository('https://x', 'k', (async () => { throw new TypeError('Failed to fetch'); }) as typeof fetch);
    await expect(repo.listSongs()).rejects.toMatchObject({ kind: 'network' });
  });
});
