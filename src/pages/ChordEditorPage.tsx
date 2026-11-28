import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLibrary, useLibraryState } from '../data/LibraryProvider';
import { arrangementLabel, findSong, resolveSection } from '../data/library';
import type { Song } from '../data/types';
import { useBand } from '../band/BandProvider';
import { isAddedSong } from '../band/customSongs';
import { chordEditRecord, diffChordEdits, hasEdits } from '../band/chordEdits';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions } from '../store/userStore';
import { allKeys, keyToString, parseKey } from '../music';
import { Progression } from '../components/Progression';
import { NotationSwitch } from '../components/NotationSwitch';
import { KIND_STYLE } from '../components/SectionCard';
import { BackLink, EmptyState, PageHeader } from '../components/ui';
import { BandUnlock } from '../components/BandUnlock';
import { Icon } from '../components/Icon';

const KEYS = [...allKeys('major'), ...allKeys('minor')].map(keyToString);

type Draft = Record<string, { key: string; sections: Record<string, string> }>;

function toDraft(song: Song): Draft {
  return Object.fromEntries(song.arrangements.map((a) => [a.id, {
    key: a.originalKey ?? '',
    sections: Object.fromEntries(a.sections.map((s) => [s.id, s.progression ?? ''])),
  }]));
}

/** Change the chords (numbers) and key of a song from the PDF. The PDF text itself is never changed. */
export default function ChordEditorPage() {
  const { songId = '' } = useParams();
  const lib = useLibrary();
  const { state } = useLibraryState();
  const song = findSong(lib, songId);
  const original = state.status === 'ready' ? state.library.songs.find((s) => s.id === songId) : undefined;
  if (song && isAddedSong(song)) return <Navigate to={`/song/${song.id}/edit`} replace />;
  if (!song || !original) {
    return <EmptyState icon="music" title="Song not found" action={<Link to="/library" className="btn-outline">Back to the library</Link>}>It may have been renamed.</EmptyState>;
  }
  return <ChordForm key={song.id + (song.chordsEdited?.at ?? '')} song={song} original={original} />;
}

