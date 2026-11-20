import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Library } from './types';
import { findArrangement, findSong, keyContext, playableProgression, searchSongs, rankSongs, sectionKey, songKeys } from './library';
import { keyToString, renderProgression, tokenize } from '../music';

const lib: Library = JSON.parse(readFileSync('public/data/library.json', 'utf8'));
const song = (id: string) => findSong(lib, id)!;

describe('library data integrity', () => {
  it('has the extracted counts', () => {
    expect(lib.songs).toHaveLength(68);
    expect(lib.songs.reduce((n, s) => n + s.arrangements.length, 0)).toBe(72);
    expect(lib.accompaniment.map((a) => a.title)).toContain('Prayer');
    expect(lib.accompaniment.map((a) => a.title)).toContain('Offering');
  });
  it('gives every song, arrangement and section a unique id, a page and source text', () => {
    const ids = new Set<string>();
    for (const s of lib.songs) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      for (const a of s.arrangements) {
        expect(ids.has(a.id)).toBe(false);
        ids.add(a.id);
        expect(a.sections.length).toBeGreaterThan(0);
        const secIds = new Set(a.sections.map((x) => x.id));
        expect(secIds.size).toBe(a.sections.length);
        for (const sec of a.sections) {
          expect(sec.page).toBeGreaterThanOrEqual(1);
          expect(sec.page).toBeLessThanOrEqual(34);
          expect(sec.source.length).toBeGreaterThan(0);
          if (sec.refersTo) expect(secIds.has(sec.refersTo)).toBe(true);
        }
      }
    }
  });
  it('only uses parseable keys', () => {
    for (const s of lib.songs) for (const a of s.arrangements) {
      if (a.originalKey) expect(keyContext(a).written).not.toBeNull();
      for (const sec of a.sections) if (sec.key) expect(sectionKey(keyContext(a), sec)).not.toBeNull();
    }
  });
  it('keeps the source text verbatim where no override is flagged', () => {
    for (const s of lib.songs) for (const a of s.arrangements) for (const sec of a.sections) {
      if (sec.progression && sec.progression !== sec.source && !sec.refersTo && sec.kind !== 'melody') {
        // An edited progression must be explained somewhere visible.
        const explained = (sec.flags?.length ?? 0) + (sec.instructions?.length ?? 0) + (sec.lyricCue ? 1 : 0) + (sec.sourceLabel ? 1 : 0) + (sec.key ? 1 : 0);
        expect(explained, `${s.title} / ${sec.name}`).toBeGreaterThan(0);
      }
    }
  });
  it('keeps musician-specific arrangements separate', () => {
    expect(song('precious-word-of-truth').arrangements.map((a) => a.label)).toEqual(['Version 1 (page 4)', 'Lubone']);
    expect(song('divinity').arrangements).toHaveLength(2);
    expect(song('the-person-of-sovereign-majesty').arrangements).toHaveLength(2);
    const beautiful = song('beautiful').arrangements[0];
    expect(beautiful.keyOptions).toEqual([{ key: 'Eb', label: 'Busi' }, { key: 'E', label: 'Tawa' }]);
  });
  it('flags songs with no key instead of inventing one', () => {
    const reason = song('the-reason').arrangements[0];
    expect(reason.originalKey).toBeNull();
    expect(reason.flags?.join(' ')).toMatch(/No key/);
  });
});

describe('modulation', () => {
  it('Creator of the Universe moves F → F# → G', () => {
    const a = song('creator-of-the-universe').arrangements[0];
    const ctx = keyContext(a);
    const keys = a.sections.map((s) => keyToString(sectionKey(ctx, s)!));
    expect(keys).toEqual(['F', 'F', 'F', 'F#', 'G']);
  });
  it('Creator of the Universe keeps its key relationships when transposed', () => {
    const a = song('creator-of-the-universe').arrangements[0];
    const ctx = keyContext(a, 'G');
    expect(a.sections.map((s) => keyToString(sectionKey(ctx, s)!))).toEqual(['G', 'G', 'G', 'Ab', 'A']);
  });
  it("You're the King of Glory goes from F to G for the last chorus", () => {
    const a = song('youre-the-king-of-glory').arrangements[0];
    const ctx = keyContext(a);
    const last = a.sections.find((s) => s.name === 'Chorus (in G)')!;
    expect(keyToString(sectionKey(ctx, last)!)).toBe('G');
    const prog = playableProgression(a, last);
    expect(renderProgression(prog, sectionKey(ctx, last), 'chords')).toBe('D - C - G - D - C - G\nAm - D - Em - C - Am - D - G … x2');
    expect(a.modulationNotes?.[0]).toMatch(/from F to G/);
  });
  it('keeps the modulation instruction text intact', () => {
    const bridge = song('youre-the-king-of-glory').arrangements[0].sections.find((s) => s.name === 'Bridge')!;
    expect(bridge.source).toContain('TRANSPOSE BY 1 TONE (from F to G) stay on the 5');
    expect(bridge.instructions).toContain('TRANSPOSE BY 1 TONE (from F to G) stay on the 5');
  });
});

describe('arrangements', () => {
  it('can be selected independently', () => {
    const s = song('divinity');
    const a1 = findArrangement(s, s.arrangements[0].id), a2 = findArrangement(s, s.arrangements[1].id);
    expect(a1.originalKey).toBe('A');
    expect(a2.originalKey).toBe('Ab');
    expect(a1.sections.map((x) => x.name)).not.toEqual(a2.sections.map((x) => x.name));
    expect(findArrangement(s, 'missing').id).toBe(s.arrangements[0].id);
  });
});

describe('search', () => {
  const titles = (q: string) => rankSongs(searchSongs(lib.songs, { query: q }), q).map((s) => s.title);
  it('matches titles regardless of case and apostrophes', () => {
    expect(titles('youre the king')[0]).toBe('You’re the King Of Glory');
    expect(titles('ALABASTER')).toEqual(['My Alabaster Box']);
    expect(titles('im one')).toContain("I'm One With You");
  });
  it('ranks title-prefix matches first', () => {
    expect(titles('king')[0]).toMatch(/^King/);
  });
  it('finds songs by lyric cue', () => {
    expect(titles('hallelujah')).toContain('You Sit Above the Cherubim');
  });
  it('filters by key and musician', () => {
    const tawa = searchSongs(lib.songs, { musician: 'Tawa' });
    expect(tawa.length).toBeGreaterThan(5);
    expect(tawa.every((s) => s.arrangements.some((a) => a.musicians.includes('Tawa')))).toBe(true);
    const inE = searchSongs(lib.songs, { key: 'E' }).map((s) => s.title);
    expect(inE).toContain('Beautiful'); // via Tawa's key option
    expect(searchSongs(lib.songs, { key: 'none' }).every((s) => s.arrangements.every((a) => !a.originalKey && !a.keyOptions?.length))).toBe(true);
    expect(songKeys(song('beautiful'))).toEqual(['Eb', 'E']);
  });
  it('returns nothing for nonsense', () => {
    expect(titles('zzzz')).toEqual([]);
  });
});

describe('tokenizer over the whole library', () => {
  it('never drops characters other than whitespace and dashes', () => {
    for (const s of lib.songs) for (const a of s.arrangements) for (const sec of a.sections) {
      if (!sec.progression) continue;
      const kept = tokenize(sec.progression).map((t) => ('raw' in t ? t.raw : '')).join('').replace(/[\s\-–—]/g, '');
      expect(kept, `${s.title} / ${sec.name}`).toBe(sec.progression.replace(/[\s\-–—​]/g, ''));
    }
  });
});
