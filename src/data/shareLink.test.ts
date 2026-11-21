import { describe, expect, it } from 'vitest';
import { decodeSetlist, encodeSetlist, shareUrl } from './shareLink';

const setlist = {
  name: 'Sunday 22 Nov — Worship',
  date: '2026-11-22',
  songs: [
    { uid: 'a', songId: 'beautiful', arrangementId: 'beautiful--main', performanceKey: 'E', notes: 'Tawa’s key, start soft' },
    { uid: 'b', songId: 'divinity', arrangementId: 'divinity--ab-version-page-23' },
    { uid: 'c', songId: 'odd', arrangementId: 'custom-id' },
  ],
};

describe('share links', () => {
  it('round-trips name, date, order, arrangement, key and notes (including non-ASCII)', () => {
    const back = decodeSetlist(encodeSetlist(setlist))!;
    expect(back.name).toBe(setlist.name);
    expect(back.date).toBe('2026-11-22');
    expect(back.songs).toEqual([
      { songId: 'beautiful', arrangementId: 'beautiful--main', performanceKey: 'E', notes: 'Tawa’s key, start soft' },
      { songId: 'divinity', arrangementId: 'divinity--ab-version-page-23' },
      { songId: 'odd', arrangementId: 'custom-id' },
    ]);
  });
  it('makes URL-safe links under the GitHub Pages path', () => {
    const url = shareUrl(setlist, { origin: 'https://cmatonsi7.github.io', pathname: '/CEYC_BAND/' });
    expect(url.startsWith('https://cmatonsi7.github.io/CEYC_BAND/#/shared?s=')).toBe(true);
    expect(url.split('s=')[1]).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it('rejects broken links instead of crashing', () => {
    expect(decodeSetlist('not-a-real-code')).toBeNull();
    expect(decodeSetlist('')).toBeNull();
  });
});
