import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { arrangementLabel, findArrangement, findSong, keyContext } from '../data/library';
import type { Arrangement, Song } from '../data/types';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions, setlistOps, uid } from '../store/userStore';
import { keyToString } from '../music';
import { SectionCard, KIND_STYLE } from '../components/SectionCard';
import { KeyControl } from '../components/KeyControl';
import { BackLink, EmptyState, FlagList } from '../components/ui';
import { NotationSwitch } from '../components/NotationSwitch';
import { isAddedSong, pagesLabel } from '../band/customSongs';
import { sortBandSetlists, useBand } from '../band/BandProvider';
import { Icon } from '../components/Icon';

export default function SongPage() {
  const { songId = '' } = useParams();
  const lib = useLibrary();
  const song = findSong(lib, songId);
  const update = useUpdate();

  useEffect(() => {
    if (song) update(actions.markViewed(song.id));
  }, [song, update]);

  if (!song) {
    return (
      <EmptyState icon="music" title="Song not found" action={<Link className="btn-outline" to="/library">Back to the library</Link>}>
        This link may point to a song that has been renamed.
      </EmptyState>
    );
  }
  return <SongView song={song} />;
}

function SongView({ song }: { song: Song }) {
  const [params, setParams] = useSearchParams();
  const update = useUpdate();
  const user = useUserData();
  const arrangement = findArrangement(song, params.get('a') ?? user.preferredArrangements[song.id]);
  const chosenKey = user.preferredKeys[arrangement.id] ?? null;
  const ctx = useMemo(() => keyContext(arrangement, chosenKey), [arrangement, chosenKey]);
  const notation = user.settings.notation;
  const fav = user.favourites.includes(song.id);
  const navigate = useNavigate();

  const selectArrangement = (a: Arrangement) => {
    update(actions.setPreferredArrangement(song.id, a.id));
    const next = new URLSearchParams(params);
    next.set('a', a.id);
    setParams(next, { replace: true });
  };
  const setKey = (k: string | null) => update(actions.setPreferredKey(arrangement.id, k));
  const performUrl = `/perform/song/${song.id}?a=${encodeURIComponent(arrangement.id)}`;

  return (
    <div className="animate-fade-up">
      <BackLink to="/library">Library</BackLink>

      <header className="flex flex-wrap items-start gap-4 pb-4">
        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight sm:text-[2.5rem]">{song.title}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{song.collection}</span>
            <span>{pagesLabel(song.sourcePages)}</span>
            {song.aliases?.length ? <span className="text-faint">Also written “{song.aliases.join('”, “')}”</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className={`btn-outline ${fav ? 'text-accent' : ''}`} onClick={() => update(actions.toggleFavourite(song.id))} aria-pressed={fav}>
            <Icon name="heart" size={17} filled={fav} /> <span className="hidden sm:inline">{fav ? 'Favourite' : 'Favourite'}</span>
          </button>
          {isAddedSong(song)
            ? <Link to={`/song/${song.id}/edit`} className="btn-outline" aria-label="Edit song"><Icon name="edit" size={16} /> <span className="hidden sm:inline">Edit</span></Link>
            : <Link to={`/song/${song.id}/chords?a=${encodeURIComponent(arrangement.id)}`} className="btn-outline" aria-label="Edit chords"><Icon name="edit" size={16} /> <span className="hidden sm:inline">Edit chords</span></Link>}
          <AddToSetlist song={song} arrangement={arrangement} chosenKey={chosenKey} />
          <button className="btn-primary" onClick={() => navigate(performUrl)}>
            <Icon name="play" size={16} filled /> Perform
          </button>
        </div>
      </header>

      {song.chordsEdited && (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-sm text-ink/85">
          <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-accent" />
          <span className="flex-1">{song.chordsEdited.by === 'band' ? 'Chords updated for the band' : 'Chords changed on this device only'} since the PDF.</span>
          <Link to={`/song/${song.id}/chords?a=${encodeURIComponent(arrangement.id)}`} className="font-medium text-accent hover:underline">Edit</Link>
        </p>
      )}
      {song.flags?.length ? <div className="mb-4"><FlagList flags={song.flags} title="About this song" /></div> : null}

      {song.arrangements.length > 1 && (
        <div role="tablist" aria-label="Arrangements" className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {song.arrangements.map((a, i) => {
            const active = a.id === arrangement.id;
            return (
              <button
                key={a.id}
                role="tab"
                aria-selected={active}
                onClick={() => selectArrangement(a)}
                className={`flex shrink-0 flex-col items-start rounded-xl border px-3.5 py-2 text-left transition-colors ${active ? 'border-ink bg-ink text-bg' : 'border-line bg-surface hover:border-ink/30'}`}
              >
                <span className="text-sm font-semibold">{arrangementLabel(a, i)}</span>
                <span className={`text-xs ${active ? 'text-bg/70' : 'text-muted'}`}>
                  {a.originalKey ? `Key of ${a.originalKey}` : 'Key not given'} · {a.sections.length} sections
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="sticky top-14 z-10 -mx-4 mb-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <NotationSwitch />
          <KeyControl written={arrangement.originalKey} value={chosenKey} options={arrangement.keyOptions} onChange={setKey} />
          {arrangement.keyOptions?.filter((o, i, all) => all.findIndex((x) => x.key === o.key) === i || o.label !== 'LW key').map((o) => {
            const active = (chosenKey ?? arrangement.originalKey) === o.key;
            return (
              <button key={o.label + o.key} onClick={() => setKey(o.key === arrangement.originalKey ? null : o.key)}
                className={`chip h-10 rounded-xl px-3 text-sm ${active ? 'chip-on' : 'hover:border-ink/30 hover:text-ink'}`} aria-pressed={active}>
                {o.label} <b className="font-semibold">{o.key}</b>
              </button>
            );
          })}
          {notation !== 'nns' && !ctx.viewing && (
            <span className="text-xs text-warn">No key in the PDF: pick one to see chords.</span>
          )}
          {ctx.written && ctx.shift !== 0 && ctx.viewing && (
            <span className="text-xs text-muted">Written in {keyToString(ctx.written)}</span>
          )}
        </div>
        <nav aria-label="Sections" className="scrollbar-none -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1">
          {arrangement.sections.map((s) => (
            <a
              key={s.id}
              href={`#sec-${s.id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              className="chip shrink-0 hover:border-ink/30 hover:text-ink"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${KIND_STYLE[s.kind].dot}`} />
              {s.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {arrangement.sections.map((s) => (
            <SectionCard key={s.id} arrangement={arrangement} section={s} ctx={ctx} notation={notation} writtenKey={arrangement.originalKey} />
          ))}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-40 lg:h-fit">
          <ArrangementInfo arrangement={arrangement} />
          <PersonalNote arrangementId={arrangement.id} />
        </aside>
      </div>
    </div>
  );
}

function ArrangementInfo({ arrangement: a }: { arrangement: Arrangement }) {
  return (
    <div className="card space-y-3 p-4 text-sm">
      <div>
        <p className="eyebrow mb-1">Key line in the PDF</p>
        <p className="font-medium">{a.keyText || <span className="italic text-faint">Not written</span>}</p>
        {a.keyEdited && <p className="mt-1 text-xs text-accent">Key changed in the app to {a.originalKey ?? 'no key'} (PDF: {a.keyEdited.original ?? 'none'})</p>}
      </div>
      {a.musicians.length > 0 && (
        <div>
          <p className="eyebrow mb-1">Musician{a.musicians.length > 1 ? 's' : ''}</p>
          <p>{a.musicians.join(', ')}</p>
        </div>
      )}
      {a.keyOptions?.length ? (
        <div>
          <p className="eyebrow mb-1">Keys listed</p>
          <ul className="space-y-0.5">{a.keyOptions.map((o) => <li key={o.label + o.key}>{o.label}: <b>{o.key}</b></li>)}</ul>
        </div>
      ) : null}
      {a.modulationNotes?.length ? (
        <div>
          <p className="eyebrow mb-1">Key changes</p>
          <ul className="space-y-1">{a.modulationNotes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      ) : null}
      {a.performanceNotes?.length ? (
        <div>
          <p className="eyebrow mb-1">Performance notes</p>
          <ul className="space-y-1">{a.performanceNotes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      ) : null}
      <div>
        <p className="eyebrow mb-1">Source</p>
        <p>{pagesLabel(a.sourcePages)}</p>
      </div>
      {a.flags?.length ? <FlagList flags={a.flags} /> : null}
    </div>
  );
}

function PersonalNote({ arrangementId }: { arrangementId: string }) {
  const saved = useUserData((d) => d.notes[arrangementId] ?? '');
  const update = useUpdate();
  const [text, setText] = useState(saved);
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');
  const timer = useRef<number>();
  useEffect(() => { setText(saved); }, [arrangementId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (v: string) => {
    setText(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      update(actions.setNote(arrangementId, v));
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 1200);
    }, 400);
  };

  return (
    <div className="card p-4">
      <label htmlFor="note" className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold"><Icon name="note" size={16} /> My notes</span>
        <span className="text-xs text-faint" aria-live="polite">{status === 'saved' ? 'Saved' : 'On this device'}</span>
      </label>
      <textarea
        id="note"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Voicings, cues, who starts…"
        className="input h-auto min-h-[6rem] resize-y py-2 leading-relaxed"
      />
    </div>
  );
}

function AddToSetlist({ song, arrangement, chosenKey }: { song: Song; arrangement: Arrangement; chosenKey: string | null }) {
  const setlists = useUserData((d) => d.setlists);
  const band = useBand();
  const bandLists = band.canEdit ? sortBandSetlists(band.setlists).slice(0, 6) : [];
  const update = useUpdate();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const entry = { songId: song.id, arrangementId: arrangement.id, performanceKey: chosenKey ?? arrangement.originalKey ?? undefined };
  const addTo = (id: string, name: string) => {
    update(actions.updateSetlist(id, setlistOps.add(entry)));
    setDone(name);
    setOpen(false);
    window.setTimeout(() => setDone(null), 2000);
  };
  const addToBand = (id: string, name: string) => {
    band.updateSetlist(id, setlistOps.add(entry));
    setDone(name);
    setOpen(false);
    window.setTimeout(() => setDone(null), 2000);
  };
  const createAndAdd = () => {
    const id = uid();
    const name = `Service ${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
    update(actions.createSetlist(name, id));
    addTo(id, name);
  };

  return (
    <div ref={ref} className="relative">
      <button className="btn-outline" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Add to setlist">
        <Icon name={done ? 'check' : 'plus'} size={17} /> <span className="hidden sm:inline">{done ? 'Added' : 'Setlist'}</span>
      </button>
      {done && <span className="sr-only" role="status">Added to {done}</span>}
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] animate-fade-up">
          {bandLists.length > 0 && (
            <>
              <p className="eyebrow px-2 pb-1.5 pt-1">Band setlists</p>
              {bandLists.map((s) => (
                <button key={s.id} role="menuitem" onClick={() => addToBand(s.id, s.name)} className="flex h-9 w-full items-center justify-between rounded-lg px-2 text-left text-sm hover:bg-sunken">
                  <span className="flex min-w-0 items-center gap-1.5 truncate"><Icon name="users" size={14} className="shrink-0 text-accent" />{s.name}</span>
                  <span className="text-xs text-faint">{s.songs.length}</span>
                </button>
              ))}
              <div className="my-1.5 border-t border-line" />
            </>
          )}
          <p className="eyebrow px-2 pb-1.5 pt-1">{bandLists.length ? 'My setlists' : 'Add to setlist'}</p>
          {setlists.map((s) => (
            <button key={s.id} role="menuitem" onClick={() => addTo(s.id, s.name)} className="flex h-9 w-full items-center justify-between rounded-lg px-2 text-left text-sm hover:bg-sunken">
              <span className="truncate">{s.name}</span>
              <span className="text-xs text-faint">{s.songs.length}</span>
            </button>
          ))}
          <button role="menuitem" onClick={createAndAdd} className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm font-medium text-accent hover:bg-sunken">
            <Icon name="plus" size={15} /> New setlist
          </button>
        </div>
      )}
    </div>
  );
}
