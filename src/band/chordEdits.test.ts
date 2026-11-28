import { describe, expect, it } from 'vitest';
import { applyChordEdits, chordEditRecord, diffChordEdits, hasEdits, isChordEditRecord } from './chordEdits';
import { mergeLibrary } from './customSongs';
import type { Library, Song } from '../data/types';

const pdfSong = (): Song => ({
  id: 'way-maker', title: 'Way Maker', collection: 'Song List', sourcePages: [3],
  arrangements: [{
    id: 'way-maker~1', label: '', musicians: [], originalKey: 'G', keyText: 'G', sourcePages: [3],
    sections: [
      { id: 's1', name: 'Verse', kind: 'verse', progression: '1 5 6 4', source: 'Verse 1 5 6 4', page: 3, flags: ['check'] },
      { id: 's2', name: 'Chorus', kind: 'chorus', progression: '4 5 6#', source: 'Chorus 4 5 6#', page: 3 },
    ],
  }],
});
const lib = (songs: Song[]) => ({ version: 1, source: { title: '', file: '', pages: 1 }, accompaniment: [], songs }) as unknown as Library;

describe('chord edits', () => {
  it('stores only what changed, exactly as typed', () => {
    const s = pdfSong();
    const e = diffChordEdits(s, { 'way-maker~1': { key: 'G', sections: { s1: '1 5 6 4', s2: ' 2,3 4/5 6# ' } } }, 't');
    expect(e).toEqual({ arrangements: { 'way-maker~1': { sections: { s2: '2,3 4/5 6#' } } }, editedAt: 't' });
    expect(hasEdits(diffChordEdits(s, { 'way-maker~1': { key: 'G', sections: { s1: '1 5 6 4', s2: '4 5 6#' } } }))).toBe(false);
  });

  it('applies edits and remembers the PDF numbers and key', () => {
    const e = { arrangements: { 'way-maker~1': { key: 'A', sections: { s2: '2,3 4' } } }, editedAt: 't' };
    const out = applyChordEdits(pdfSong(), e, 'band');
    const a = out.arrangements[0];
    expect(a.originalKey).toBe('A');
    expect(a.keyEdited).toEqual({ original: 'G', by: 'band' });
    expect(a.sections[0]).toEqual(pdfSong().arrangements[0].sections[0]);
    expect(a.sections[1]).toMatchObject({ progression: '2,3 4', source: 'Chorus 4 5 6#', edited: { original: '4 5 6#', by: 'band' } });
    expect(out.chordsEdited).toEqual({ by: 'band', at: 't' });
  });

  it('ignores sections that no longer exist', () => {
    const out = applyChordEdits(pdfSong(), { arrangements: { 'way-maker~1': { sections: { s9: '1' } }, gone: { sections: { s1: '2' } } }, editedAt: 't' }, 'band');
    expect(out).toEqual(pdfSong());
  });

  it('merges band edits into PDF songs; this device wins; edit rows never show as songs', () => {
    const bandEdit = chordEditRecord(pdfSong(), { arrangements: { 'way-maker~1': { sections: { s1: '1 4' } } }, editedAt: 'b' });
    expect(isChordEditRecord(bandEdit)).toBe(true);
    const merged = mergeLibrary(lib([pdfSong()]), [bandEdit], []);
    expect(merged.songs).toHaveLength(1);
    expect(merged.songs[0].arrangements[0].sections[0].progression).toBe('1 4');
    const mine = mergeLibrary(lib([pdfSong()]), [bandEdit], [], { 'way-maker': { arrangements: { 'way-maker~1': { sections: { s1: '6 4' } } }, editedAt: 'd' } });
    expect(mine.songs[0].arrangements[0].sections[0]).toMatchObject({ progression: '6 4', edited: { by: 'device' } });
  });
});
