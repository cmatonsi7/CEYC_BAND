import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions, uid } from '../store/userStore';
import { useLibrary } from '../data/LibraryProvider';
import { EmptyState, PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';

export default function SetlistsPage() {
  const setlists = useUserData((d) => d.setlists);
  const update = useUpdate();
  const navigate = useNavigate();
  const lib = useLibrary();
  const [confirm, setConfirm] = useState<string | null>(null);

  const create = () => {
    const id = uid();
    update(actions.createSetlist('New setlist', id));
    navigate(`/setlists/${id}`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Setlists"
        title="Service setlists"
        subtitle="Saved on this device."
        actions={<button className="btn-primary" onClick={create}><Icon name="plus" size={17} /> New setlist</button>}
      />
      {setlists.length === 0 ? (
        <EmptyState icon="list" title="No setlists yet" action={<button className="btn-primary" onClick={create}><Icon name="plus" size={17} /> Create a setlist</button>}>
          Put together the songs for a service, set each song’s key and arrangement, then run it in Performance Mode.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {setlists.map((s) => {
            const titles = s.songs.map((x) => lib.songs.find((song) => song.id === x.songId)?.title).filter(Boolean);
            return (
              <li key={s.id} className="card flex flex-col p-4">
                <Link to={`/setlists/${s.id}`} className="group">
                  <h2 className="font-display text-lg font-semibold group-hover:text-accent">{s.name}</h2>
                  <p className="text-xs text-muted">
                    {s.date ? new Date(s.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' : ''}
                    {s.songs.length} song{s.songs.length === 1 ? '' : 's'} · edited {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink/80">{titles.length ? titles.join(' · ') : <span className="italic text-faint">Empty</span>}</p>
                </Link>
                <div className="mt-4 flex items-center gap-1">
                  <Link to={`/perform/setlist/${s.id}`} className={`btn-primary h-9 ${s.songs.length ? '' : 'pointer-events-none opacity-40'}`} aria-disabled={!s.songs.length}>
                    <Icon name="play" size={14} filled /> Perform
                  </Link>
                  <Link to={`/setlists/${s.id}`} className="btn-quiet h-9"><Icon name="edit" size={15} /> Edit</Link>
                  <button className="btn-quiet h-9" onClick={() => update(actions.duplicateSetlist(s.id))}><Icon name="copy" size={15} /> Duplicate</button>
                  {confirm === s.id ? (
                    <span className="ml-auto flex items-center gap-1">
                      <button className="btn h-9 bg-red-600 text-white hover:bg-red-700" onClick={() => { update(actions.deleteSetlist(s.id)); setConfirm(null); }}>Delete</button>
                      <button className="btn-quiet h-9" onClick={() => setConfirm(null)}>Cancel</button>
                    </span>
                  ) : (
                    <button className="icon-btn ml-auto h-9 w-9" aria-label={`Delete ${s.name}`} onClick={() => setConfirm(s.id)}><Icon name="trash" size={16} /></button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
