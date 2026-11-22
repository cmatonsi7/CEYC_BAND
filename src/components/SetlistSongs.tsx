import { Link } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { arrangementLabel, findSong } from '../data/library';
import type { SetlistSong } from '../data/types';

/** Read-only list of a setlist's songs, with arrangement, key and the MD's notes. */
export function SetlistSongs({ songs, performBase }: { songs: Pick<SetlistSong, 'songId' | 'arrangementId' | 'performanceKey' | 'notes'>[]; performBase?: string }) {
  const lib = useLibrary();
  return (
    <ol className="space-y-2">
      {songs.map((entry, i) => {
        const song = findSong(lib, entry.songId);
        const idx = song?.arrangements.findIndex((a) => a.id === entry.arrangementId) ?? -1;
        const arr = song && idx >= 0 ? song.arrangements[idx] : song?.arrangements[0];
        return (
          <li key={i} className="card flex items-start gap-3 p-4">
            <span className="w-6 pt-0.5 text-right text-sm font-semibold tabular-nums text-faint">{i + 1}</span>
            <div className="min-w-0 flex-1">
              {song ? (
                <Link to={`/song/${song.id}?a=${encodeURIComponent(arr!.id)}`} className="font-semibold hover:text-accent">{song.title}</Link>
              ) : (
                <span className="font-semibold text-muted">Song not in this version of the library</span>
              )}
              <p className="mt-0.5 text-sm text-muted">
                {[song && song.arrangements.length > 1 && arr ? arrangementLabel(arr, Math.max(idx, 0)) : '',
                  entry.performanceKey ? `Key ${entry.performanceKey}` : arr?.originalKey ? `Key ${arr.originalKey}` : 'No key'].filter(Boolean).join(' · ')}
              </p>
              {entry.notes && <p className="mt-1.5 rounded-lg bg-accent-soft px-2.5 py-1.5 text-sm text-accent">{entry.notes}</p>}
            </div>
            {performBase && song && (
              <Link to={`${performBase}${performBase.includes('?') ? '&' : '?'}i=${i}`} className="icon-btn h-9 w-9 shrink-0" aria-label={`Perform from ${song.title}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 4.5v15l12-7.5z" /></svg>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function formatServiceDate(date: string | undefined, long = false): string {
  if (!date) return '';
  return new Date(date + 'T00:00').toLocaleDateString(undefined, long
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { weekday: 'short', day: 'numeric', month: 'short' });
}
