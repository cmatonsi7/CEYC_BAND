import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { allMusicians, songFlagCount } from '../data/library';
import { useUserData } from '../store/UserDataProvider';
import { SongRow } from '../components/SongCard';
import { Icon } from '../components/Icon';

export default function HomePage() {
  const lib = useLibrary();
  const user = useUserData();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const recent = user.recent.map((r) => lib.songs.find((s) => s.id === r.songId)).filter(Boolean).slice(0, 6);
  const favs = user.favourites.map((id) => lib.songs.find((s) => s.id === id)).filter(Boolean).slice(0, 6);
  const nextSetlists = [...user.setlists].sort((a, b) => (b.date ?? b.updatedAt).localeCompare(a.date ?? a.updatedAt)).slice(0, 3);
  const arrangements = lib.songs.reduce((n, s) => n + s.arrangements.length, 0);
  const flagged = lib.songs.filter((s) => songFlagCount(s) > 0).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-up space-y-8">
      <section className="pt-2">
        <p className="eyebrow mb-2">{greeting}</p>
        <h1 className="max-w-2xl font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
          The band’s progressions, ready for rehearsal and service.
        </h1>
        <form
          className="relative mt-6 max-w-xl"
          onSubmit={(e) => { e.preventDefault(); navigate(`/library${q ? `?q=${encodeURIComponent(q)}` : ''}`); }}
          role="search"
        >
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${lib.songs.length} songs…`} className="input h-12 rounded-2xl pl-11 text-base" aria-label="Search songs" />
        </form>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat to="/library" value={lib.songs.length} label="Songs" />
        <Stat to="/library" value={arrangements} label="Arrangements" />
        <Stat to="/library" value={allMusicians(lib).length} label="Musicians" />
        <Stat to="/accompaniment" value={lib.accompaniment.filter((a) => a.progression).length} label="Service progressions" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recently viewed" icon="clock" to="/library" linkLabel="Library">
          {recent.length ? recent.map((s) => <SongRow key={s!.id} song={s!} />) : <Empty>Songs you open will show up here.</Empty>}
        </Panel>
        <Panel title="Favourites" icon="heart" to="/favourites" linkLabel="All favourites">
          {favs.length ? favs.map((s) => <SongRow key={s!.id} song={s!} />) : <Empty>Tap the heart on a song to keep it here.</Empty>}
        </Panel>
        <Panel title="Setlists" icon="list" to="/setlists" linkLabel="All setlists">
          {nextSetlists.length ? nextSetlists.map((s) => (
            <Link key={s.id} to={`/setlists/${s.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sunken">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent"><Icon name="list" size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{s.name}</span>
                <span className="block text-xs text-muted">{s.songs.length} songs{s.date ? ` · ${new Date(s.date + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}</span>
              </span>
              <Icon name="chevronRight" size={16} className="text-faint" />
            </Link>
          )) : <Empty>Build the order of service and perform it straight through. <Link to="/setlists" className="text-accent underline">Create one</Link>.</Empty>}
        </Panel>
        <Panel title="Needs checking" icon="flag" to="/review" linkLabel="Review list">
          <p className="px-3 py-2 text-sm text-muted">
            {flagged} songs have notes where the PDF is unclear (missing keys, run-together numbers, typos). Nothing was guessed: each one is flagged so the band can confirm it.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ value, label, to }: { value: number; label: string; to: string }) {
  return (
    <Link to={to} className="card px-4 py-3.5 transition-colors hover:border-ink/25">
      <span className="block font-display text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </Link>
  );
}

function Panel({ title, icon, to, linkLabel, children }: { title: string; icon: Parameters<typeof Icon>[0]['name']; to: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section className="card p-2">
      <header className="flex items-center justify-between px-3 pb-1 pt-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Icon name={icon} size={16} className="text-muted" /> {title}</h2>
        <Link to={to} className="text-xs font-medium text-muted hover:text-ink">{linkLabel}</Link>
      </header>
      <div>{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-4 text-sm text-faint">{children}</p>;
}
