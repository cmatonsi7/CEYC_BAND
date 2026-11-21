import { describe, expect, it } from 'vitest';
import { LocalUserStore, actions, migrate, setlistOps } from './userStore';

class MemoryStorage {
  map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
}

describe('user data persistence', () => {
  it('favourites survive a reload', () => {
    const storage = new MemoryStorage();
    const a = new LocalUserStore(storage);
    a.update(actions.toggleFavourite('beautiful'));
    a.update(actions.toggleFavourite('freely'));
    a.update(actions.toggleFavourite('freely'));
    const b = new LocalUserStore(storage); // simulates a page refresh
    expect(b.get().favourites).toEqual(['beautiful']);
  });

  it('setlists save, reorder, duplicate and persist', () => {
    const storage = new MemoryStorage();
    const s = new LocalUserStore(storage);
    s.update(actions.createSetlist('Sunday', 'sun'));
    s.update(actions.updateSetlist('sun', setlistOps.add({ songId: 'beautiful', arrangementId: 'beautiful--main', performanceKey: 'E' })));
    s.update(actions.updateSetlist('sun', setlistOps.add({ songId: 'freely', arrangementId: 'freely--main' })));
    s.update(actions.updateSetlist('sun', setlistOps.add({ songId: 'one-name', arrangementId: 'one-name--busi', notes: 'Keys only' })));
    s.update(actions.updateSetlist('sun', setlistOps.move(2, 0)));
    s.update(actions.duplicateSetlist('sun', 'copy'));

    const after = new LocalUserStore(storage).get();
    const sun = after.setlists.find((x) => x.id === 'sun')!;
    expect(sun.songs.map((x) => x.songId)).toEqual(['one-name', 'beautiful', 'freely']);
    expect(sun.songs[0].notes).toBe('Keys only');
    expect(sun.songs[1].performanceKey).toBe('E');
    const copy = after.setlists.find((x) => x.id === 'copy')!;
    expect(copy.name).toBe('Sunday (copy)');
    expect(copy.songs.map((x) => x.songId)).toEqual(sun.songs.map((x) => x.songId));
    expect(copy.songs[0].uid).not.toBe(sun.songs[0].uid);
  });

  it('remembers notes, keys and arrangements; clears empty notes', () => {
    const s = new LocalUserStore(new MemoryStorage());
    s.update(actions.setNote('a1', 'Start soft'));
    s.update(actions.setPreferredKey('a1', 'G'));
    s.update(actions.setPreferredArrangement('song', 'a2'));
    expect(s.get().notes.a1).toBe('Start soft');
    s.update(actions.setNote('a1', '  '));
    expect(s.get().notes.a1).toBeUndefined();
    expect(s.get().preferredKeys.a1).toBe('G');
    expect(s.get().preferredArrangements.song).toBe('a2');
  });

  it('keeps recently viewed unique and newest first', () => {
    const s = new LocalUserStore(new MemoryStorage());
    ['a', 'b', 'a', 'c'].forEach((id) => s.update(actions.markViewed(id)));
    expect(s.get().recent.map((r) => r.songId)).toEqual(['c', 'a', 'b']);
  });

  it('reports when the browser will not keep data', () => {
    const ok = new LocalUserStore(new MemoryStorage());
    ok.update(actions.createSetlist('A'));
    expect(ok.isPersistent()).toBe(true);
    const blocked = new LocalUserStore({ getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } });
    blocked.update(actions.createSetlist('A'));
    expect(blocked.isPersistent()).toBe(false);
    expect(blocked.get().setlists).toHaveLength(1); // still works for this session
    const silent = new LocalUserStore({ getItem: () => null, setItem: () => {} }); // drops writes silently
    silent.update(actions.createSetlist('A'));
    expect(silent.isPersistent()).toBe(false);
    expect(new LocalUserStore(null).isPersistent()).toBe(false);
  });

  it('recovers from corrupt or missing storage', () => {
    const storage = new MemoryStorage();
    storage.setItem('ceyc-music-library:v1', '{not json');
    expect(new LocalUserStore(storage).get().favourites).toEqual([]);
    expect(new LocalUserStore(null).get().setlists).toEqual([]);
    expect(migrate({ favourites: [1, 'x'], settings: { notation: 'nns' } }).favourites).toEqual(['x']);
    expect(migrate({ settings: { notation: 'nns' } }).settings.theme).toBe('system');
    expect(migrate({ settings: { notation: 'both' } }).settings.notation).toBe('both');
    expect(migrate({ settings: { notation: 'roman' } }).settings.notation).toBe('chords');
  });
});
