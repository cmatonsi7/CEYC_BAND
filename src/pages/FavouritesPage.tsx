import { Link } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions } from '../store/userStore';
import { SongCard, SongRow } from '../components/SongCard';
import { EmptyState, PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';

export default function FavouritesPage() {
  const lib = useLibrary();
  const user = useUserData();
  const update = useUpdate();
  const favs = user.favourites.map((id) => lib.songs.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);
  const noted = Object.keys(user.notes)
    .map((arrId) => {
      const song = lib.songs.find((s) => s.arrangements.some((a) => a.id === arrId));
      const arr = song?.arrangements.find((a) => a.id === arrId);
      return song && arr ? { song, arr, note: user.notes[arrId] } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const recent = user.recent.map((r) => lib.songs.find((s) => s.id === r.songId)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="space-y-10">
      <div>
        <PageHeader eyebrow="Favourites" title="Your songs" subtitle="Favourites, notes and recent songs are saved on this device." />
        {favs.length === 0 ? (
          <EmptyState icon="heart" title="No favourites yet" action={<Link to="/library" className="btn-outline">Browse the library</Link>}>
            Tap the heart on any song to keep it here.
          </EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {favs.map((s) => <SongCard key={s.id} song={s} favourite onToggleFavourite={() => update(actions.toggleFavourite(s.id))} />)}
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Icon name="note" size={17} /> My notes</h2>
        {noted.length === 0 ? (
          <p className="text-sm text-faint">Notes you add on a song page will be listed here.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {noted.map(({ song, arr, note }) => (
              <li key={arr.id}>
                <Link to={`/song/${song.id}?a=${encodeURIComponent(arr.id)}`} className="card block p-4 hover:border-ink/25">
                  <p className="font-semibold">{song.title} {arr.label && <span className="text-sm font-normal text-muted">· {arr.label}</span>}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-ink/80">{note}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Icon name="clock" size={17} /> Recently viewed</h2>
        {recent.length === 0 ? <p className="text-sm text-faint">Nothing yet.</p> : (
          <div className="card grid p-2 sm:grid-cols-2">{recent.slice(0, 10).map((s) => <SongRow key={s.id} song={s} />)}</div>
        )}
      </section>
    </div>
  );
}
