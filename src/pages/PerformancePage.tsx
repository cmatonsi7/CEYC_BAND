import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { findArrangement, findSong, keyContext, playableProgression, resolveSection, sectionKey } from '../data/library';
import type { Arrangement, Library, Notation, Setlist, Song, UserData } from '../data/types';
import { useBand } from '../band/BandProvider';
import { NotationSwitch, nextNotation } from '../components/NotationSwitch';
import { decodeSetlist } from '../data/shareLink';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions } from '../store/userStore';
import { keyToString, renderMelody } from '../music';
import { Progression } from '../components/Progression';
import { KeyControl } from '../components/KeyControl';
import { Icon } from '../components/Icon';
import { useFullscreen } from '../hooks/useFullscreen';
import { useWakeLock } from '../hooks/useWakeLock';

interface Item {
  song: Song;
  arrangement: Arrangement;
  key: string | null;
  notes?: string;
}

function buildItems(lib: Library, mode: string, id: string, params: URLSearchParams, prefs: UserData, bandSetlists: Setlist[]): { items: Item[]; title: string; back: string } | null {
  if (mode === 'song') {
    const song = findSong(lib, id);
    if (!song) return null;
    const arr = findArrangement(song, params.get('a') ?? prefs.preferredArrangements[song.id]);
    return { items: [{ song, arrangement: arr, key: params.get('key') ?? prefs.preferredKeys[arr.id] ?? null }], title: song.title, back: `/song/${song.id}` };
  }
  const shared = mode === 'shared' ? decodeSetlist(params.get('s') ?? '') : null;
  const setlist = shared ?? (mode === 'band' ? bandSetlists : prefs.setlists).find((s) => s.id === id);
  if (!setlist) return null;
  const items: Item[] = [];
  for (const entry of setlist.songs) {
    const song = findSong(lib, entry.songId);
    if (!song) continue;
    const arrangement = findArrangement(song, entry.arrangementId);
    items.push({ song, arrangement, key: entry.performanceKey ?? null, notes: entry.notes });
  }
  return { items, title: setlist.name, back: shared ? `/shared?s=${params.get('s')}` : mode === 'band' ? `/band/${id}` : `/setlists/${id}` };
}

