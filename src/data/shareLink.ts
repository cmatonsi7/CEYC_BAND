import type { Setlist, SetlistSong } from './types';

/**
 * Share links: a setlist packed into the URL itself (#/shared?s=...), so
 * anyone with the link can open it without an account or a server. The link
 * is a snapshot; later edits need a new link.
 *
 * Format v1: base64url(JSON [1, name, date, [[songId, arrangementSuffix, key, notes], ...]])
 * The arrangement id is stored without its "<songId>--" prefix to keep links short.
 */
export interface SharedSetlist {
  name: string;
  date?: string;
  songs: Omit<SetlistSong, 'uid'>[];
}

type Packed = [1, string, string, [string, string, string, string][]];

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeSetlist(s: Pick<Setlist, 'name' | 'date' | 'songs'>): string {
  const packed: Packed = [
    1,
    s.name,
    s.date ?? '',
    s.songs.map((x) => {
      const prefix = `${x.songId}--`;
      const arr = x.arrangementId.startsWith(prefix) ? x.arrangementId.slice(prefix.length) : `=${x.arrangementId}`;
      return [x.songId, arr, x.performanceKey ?? '', x.notes ?? ''];
    }),
  ];
  // Drop trailing empty fields per song to shorten the link.
  const compact = [packed[0], packed[1], packed[2], packed[3].map((row) => {
    const r = [...row];
    while (r.length > 1 && r[r.length - 1] === '') r.pop();
    return r;
  })];
  return toBase64Url(JSON.stringify(compact));
}

export function decodeSetlist(code: string): SharedSetlist | null {
  try {
    const data = JSON.parse(fromBase64Url(code));
    if (!Array.isArray(data) || data[0] !== 1 || typeof data[1] !== 'string' || !Array.isArray(data[3])) return null;
    const songs = (data[3] as unknown[]).flatMap((row) => {
      if (!Array.isArray(row) || typeof row[0] !== 'string') return [];
      const [songId, arr = '', key = '', notes = ''] = row as string[];
      const arrangementId = arr.startsWith('=') ? arr.slice(1) : `${songId}--${arr || 'main'}`;
      const song: Omit<SetlistSong, 'uid'> = { songId, arrangementId };
      if (key) song.performanceKey = key;
      if (notes) song.notes = notes;
      return [song];
    });
    return { name: data[1] || 'Shared setlist', date: data[2] || undefined, songs };
  } catch {
    return null;
  }
}

/** Absolute link for the current site, works under any GitHub Pages path. */
export function shareUrl(s: Pick<Setlist, 'name' | 'date' | 'songs'>, loc: { origin: string; pathname: string } = window.location): string {
  return `${loc.origin}${loc.pathname}#/shared?s=${encodeSetlist(s)}`;
}
