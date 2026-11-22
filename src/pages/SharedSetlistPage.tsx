import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SetlistSongs } from '../components/SetlistSongs';
import { decodeSetlist } from '../data/shareLink';
import { useUpdate } from '../store/UserDataProvider';
import { actions, setlistOps, uid } from '../store/userStore';
import { EmptyState, PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';

/** Read-only view of a setlist that someone shared by link. */
export default function SharedSetlistPage() {
  const [params] = useSearchParams();
  const code = params.get('s') ?? '';
  const shared = useMemo(() => decodeSetlist(code), [code]);
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
      <SetlistSongs songs={shared.songs} />
      <p className="mt-4 text-xs text-faint">This is a snapshot from when the link was made. If the setlist changes, ask for a new link.</p>
    </div>
  );
}
