import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { allMusicians, allOriginalKeys, groupAlphabetically, rankSongs, searchSongs } from '../data/library';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions } from '../store/userStore';
import { SongCard } from '../components/SongCard';
import { EmptyState, PageHeader, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';

export default function LibraryPage() {
  const lib = useLibrary();
  const [params, setParams] = useSearchParams();
  const favourites = useUserData((d) => d.favourites);
  const update = useUpdate();

  const query = params.get('q') ?? '';
  const key = params.get('key') ?? '';
  const musician = params.get('musician') ?? '';
  const collection = params.get('collection') ?? '';
  const view = (params.get('view') as 'grid' | 'az') ?? 'grid';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const keys = useMemo(() => allOriginalKeys(lib), [lib]);
  const musicians = useMemo(() => allMusicians(lib), [lib]);
  const results = useMemo(
    () => rankSongs(searchSongs(lib.songs, { query, key: key || undefined, musician: musician || undefined, collection: collection || undefined }), query),
    [lib, query, key, musician, collection],
  );
  const groups = useMemo(() => (view === 'az' ? groupAlphabetically(results) : []), [results, view]);
  const filtered = !!(query || key || musician || collection);

  return (
    <div>
      <PageHeader
        eyebrow="Music Library"
        title="All songs"
        subtitle={`${lib.songs.length} songs · ${lib.songs.reduce((n, s) => n + s.arrangements.length, 0)} arrangements`}
        actions={<Link to="/songs/new" className="btn-outline"><Icon name="plus" size={17} /> Add a song</Link>}
      />

      <div className="sticky top-14 z-10 -mx-4 space-y-3 bg-bg/95 px-4 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <label className="relative block">
          <span className="sr-only">Search songs</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Search by title or lyric cue…"
            className="input h-12 pl-11 text-base"
            autoComplete="off"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Filter by key" value={key} onChange={(e) => set('key', e.target.value)} className="input h-9 w-auto pr-8 text-sm">
            <option value="">Any key</option>
            {keys.map((k) => <option key={k} value={k}>Key of {k}</option>)}
            <option value="none">Key not given</option>
          </select>
          <select aria-label="Filter by musician" value={musician} onChange={(e) => set('musician', e.target.value)} className="input h-9 w-auto pr-8 text-sm">
            <option value="">Any musician</option>
            {musicians.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select aria-label="Filter by list" value={collection} onChange={(e) => set('collection', e.target.value)} className="input h-9 w-auto pr-8 text-sm">
            <option value="">All lists</option>
            <option value="Song List">Song List</option>
            <option value="Today’s Songs">Today’s Songs</option>
            {lib.songs.some((x) => x.collection === 'Band additions') && <option value="Band additions">Added for the band</option>}
            {lib.songs.some((x) => x.collection === 'My songs') && <option value="My songs">My added songs</option>}
          </select>
          {filtered && (
            <button className="btn-quiet h-9 text-xs" onClick={() => setParams({ view }, { replace: true })}>
              <Icon name="x" size={14} /> Clear
            </button>
          )}
          <div className="ml-auto">
            <Segmented
              label="View"
              value={view}
              onChange={(v) => set('view', v === 'grid' ? '' : v)}
              options={[{ value: 'grid', label: 'Cards' }, { value: 'az', label: 'A–Z' }]}
            />
          </div>
        </div>
      </div>

      <p className="mb-3 mt-1 text-xs text-muted" aria-live="polite">
        {filtered ? `${results.length} ${results.length === 1 ? 'song matches' : 'songs match'}` : 'Showing every song'}
      </p>

      {results.length === 0 ? (
        <EmptyState icon="search" title="No songs found" action={<button className="btn-outline" onClick={() => setParams({}, { replace: true })}>Clear search</button>}>
          Try part of the title, or a lyric cue such as “Hallelujah”.
        </EmptyState>
      ) : view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => (
            <SongCard key={s.id} song={s} favourite={favourites.includes(s.id)} onToggleFavourite={() => update(actions.toggleFavourite(s.id))} />
          ))}
        </div>
      ) : (
        <AZ groups={groups} favourites={favourites} onToggle={(id) => update(actions.toggleFavourite(id))} />
      )}
    </div>
  );
}

function AZ({ groups, favourites, onToggle }: { groups: ReturnType<typeof groupAlphabetically>; favourites: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-6">
      <div className="space-y-6">
        {groups.map(([letter, songs]) => (
          <section key={letter} id={`letter-${letter}`} className="scroll-mt-40">
            <h2 className="mb-2 font-display text-xl font-semibold text-accent">{letter}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {songs.map((s) => <SongCard key={s.id} song={s} favourite={favourites.includes(s.id)} onToggleFavourite={() => onToggle(s.id)} />)}
            </div>
          </section>
        ))}
      </div>
      <nav aria-label="Jump to letter" className="sticky top-40 hidden h-fit flex-col gap-0.5 lg:flex">
        {groups.map(([l]) => (
          <a key={l} href={`#letter-${l}`} onClick={(e) => { e.preventDefault(); document.getElementById(`letter-${l}`)?.scrollIntoView({ behavior: 'smooth' }); }}
            className="grid h-6 w-6 place-items-center rounded text-xs font-semibold text-muted hover:bg-sunken hover:text-ink">{l}</a>
        ))}
      </nav>
    </div>
  );
}
