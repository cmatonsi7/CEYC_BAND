import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBand } from '../band/BandProvider';
import { useUpdate } from '../store/UserDataProvider';
import { actions, setlistOps, uid } from '../store/userStore';
import type { Setlist } from '../data/types';
import { EmptyState, PageHeader, Spinner } from '../components/ui';
import { Icon } from '../components/Icon';
import { BandStatusLine } from '../components/BandStatus';
import { SetlistSongs, formatServiceDate } from '../components/SetlistSongs';
import { SetlistEditor } from './SetlistEditorPage';

/** A setlist the whole band sees. Editable with the band PIN, view-only otherwise. */
export default function BandSetlistPage() {
  const { id = '' } = useParams();
  const band = useBand();
  const setlist = band.setlists.find((s) => s.id === id);
  if (!setlist) {
    if (band.status === 'loading') return <Spinner label="Loading band setlists" />;
    return (
      <EmptyState icon="list" title="Band setlist not found" action={<Link to="/setlists" className="btn-outline">All setlists</Link>}>
        It may have been deleted by the MD.
      </EmptyState>
    );
  }
  return band.canEdit ? <BandEditor setlist={setlist} /> : <BandView setlist={setlist} />;
}

function useSaveCopy(setlist: Setlist) {
  const update = useUpdate();
  const navigate = useNavigate();
  return () => {
    const id = uid();
    update(actions.createSetlist(setlist.name, id));
    update(actions.updateSetlist(id, (s) => setlist.songs.reduce((acc, song) => setlistOps.add(song)(acc), setlistOps.setDate(setlist.date ?? '')(s))));
    navigate(`/setlists/${id}`);
  };
}

function BandView({ setlist }: { setlist: Setlist }) {
  const saveCopy = useSaveCopy(setlist);
  return (
    <div className="max-w-3xl animate-fade-up">
      <PageHeader
        eyebrow="Band setlist"
        title={setlist.name}
        subtitle={[formatServiceDate(setlist.date, true), `${setlist.songs.length} song${setlist.songs.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
        actions={
          <>
            <button className="btn-outline" onClick={saveCopy}><Icon name="copy" size={16} /> Save a copy</button>
            <Link to={`/perform/band/${setlist.id}`} className={`btn-primary ${setlist.songs.length ? '' : 'pointer-events-none opacity-40'}`}>
              <Icon name="play" size={15} filled /> Perform
            </Link>
          </>
        }
      />
      <div className="-mt-2 mb-4"><BandStatusLine /></div>
      {setlist.songs.length ? <SetlistSongs songs={setlist.songs} performBase={`/perform/band/${setlist.id}`} /> : <p className="text-muted">No songs yet. They’ll appear here as soon as the MD adds them.</p>}
      <p className="mt-4 text-xs text-faint">Only someone with the band PIN can change this setlist. To make your own version, save a copy.</p>
    </div>
  );
}

function BandEditor({ setlist }: { setlist: Setlist }) {
  const band = useBand();
  const navigate = useNavigate();
  const saveCopy = useSaveCopy(setlist);
  const [confirm, setConfirm] = useState(false);
  const remove = async () => {
    try {
      await band.deleteSetlist(setlist.id);
      navigate('/setlists');
    } catch { setConfirm(false); }
  };
  return (
    <SetlistEditor
      setlist={setlist}
      edit={(fn) => band.updateSetlist(setlist.id, fn)}
      back={{ to: '/setlists', label: 'Setlists' }}
      performBase={`/perform/band/${setlist.id}`}
      status={<BandStatusLine editing />}
      actions={
        <>
          <button className="btn-outline" onClick={saveCopy}><Icon name="copy" size={16} /> Copy to mine</button>
          {confirm ? (
            <span className="flex items-center gap-1">
              <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={remove}>Delete for everyone</button>
              <button className="btn-quiet" onClick={() => setConfirm(false)}>Cancel</button>
            </span>
          ) : (
            <button className="btn-outline" onClick={() => setConfirm(true)} aria-label="Delete band setlist"><Icon name="trash" size={16} /></button>
          )}
        </>
      }
    />
  );
}
