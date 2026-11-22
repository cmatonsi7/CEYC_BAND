import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { findSong } from '../data/library';
import type { SectionKind, Song } from '../data/types';
import { useBand } from '../band/BandProvider';
import { draftToSong, emptyDraft, isAddedSong, newSongId, songToDraft, type SongDraft } from '../band/customSongs';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions } from '../store/userStore';
import { allKeys, keyToString, parseKey } from '../music';
import { Progression } from '../components/Progression';
import { NotationSwitch } from '../components/NotationSwitch';
import { KIND_STYLE } from '../components/SectionCard';
import { BackLink, EmptyState, PageHeader } from '../components/ui';
import { BandUnlock } from '../components/BandUnlock';
import { Icon } from '../components/Icon';

const KINDS: SectionKind[] = ['intro', 'verse', 'prechorus', 'chorus', 'bridge', 'interlude', 'outro', 'melody', 'other'];
const KEYS = [...allKeys('major'), ...allKeys('minor')].map(keyToString);

/** Add a song that isn't in the PDF, or edit one added earlier. PDF songs can't be edited here. */
export default function SongEditorPage() {
  const { songId } = useParams();
  const lib = useLibrary();
  if (!songId) return <SongForm />;
  const song = findSong(lib, songId);
  if (!song || !isAddedSong(song)) {
    return (
      <EmptyState icon="music" title={song ? 'Songs from the PDF can’t be edited here' : 'Song not found'} action={<Link to={song ? `/song/${song.id}` : '/library'} className="btn-outline">Go back</Link>}>
        {song ? 'They’re kept exactly as written in the PDF. Add a personal note on the song page instead.' : 'It may have been deleted.'}
      </EmptyState>
    );
  }
  return <SongForm existing={song} />;
}

