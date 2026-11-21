import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { decodeSetlist } from '../data/shareLink';
import { arrangementLabel, findSong } from '../data/library';
import { useUpdate } from '../store/UserDataProvider';
import { actions, setlistOps, uid } from '../store/userStore';
import { EmptyState, PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';

/** Read-only view of a setlist that someone shared by link. */
export default function SharedSetlistPage() {
  const [params] = useSearchParams();
  const code = params.get('s') ?? '';
  const shared = useMemo(() => decodeSetlist(code), [code]);
  const lib = useLibrary();
  const update = useUpdate();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  if (!shared) {
    return (
      <EmptyState icon="list" title="This share link doesn’t work" action={<Link to="/setlists" className="btn-outline">Go to setlists</Link>}>
        It may have been cut off when it was copied. Ask for the link again.
      </EmptyState>
    );
  }

  const saveCopy = () => {
    const id = uid();
    update(actions.createSetlist(shared.name, id));
    update(actions.updateSetlist(id, (s) => shared.songs.reduce((acc, song) => setlistOps.add(song)(acc), setlistOps.setDate(shared.date ?? '')(s))));
    setSaved(true);
    navigate(`/setlists/${id}`);
  };

  return (
    <div className="max-w-3xl animate-fade-up">
      <PageHeader
        eyebrow="Shared setlist · view only"
        title={shared.name}
        subtitle={[
          shared.date && new Date(shared.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          `${shared.songs.length} song${shared.songs.length === 1 ? '' : 's'}`,
        ].filter(Boolean).join(' · ')}
        actions={
          <>
            <button className="btn-outline" onClick={saveCopy} disabled={saved}><Icon name="copy" size={16} /> Save a copy</button>
            <Link to={`/perform/shared/view?s=${code}`} className={`btn-primary ${shared.songs.length ? '' : 'pointer-events-none opacity-40'}`}>
              <Icon name="play" size={15} filled /> Perform
            </Link>
          </>
        }
      />
      <ol className="space-y-2">
        {shared.songs.map((entry, i) => {
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
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-faint">This is a snapshot from when the link was made. If the setlist changes, ask for a new link.</p>
    </div>
  );
}
