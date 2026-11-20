import { Link } from 'react-router-dom';
import type { Song } from '../data/types';
import { songKeys, songMusicians } from '../data/library';
import { Icon } from './Icon';
import { KeyBadge } from './ui';

export function SongCard({ song, favourite, onToggleFavourite }: { song: Song; favourite: boolean; onToggleFavourite: () => void }) {
  const keys = songKeys(song);
  const musicians = songMusicians(song);
  const n = song.arrangements.length;
  return (
    <div className="group card relative flex flex-col p-4 transition-colors hover:border-ink/25">
      <Link to={`/song/${song.id}`} className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" aria-label={song.title} />
      <div className="flex items-start gap-3">
        <h3 className="flex-1 font-display text-[1.125rem] font-semibold leading-snug tracking-tight">{song.title}</h3>
        <button
          onClick={onToggleFavourite}
          className={`relative z-10 -m-1.5 grid h-9 w-9 place-items-center rounded-lg transition-colors ${favourite ? 'text-accent' : 'text-faint hover:text-ink'}`}
          aria-label={favourite ? `Remove ${song.title} from favourites` : `Add ${song.title} to favourites`}
          aria-pressed={favourite}
        >
          <Icon name="heart" size={18} filled={favourite} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {keys.length ? keys.map((k) => <KeyBadge key={k} k={k} />) : <span className="text-xs text-faint">Key not given</span>}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Icon name="library" size={13} /> {n} arrangement{n === 1 ? '' : 's'}
        </span>
        {musicians.length > 0 && <span className="truncate">{musicians.join(' · ')}</span>}
        <span className="ml-auto text-faint">p. {song.sourcePages.join(', ')}</span>
      </div>
    </div>
  );
}

export function SongRow({ song, right }: { song: Song; right?: React.ReactNode }) {
  const keys = songKeys(song);
  return (
    <Link to={`/song/${song.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sunken">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sunken text-xs font-semibold text-muted">{keys[0] ?? '—'}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{song.title}</span>
        <span className="block truncate text-xs text-muted">
          {song.arrangements.length} arrangement{song.arrangements.length === 1 ? '' : 's'}
          {song.arrangements.some((a) => a.musicians.length) ? ` · ${songMusicians(song).join(', ')}` : ''}
        </span>
      </span>
      {right}
    </Link>
  );
}