function SongForm({ existing }: { existing?: Song }) {
  const band = useBand();
  const update = useUpdate();
  const navigate = useNavigate();
  const notation = useUserData((d) => d.settings.notation);
  const [draft, setDraft] = useState<SongDraft>(() => (existing ? songToDraft(existing) : emptyDraft()));
  const [where, setWhere] = useState<'band' | 'device'>(existing ? (existing.collection === 'Band additions' ? 'band' : 'device') : band.canEdit ? 'band' : 'device');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const key = parseKey(draft.key);
  const set = (p: Partial<SongDraft>) => setDraft((d) => ({ ...d, ...p }));
  const setSection = (i: number, p: Partial<SongDraft['sections'][number]>) => setDraft((d) => ({ ...d, sections: d.sections.map((s, j) => (j === i ? { ...s, ...p } : s)) }));
  const moveSection = (i: number, to: number) => setDraft((d) => {
    const sections = [...d.sections];
    const [x] = sections.splice(i, 1);
    sections.splice(to, 0, x);
    return { ...d, sections };
  });
  const bandSong = where === 'band';
  const needsPin = bandSong && !band.canEdit;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return setError('Give the song a title.');
    setBusy(true);
    setError(null);
    const id = existing?.id ?? newSongId(draft.title);
    const song = draftToSong(draft, id, bandSong ? 'Band additions' : 'My songs');
    try {
      if (bandSong) await band.saveSong(song);
      else update(actions.saveCustomSong(song));
      navigate(`/song/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    try {
      if (existing.collection === 'Band additions') await band.deleteSong(existing.id);
      else update(actions.deleteCustomSong(existing.id));
      navigate('/library', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl animate-fade-up">
      <BackLink to={existing ? `/song/${existing.id}` : '/library'}>{existing ? existing.title : 'Library'}</BackLink>
      <PageHeader eyebrow={existing ? 'Edit song' : 'Add a song'} title={existing ? 'Edit song' : 'Add a song'}
        subtitle="For songs that aren’t in the PDF. Write the numbers the way the band does; nothing is filled in for you." />

      <div className="card space-y-4 p-4 sm:p-5">
        <Field label="Title" htmlFor="song-title">
          <input id="song-title" required value={draft.title} onChange={(e) => set({ title: e.target.value })} className="input" placeholder="e.g. Great Are You Lord" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Key the numbers are in" htmlFor="song-key" hint="Leave blank if you’re not sure. Numbers still show; chords need a key.">
            <select id="song-key" value={draft.key} onChange={(e) => set({ key: e.target.value })} className="input">
              <option value="">No key yet</option>
              {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Musician (optional)" htmlFor="song-musician">
            <input id="song-musician" value={draft.musician} onChange={(e) => set({ musician: e.target.value })} className="input" placeholder="e.g. Tawa" />
          </Field>
        </div>
      </div>

      <div className="mb-2 mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Sections</h2>
        <NotationSwitch />
      </div>
      <p className="mb-3 text-xs text-muted">Write numbers like <code>1 4 5 6</code>, <code>2,3</code> for a passing chord into 3, <code>4/5</code> for a slash chord, <code>6#</code> for 6 sharp, and <code>|</code> between bars. The preview shows how the band will see it.</p>
      <ol className="space-y-3">
        {draft.sections.map((s, i) => (
          <li key={i} className="card space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${KIND_STYLE[s.kind].dot}`} aria-hidden />
              <label className="sr-only" htmlFor={`sec-kind-${i}`}>Section type</label>
              <select id={`sec-kind-${i}`} value={s.kind} onChange={(e) => {
                const kind = e.target.value as SectionKind;
                const autoName = !s.name.trim() || KINDS.some((k) => KIND_STYLE[k].label === s.name);
                setSection(i, { kind, ...(autoName ? { name: KIND_STYLE[kind].label } : {}) });
              }} className="input h-9 w-auto text-sm">
                {KINDS.map((k) => <option key={k} value={k}>{KIND_STYLE[k].label}</option>)}
              </select>
              <label className="sr-only" htmlFor={`sec-name-${i}`}>Section name</label>
              <input id={`sec-name-${i}`} value={s.name} onChange={(e) => setSection(i, { name: e.target.value })} className="input h-9 min-w-0 flex-1 text-sm" placeholder="Name, e.g. Verse 2" />
              <div className="flex">
                <button type="button" className="icon-btn h-9 w-9" disabled={i === 0} onClick={() => moveSection(i, i - 1)} aria-label="Move section up"><Icon name="arrowUp" size={16} /></button>
                <button type="button" className="icon-btn h-9 w-9" disabled={i === draft.sections.length - 1} onClick={() => moveSection(i, i + 1)} aria-label="Move section down"><Icon name="arrowDown" size={16} /></button>
                <button type="button" className="icon-btn h-9 w-9" onClick={() => setDraft((d) => ({ ...d, sections: d.sections.filter((_, j) => j !== i) }))} aria-label={`Remove section ${i + 1}`}><Icon name="x" size={17} /></button>
              </div>
            </div>
            <input value={s.lyricCue} onChange={(e) => setSection(i, { lyricCue: e.target.value })} className="input h-9 text-sm" placeholder="Lyric cue (optional), e.g. “You are worthy”" aria-label={`Lyric cue for section ${i + 1}`} />
            <textarea value={s.progression} onChange={(e) => setSection(i, { progression: e.target.value })} rows={2} className="input min-h-[4.5rem] py-2 font-mono text-sm" placeholder="1 5 6 4" aria-label={`Numbers for section ${i + 1}`} />
            {s.progression.trim() && (
              <div className="rounded-xl bg-sunken px-3 py-2.5" aria-label="Preview">
                <Progression text={s.progression} keyCtx={key} notation={notation} />
              </div>
            )}
          </li>
        ))}
      </ol>
      <button type="button" className="btn-outline mt-3 w-full border-dashed" onClick={() => setDraft((d) => ({ ...d, sections: [...d.sections, { name: 'Chorus', kind: 'chorus', progression: '', lyricCue: '' }] }))}>
        <Icon name="plus" size={17} /> Add a section
      </button>

      <div className="card mt-6 space-y-4 p-4 sm:p-5">
        <Field label="Notes for the band (optional)" htmlFor="song-notes" hint="One per line, e.g. “Chorus x3 at the end”.">
          <textarea id="song-notes" value={draft.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} className="input py-2 text-sm" />
        </Field>
        {!existing && band.enabled && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Who should see this song?</legend>
            <div className="flex flex-wrap gap-2">
              <Choice checked={bandSong} onChange={() => setWhere('band')} icon="users" label="The whole band" />
              <Choice checked={!bandSong} onChange={() => setWhere('device')} icon="music" label="Only me, on this device" />
            </div>
            {needsPin && <div className="mt-3 rounded-xl bg-sunken p-3"><BandUnlock /></div>}
          </fieldset>
        )}
        {existing && <p className="text-xs text-faint">{existing.collection === 'Band additions' ? 'Shared with the whole band.' : 'Saved on this device only.'}</p>}
      </div>

      {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button className="btn-primary" disabled={busy || needsPin || (existing?.collection === 'Band additions' && !band.canEdit)}>
          <Icon name="check" size={16} /> {busy ? 'Saving…' : existing ? 'Save changes' : bandSong ? 'Add for the band' : 'Add song'}
        </button>
        <Link to={existing ? `/song/${existing.id}` : '/library'} className="btn-quiet">Cancel</Link>
        {existing && (confirmDelete ? (
          <span className="ml-auto flex items-center gap-1">
            <button type="button" className="btn bg-red-600 text-white hover:bg-red-700" onClick={remove}>{existing.collection === 'Band additions' ? 'Delete for everyone' : 'Delete'}</button>
            <button type="button" className="btn-quiet" onClick={() => setConfirmDelete(false)}>Keep</button>
          </span>
        ) : (
          <button type="button" className="btn-quiet ml-auto text-red-600" onClick={() => setConfirmDelete(true)} disabled={existing.collection === 'Band additions' && !band.canEdit}><Icon name="trash" size={16} /> Delete song</button>
        ))}
      </div>
      {existing?.collection === 'Band additions' && !band.canEdit && <div className="mt-4 rounded-xl bg-sunken p-3"><BandUnlock /></div>}
    </form>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
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
