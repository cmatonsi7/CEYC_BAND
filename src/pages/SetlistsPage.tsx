import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions, uid } from '../store/userStore';
import { useLibrary } from '../data/LibraryProvider';
import { EmptyState, PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';
import { ShareButton } from '../components/ShareButton';
import { localToday, sortBandSetlists, useBand } from '../band/BandProvider';
import { BandStatusLine } from '../components/BandStatus';
import { BandUnlock } from '../components/BandUnlock';
import { formatServiceDate } from '../components/SetlistSongs';
import type { Setlist } from '../data/types';

function nextSunday(d = new Date()): string {
  const x = new Date(d);
  x.setDate(x.getDate() + ((7 - x.getDay()) % 7));
  return localToday(x);
}

export default function SetlistsPage() {
  const setlists = useUserData((d) => d.setlists);
  const update = useUpdate();
  const navigate = useNavigate();
  const lib = useLibrary();
  const [confirm, setConfirm] = useState<string | null>(null);
  const band = useBand();
  const bandLists = sortBandSetlists(band.setlists);
  const [unlocking, setUnlocking] = useState(false);
  const [bandError, setBandError] = useState<string | null>(null);

  const createBand = async () => {
    const id = uid();
    const at = new Date().toISOString();
    setBandError(null);
    try {
      await band.publishSetlist({ id, name: 'Sunday service', date: nextSunday(), songs: [], createdAt: at, updatedAt: at });
      navigate(`/band/${id}`);
    } catch (e) {
      setBandError(e instanceof Error ? e.message : String(e));
    }
  };

  const create = () => {
    const id = uid();
    update(actions.createSetlist('New setlist', id));
    navigate(`/setlists/${id}`);
  };

  const titlesOf = (s: Setlist) => s.songs.map((x) => lib.songs.find((song) => song.id === x.songId)?.title).filter(Boolean).join(' · ');

  return (
    <div>
      <PageHeader
        eyebrow="Setlists"
        title="Service setlists"
        subtitle={band.enabled ? 'Band setlists are shared with everyone. Yours stay on this device.' : 'Saved on this device.'}
        actions={
          <>
            {band.canEdit && <button className="btn-primary" onClick={createBand}><Icon name="users" size={17} /> New band setlist</button>}
            <button className={band.canEdit ? 'btn-outline' : 'btn-primary'} onClick={create}><Icon name="plus" size={17} /> {band.canEdit ? 'New personal setlist' : 'New setlist'}</button>
          </>
        }
      />
      {band.enabled && (
        <section className="mb-8" aria-labelledby="band-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="band-heading" className="flex items-center gap-2 font-display text-xl font-semibold"><Icon name="users" size={19} className="text-accent" /> Band setlists</h2>
              <BandStatusLine />
            </div>
            {!band.canEdit && !unlocking && <button className="btn-quiet h-9 text-sm" onClick={() => setUnlocking(true)}><Icon name="lock" size={15} /> I’m the MD</button>}
          </div>
          {unlocking && !band.canEdit && <div className="card mb-3 p-4"><BandUnlock onDone={() => setUnlocking(false)} /></div>}
          {bandError && <p className="mb-3 text-sm text-red-600" role="alert">{bandError}</p>}
          {bandLists.length === 0 ? (
            <p className="card p-4 text-sm text-muted">{band.status === 'loading' ? 'Loading…' : 'No band setlists yet. When the MD makes one, it shows up here on everyone’s phone.'}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {bandLists.map((s, i) => (
                <li key={s.id} className={`card flex flex-col p-4 ${i === 0 && s.date && s.date >= localToday() ? 'ring-2 ring-accent/40' : ''}`}>
                  <Link to={`/band/${s.id}`} className="group">
                    {i === 0 && s.date && s.date >= localToday() && <p className="eyebrow mb-1 text-accent">Next service</p>}
                    <h3 className="font-display text-lg font-semibold group-hover:text-accent">{s.name}</h3>
                    <p className="text-xs text-muted">{[formatServiceDate(s.date), `${s.songs.length} song${s.songs.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-ink/80">{titlesOf(s) || <span className="italic text-faint">Empty</span>}</p>
                  </Link>
                  <div className="mt-4 flex flex-wrap items-center gap-1">
                    <Link to={`/perform/band/${s.id}`} className={`btn-primary h-9 ${s.songs.length ? '' : 'pointer-events-none opacity-40'}`}><Icon name="play" size={14} filled /> Perform</Link>
                    <Link to={`/band/${s.id}`} className="btn-quiet h-9"><Icon name={band.canEdit ? 'edit' : 'list'} size={15} /> {band.canEdit ? 'Edit' : 'View'}</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {band.enabled && <h2 className="mb-3 font-display text-xl font-semibold">My setlists <span className="text-sm font-normal text-faint">on this device</span></h2>}
      {setlists.length === 0 ? (
        <EmptyState icon="list" title="No setlists yet" action={<button className="btn-primary" onClick={create}><Icon name="plus" size={17} /> Create a setlist</button>}>
          Put together the songs for a service, set each song’s key and arrangement, then run it in Performance Mode.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {setlists.map((s) => {
            const titles = titlesOf(s);
            return (
              <li key={s.id} className="card flex flex-col p-4">
                <Link to={`/setlists/${s.id}`} className="group">
                  <h2 className="font-display text-lg font-semibold group-hover:text-accent">{s.name}</h2>
                  <p className="text-xs text-muted">
                    {s.date ? new Date(s.date + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' : ''}
                    {s.songs.length} song{s.songs.length === 1 ? '' : 's'} · edited {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink/80">{titles || <span className="italic text-faint">Empty</span>}</p>
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-1">
                  <Link to={`/perform/setlist/${s.id}`} className={`btn-primary h-9 ${s.songs.length ? '' : 'pointer-events-none opacity-40'}`} aria-disabled={!s.songs.length}>
                    <Icon name="play" size={14} filled /> Perform
                  </Link>
                  <Link to={`/setlists/${s.id}`} className="btn-quiet h-9"><Icon name="edit" size={15} /> Edit</Link>
                  <ShareButton setlist={s} compact />
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