export default function PerformancePage() {
  const { mode = 'song', id = '' } = useParams();
  const [params] = useSearchParams();
  const lib = useLibrary();
  const prefs = useUserData();
  const update = useUpdate();
  const navigate = useNavigate();
  // Build once per route so edits elsewhere don't jump the musician's place.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const band = useBand();
  // A band setlist that hadn't loaded yet when the page opened is picked up once it arrives.
  const bandReady = mode === 'band' && band.setlists.some((s) => s.id === id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const built = useMemo(() => buildItems(lib, mode, id, params, prefs, band.setlists), [lib, mode, id, bandReady]);

  const [songIdx, setSongIdx] = useState(Number(params.get('i') ?? 0) || 0);
  const [secIdx, setSecIdx] = useState(0);
  const [keys, setKeys] = useState<(string | null)[]>(() => built?.items.map((i) => i.key) ?? []);
  useEffect(() => {
    if (built && built.items.length !== keys.length) setKeys(built.items.map((i) => i.key));
  }, [built]); // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState<'section' | 'full'>('section');
  const [showControls, setShowControls] = useState(() => window.innerWidth >= 640);
  const settings = prefs.settings;
  const scale = settings.performanceFontScale;
  const fs = useFullscreen();
  const wake = useWakeLock(settings.keepScreenOn);

  const item = built?.items[songIdx];
  const sections = item?.arrangement.sections ?? [];
  const section = sections[secIdx];

  const go = useCallback((dir: 1 | -1) => {
    if (!built) return;
    if (view === 'full') {
      const ni = songIdx + dir;
      if (ni >= 0 && ni < built.items.length) { setSongIdx(ni); setSecIdx(0); }
      return;
    }
    const ns = secIdx + dir;
    if (ns >= 0 && ns < sections.length) return setSecIdx(ns);
    const ni = songIdx + dir;
    if (ni >= 0 && ni < built.items.length) {
      setSongIdx(ni);
      setSecIdx(dir === 1 ? 0 : built.items[ni].arrangement.sections.length - 1);
    }
  }, [built, secIdx, sections.length, songIdx, view]);

  // Keyboard and Bluetooth page-turner pedals (they send arrows / PageUp / PageDown).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'n' || e.key === 'N') update(actions.updateSettings({ notation: nextNotation(settings.notation) }));
      else if (e.key === 'Escape' && !document.fullscreenElement) navigate(built?.back ?? '/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, navigate, built, settings.notation, update]);

  // Swipe left/right.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t || view === 'full') return;
    const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  if (!built || !item) {
    return (
      <div className="stage grid min-h-screen place-items-center bg-bg p-6 text-center text-ink">
        <div>
          <p className="text-lg font-semibold">{built ? 'This setlist has no songs yet.' : 'Nothing to perform here.'}</p>
          <Link to={built?.back ?? '/'} className="btn-outline mt-4">Go back</Link>
        </div>
      </div>
    );
  }

  const ctx = keyContext(item.arrangement, keys[songIdx]);
  const notation = settings.notation;
  const setKey = (k: string | null) => {
    setKeys((ks) => ks.map((x, i) => (i === songIdx ? k : x)));
    if (mode === 'song') update(actions.setPreferredKey(item.arrangement.id, k));
  };
  const isFirst = songIdx === 0 && (view === 'full' || secIdx === 0);
  const isLast = songIdx === built.items.length - 1 && (view === 'full' || secIdx === sections.length - 1);
  const nextLabel = view === 'section' && secIdx < sections.length - 1 ? sections[secIdx + 1].name : built.items[songIdx + 1]?.song.title;
  const prevLabel = view === 'section' && secIdx > 0 ? sections[secIdx - 1].name : built.items[songIdx - 1]?.song.title;
  const baseSize = `calc(${scale} * clamp(1.9rem, 5.6vw, 3.8rem))`;

  return (
    <div className="stage flex min-h-[100dvh] flex-col bg-bg text-ink" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-line px-3 py-2 sm:px-5">
        <Link to={built.back} className="icon-btn h-11 w-11" aria-label="Exit performance mode"><Icon name="x" size={22} /></Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold sm:text-lg">{item.song.title}</p>
          <p className="truncate text-xs text-muted">
            {built.items.length > 1 && <>Song {songIdx + 1} of {built.items.length} · </>}
            {[item.arrangement.label, ctx.viewing ? `Key ${keyToString(ctx.viewing)}` : 'No key chosen'].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          className="h-11 rounded-xl border border-line px-3 text-sm font-semibold text-accent"
          onClick={() => update(actions.updateSettings({ notation: nextNotation(notation) }))}
          aria-label={`Showing ${notation === 'nns' ? 'numbers' : notation}. Tap to switch`}
          title="Switch Numbers / Chords / Both (N)"
        >
          {notation === 'nns' ? '1 4 5' : notation === 'chords' ? 'C F G' : 'C/1'}
        </button>
        <button className="icon-btn h-11 w-11" onClick={() => setShowControls((s) => !s)} aria-expanded={showControls} aria-label="Show controls">
          <Icon name="settings" size={20} />
        </button>
      </header>

      {showControls && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2 sm:px-5">
          <NotationSwitch size="lg" tone="stage" />
          <KeyControl size="lg" written={item.arrangement.originalKey} value={keys[songIdx]} options={item.arrangement.keyOptions} onChange={setKey} />
          <div className="inline-flex h-12 items-center rounded-xl border border-line">
            <button className="grid h-12 w-12 place-items-center text-muted" aria-label="Smaller text" onClick={() => update(actions.updateSettings({ performanceFontScale: Math.max(0.6, +(scale - 0.1).toFixed(2)) }))}>
              <span className="text-sm font-bold">A−</span>
            </button>
            <span className="w-12 text-center text-sm tabular-nums text-muted">{Math.round(scale * 100)}%</span>
            <button className="grid h-12 w-12 place-items-center text-muted" aria-label="Larger text" onClick={() => update(actions.updateSettings({ performanceFontScale: Math.min(2.2, +(scale + 0.1).toFixed(2)) }))}>
              <span className="text-lg font-bold">A+</span>
            </button>
          </div>
          <div role="radiogroup" aria-label="Layout" className="inline-flex h-12 rounded-xl bg-sunken p-1">
            {(['section', 'full'] as const).map((v) => (
              <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)}
                className={`rounded-lg px-3 text-sm font-semibold ${view === v ? 'bg-surface text-ink' : 'text-muted'}`}>
                {v === 'section' ? 'One section' : 'Whole song'}
              </button>
            ))}
          </div>
          {fs.supported && (
            <button className="btn-outline h-12 border-line bg-transparent" onClick={fs.toggle}>
              <Icon name={fs.on ? 'minimize' : 'maximize'} size={18} /> {fs.on ? 'Exit full screen' : 'Full screen'}
            </button>
          )}
          <span className="ml-auto text-xs text-faint">
            {wake.supported ? (wake.active ? 'Screen stays on' : settings.keepScreenOn ? 'Screen lock: waiting' : 'Screen may sleep') : 'Screen wake lock not supported'}
          </span>
        </div>
      )}

      {/* Section strip */}
      {view === 'section' && (
        <nav aria-label="Sections" className="scrollbar-none flex gap-1.5 overflow-x-auto border-b border-line px-3 py-2 sm:px-5">
          {sections.map((s, i) => (
            <button key={s.id} onClick={() => setSecIdx(i)} aria-current={i === secIdx}
              className={`h-10 shrink-0 rounded-lg px-3 text-sm font-semibold ${i === secIdx ? 'bg-accent text-accent-ink' : 'bg-sunken text-muted'}`}>
              {s.name}
            </button>
          ))}
        </nav>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8" style={{ fontSize: baseSize }}>
        {item.notes && <p className="mb-4 rounded-xl bg-accent-soft px-4 py-2 text-[0.4em] font-medium text-accent">Setlist note: {item.notes}</p>}
        {view === 'section' && section ? (
          <StageSection key={`${songIdx}-${section.id}`} item={item} sectionId={section.id} ctx={ctx} notation={notation} />
        ) : (
          <div className="space-y-[1.1em]">
            {sections.map((s) => <StageSection key={s.id} item={item} sectionId={s.id} ctx={ctx} notation={notation} compact />)}
          </div>
        )}
      </main>

      {/* Bottom navigation — big touch targets */}
      <footer className="grid grid-cols-2 gap-2 border-t border-line p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button onClick={() => go(-1)} disabled={isFirst} className="flex h-16 items-center gap-2 rounded-2xl bg-sunken px-4 text-left disabled:opacity-30">
          <Icon name="chevronLeft" size={26} />
          <span className="min-w-0"><span className="block text-xs text-muted">Previous</span><span className="block truncate font-semibold">{prevLabel ?? '—'}</span></span>
        </button>
        <button onClick={() => go(1)} disabled={isLast} className="flex h-16 items-center justify-end gap-2 rounded-2xl bg-accent px-4 text-right text-accent-ink disabled:opacity-30">
          <span className="min-w-0"><span className="block text-xs opacity-70">Next</span><span className="block truncate font-semibold">{nextLabel ?? 'End'}</span></span>
          <Icon name="chevronRight" size={26} />
        </button>
      </footer>
    </div>
  );
}

function StageSection({ item, sectionId, ctx, notation, compact = false }: {
  item: Item; sectionId: string; ctx: ReturnType<typeof keyContext>; notation: Notation; compact?: boolean;
}) {
  const a = item.arrangement;
  const s = a.sections.find((x) => x.id === sectionId)!;
  const target = resolveSection(a, s);
  const key = sectionKey(ctx, s);
  const prog = playableProgression(a, s);
  const modulates = !!s.key && s.key !== a.originalKey;
  return (
    <section className={compact ? '' : 'animate-fade-up'}>
      <div className="mb-[0.3em] flex flex-wrap items-baseline gap-x-[0.4em] gap-y-1">
        <h2 className={`${compact ? 'text-[0.55em]' : 'text-[0.6em]'} font-bold uppercase tracking-wide text-muted`}>{s.name}</h2>
        {s.lyricCue && <span className="text-[0.45em] italic text-muted">“{s.lyricCue}”</span>}
        {modulates && key && <span className="rounded-md border border-accent px-[0.3em] text-[0.4em] font-bold text-accent">KEY {keyToString(key)}</span>}
        {target && <span className="text-[0.4em] text-faint">= {target.name}</span>}
      </div>
      {prog ? (
        <Progression text={prog} keyCtx={key} notation={notation} size="stage" />
      ) : !s.melody ? (
        <p className="text-[0.45em] italic text-faint">No progression written.</p>
      ) : null}
      {s.melody && (
        <p className="mt-[0.2em] font-semibold text-chord">
          <span className="mr-[0.3em] text-[0.45em] font-bold uppercase text-muted">Melody</span>
          {notation !== 'nns' && key ? renderMelody(s.melody, key) : s.melody}
        </p>
      )}
      {s.instructions?.length ? (
        <ul className="mt-[0.4em] space-y-[0.15em] border-l-4 border-accent pl-[0.4em] text-[0.42em] text-ink">
          {s.instructions.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      ) : null}
    </section>
  );
}