function ChordForm({ song, original }: { song: Song; original: Song }) {
  const band = useBand();
  const update = useUpdate();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const notation = useUserData((d) => d.settings.notation);
  const deviceEdits = useUserData((d) => d.chordEdits[song.id]);
  const [draft, setDraft] = useState<Draft>(() => toDraft(song));
  const [where, setWhere] = useState<'band' | 'device'>(() => (hasEdits(deviceEdits) || !band.enabled ? 'device' : 'band'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bandSave = where === 'band';
  const needsPin = bandSave && !band.canEdit;
  const focusArr = params.get('a');
  const arrangements = useMemo(() => {
    const list = [...song.arrangements];
    const i = list.findIndex((a) => a.id === focusArr);
    if (i > 0) list.unshift(...list.splice(i, 1));
    return list;
  }, [song, focusArr]);

  const edits = useMemo(() => diffChordEdits(original, draft), [original, draft]);
  const changedFromPdf = hasEdits(edits);
  const backTo = `/song/${song.id}${focusArr ? `?a=${encodeURIComponent(focusArr)}` : ''}`;

  const setSection = (aid: string, sid: string, v: string) => setDraft((d) => ({ ...d, [aid]: { ...d[aid], sections: { ...d[aid].sections, [sid]: v } } }));
  const setKey = (aid: string, v: string) => setDraft((d) => ({ ...d, [aid]: { ...d[aid], key: v } }));

  const persist = async (next: typeof edits | null, toBand = bandSave) => {
    setBusy(true);
    setError(null);
    try {
      if (toBand) {
        if (next) await band.saveSong(chordEditRecord(original, next));
        else if (band.songs.some((s) => s.id === song.id)) await band.deleteSong(song.id);
        // The band copy is now the one to follow, so drop any older copy on this phone.
        if (hasEdits(deviceEdits)) update(actions.setChordEdits(song.id, null));
      } else {
        update(actions.setChordEdits(song.id, next));
      }
      navigate(backTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  // Not a <form>: the band PIN box below is its own form, and forms can't be nested.
  const save = () => {
    persist(changedFromPdf ? edits : null);
  };

  return (
    <div className="max-w-3xl animate-fade-up">
      <BackLink to={backTo}>{song.title}</BackLink>
      <PageHeader eyebrow="Edit chords" title={song.title}
        subtitle="Change the numbers for any section. The PDF text stays as it was, so you can always see the original." />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">Write numbers like <code>1 4 5 6</code>, <code>2,3</code> for a passing chord into 3, <code>4/5</code> for a slash chord, <code>6#</code> for 6 sharp, and <code>|</code> between bars.</p>
        <NotationSwitch />
      </div>

      <div className="space-y-6">
        {arrangements.map((a) => {
          const i = song.arrangements.indexOf(a);
          const pdfA = original.arrangements.find((x) => x.id === a.id);
          const d = draft[a.id];
          const key = parseKey(d.key);
          return (
            <section key={a.id} aria-label={arrangementLabel(a, i) || 'Arrangement'}>
              <div className="card mb-3 flex flex-wrap items-end gap-3 p-4">
                {song.arrangements.length > 1 && <h2 className="w-full font-semibold">{arrangementLabel(a, i)}</h2>}
                <div>
                  <label htmlFor={`key-${a.id}`} className="mb-1.5 block text-sm font-medium">Key the numbers are in</label>
                  <select id={`key-${a.id}`} value={d.key} onChange={(e) => setKey(a.id, e.target.value)} className="input w-40">
                    <option value="">No key</option>
                    {!KEYS.includes(d.key) && d.key && <option value={d.key}>{d.key}</option>}
                    {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <p className="pb-2 text-xs text-faint">PDF key line: {pdfA?.keyText || 'not written'}</p>
              </div>
              <ol className="space-y-3">
                {a.sections.map((s) => {
                  const value = d.sections[s.id] ?? '';
                  const pdf = pdfA?.sections.find((x) => x.id === s.id)?.progression ?? '';
                  const changed = value.trim() !== pdf.trim();
                  const target = resolveSection(a, s);
                  return (
                    <li key={s.id} className={`card space-y-2 p-4 ${changed ? 'border-accent/60' : ''}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${KIND_STYLE[s.kind].dot}`} aria-hidden />
                        <label htmlFor={`p-${a.id}-${s.id}`} className="font-semibold">{s.name}</label>
                        {s.lyricCue && <span className="text-sm italic text-muted">“{s.lyricCue}”</span>}
                        {changed && <span className="rounded-md border border-accent/40 px-1.5 text-xs font-semibold text-accent">Changed</span>}
                        <span className="ml-auto text-xs text-faint">{s.page > 0 ? `p. ${s.page}` : ''}</span>
                      </div>
                      <textarea id={`p-${a.id}-${s.id}`} value={value} onChange={(e) => setSection(a.id, s.id, e.target.value)} rows={2}
                        className="input min-h-[4.5rem] py-2 font-mono text-sm"
                        placeholder={target ? `Same as ${target.name}. Type numbers here to play something different.` : 'No numbers yet, e.g. 1 5 6 4'} />
                      {value.trim() && (
                        <div className="rounded-xl bg-sunken px-3 py-2.5" aria-label={`Preview of ${s.name}`}>
                          <Progression text={value} keyCtx={s.key ? parseKey(s.key) : key} notation={notation} />
                        </div>
                      )}
                      {changed && (
                        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span>PDF: <code>{pdf || '(none)'}</code></span>
                          <button type="button" className="font-medium text-accent hover:underline" onClick={() => setSection(a.id, s.id, pdf)}>Undo</button>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="card mt-6 space-y-3 p-4 sm:p-5">
        {band.enabled ? (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Who should see these chords?</legend>
            <div className="flex flex-wrap gap-2">
              <Choice checked={bandSave} onChange={() => setWhere('band')} icon="users" label="The whole band" />
              <Choice checked={!bandSave} onChange={() => setWhere('device')} icon="music" label="Only me, on this device" />
            </div>
            {needsPin && <div className="mt-3 rounded-xl bg-sunken p-3"><BandUnlock /></div>}
          </fieldset>
        ) : <p className="text-xs text-faint">Saved on this device only.</p>}
      </div>

      {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} className="btn-primary" disabled={busy || needsPin}>
          <Icon name="check" size={16} /> {busy ? 'Saving…' : bandSave ? 'Save for the band' : 'Save on this device'}
        </button>
        <Link to={backTo} className="btn-quiet">Cancel</Link>
        {song.chordsEdited && (
          <button type="button" className="btn-quiet ml-auto" disabled={busy || (song.chordsEdited.by === 'band' && !band.canEdit)} onClick={() => persist(null, song.chordsEdited!.by === 'band')}>
            <Icon name="shuffle" size={16} /> Go back to the PDF chords
          </button>
        )}
      </div>
    </div>
  );
}

function Choice({ checked, onChange, icon, label }: { checked: boolean; onChange: () => void; icon: 'users' | 'music'; label: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${checked ? 'border-accent bg-accent-soft text-accent' : 'border-line hover:bg-sunken'}`}>
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <Icon name={icon} size={16} /> {label}
    </label>
  );
}
