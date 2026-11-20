import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions, setlistOps } from '../store/userStore';
import { useLibrary } from '../data/LibraryProvider';
import { arrangementLabel, findArrangement, rankSongs, searchSongs } from '../data/library';
import type { Setlist, SetlistSong } from '../data/types';
import { allKeys, keyToString } from '../music';
import { useSortable } from '../hooks/useSortable';
import { BackLink, EmptyState } from '../components/ui';
import { Icon } from '../components/Icon';

export default function SetlistEditorPage() {
  const { id = '' } = useParams();
  const setlist = useUserData((d) => d.setlists.find((s) => s.id === id));
  if (!setlist) {
    return (
      <EmptyState icon="list" title="Setlist not found" action={<Link to="/setlists" className="btn-outline">All setlists</Link>}>
        It may have been deleted, or it was made on another device. Setlists are saved per device.
      </EmptyState>
    );
  }
  return <Editor setlist={setlist} />;
}

function Editor({ setlist }: { setlist: Setlist }) {
  const update = useUpdate();
  const lib = useLibrary();
  const edit = (fn: (s: Setlist) => Setlist) => update(actions.updateSetlist(setlist.id, fn));
  const sortable = useSortable(setlist.songs.length, (from, to) => edit(setlistOps.move(from, to)));
  const [adding, setAdding] = useState(setlist.songs.length === 0);

  return (
    <div className="animate-fade-up">
      <BackLink to="/setlists">Setlists</BackLink>
      <div className="flex flex-wrap items-end gap-3 pb-5">
        <div className="min-w-0 flex-1 space-y-2">
          <label className="sr-only" htmlFor="setlist-name">Setlist name</label>
          <input
            id="setlist-name"
            value={setlist.name}
            onChange={(e) => edit(setlistOps.rename(e.target.value))}
            className="w-full rounded-lg bg-transparent font-display text-[1.75rem] font-semibold tracking-tight outline-none ring-accent/40 focus:ring-2 sm:text-[2rem]"
          />
          <div className="flex items-center gap-2 text-sm text-muted">
            <label htmlFor="setlist-date">Service date</label>
            <input id="setlist-date" type="date" value={setlist.date ?? ''} onChange={(e) => edit(setlistOps.setDate(e.target.value))} className="input h-9 w-auto" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => update(actions.duplicateSetlist(setlist.id))}><Icon name="copy" size={16} /> Duplicate</button>
          <Link to={`/perform/setlist/${setlist.id}`} className={`btn-primary ${setlist.songs.length ? '' : 'pointer-events-none opacity-40'}`}>
            <Icon name="play" size={15} filled /> Perform setlist
          </Link>
        </div>
      </div>

      {setlist.songs.length === 0 && !adding ? null : (
        <ol className="space-y-2">
          {setlist.songs.map((entry, i) => (
            <li key={entry.uid} ref={sortable.itemRef(i)} style={sortable.rowStyle(i)}
              className={`card flex gap-2 p-3 transition-shadow ${sortable.dragging === i ? 'shadow-[0_12px_28px_-10px_rgb(0_0_0/0.35)]' : ''}`}>
              <div className="flex flex-col items-center gap-1 pt-1">
                <button {...sortable.handleProps(i)} className="grid h-9 w-8 place-items-center rounded-lg text-faint hover:bg-sunken hover:text-ink" aria-label={`Drag to reorder ${i + 1}`}>
                  <Icon name="grip" size={18} />
                </button>
                <span className="text-xs font-semibold tabular-nums text-faint">{i + 1}</span>
              </div>
              <EntryEditor
                entry={entry}
                index={i}
                count={setlist.songs.length}
                setlistId={setlist.id}
                onPatch={(p) => edit(setlistOps.patch(entry.uid, p))}
                onRemove={() => edit(setlistOps.remove(entry.uid))}
                onMove={(to) => edit(setlistOps.move(i, to))}
              />
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4">
        {adding ? (
          <SongPicker
            onPick={(songId) => {
              const song = lib.songs.find((s) => s.id === songId)!;
              const arr = song.arrangements[0];
              edit(setlistOps.add({ songId, arrangementId: arr.id, performanceKey: arr.originalKey ?? undefined }));
            }}
            onClose={() => setAdding(false)}
            addedIds={setlist.songs.map((s) => s.songId)}
          />
        ) : (
          <button className="btn-outline w-full border-dashed" onClick={() => setAdding(true)}><Icon name="plus" size={17} /> Add songs</button>
        )}
      </div>
    </div>
  );
}

function EntryEditor({ entry, index, count, setlistId, onPatch, onRemove, onMove }: {
  entry: SetlistSong; index: number; count: number; setlistId: string;
  onPatch: (p: Partial<SetlistSong>) => void; onRemove: () => void; onMove: (to: number) => void;
}) {
  const lib = useLibrary();
  const song = lib.songs.find((s) => s.id === entry.songId);
  const [showNotes, setShowNotes] = useState(!!entry.notes);
  if (!song) {
    return (
      <div className="flex flex-1 items-center justify-between text-sm text-muted">
        This song is no longer in the library. <button className="btn-quiet" onClick={onRemove}>Remove</button>
      </div>
    );
  }
  const arr = findArrangement(song, entry.arrangementId);
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-2">
        <Link to={`/song/${song.id}?a=${encodeURIComponent(arr.id)}`} className="min-w-0 flex-1 truncate pt-1.5 font-semibold hover:text-accent">{song.title}</Link>
        <div className="flex shrink-0 items-center">
          <button className="icon-btn h-9 w-9" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up"><Icon name="arrowUp" size={16} /></button>
          <button className="icon-btn h-9 w-9" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="Move down"><Icon name="arrowDown" size={16} /></button>
          <Link to={`/perform/setlist/${setlistId}?i=${index}`} className="icon-btn h-9 w-9" aria-label={`Perform from ${song.title}`}><Icon name="play" size={15} /></Link>
          <button className="icon-btn h-9 w-9" onClick={onRemove} aria-label={`Remove ${song.title}`}><Icon name="x" size={17} /></button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {song.arrangements.length > 1 && (
          <select aria-label="Arrangement" value={arr.id}
            onChange={(e) => {
              const next = findArrangement(song, e.target.value);
              onPatch({ arrangementId: next.id, performanceKey: next.originalKey ?? entry.performanceKey });
            }}
            className="input h-9 w-auto text-sm">
            {song.arrangements.map((a, i) => <option key={a.id} value={a.id}>{arrangementLabel(a, i)}{a.originalKey ? ` (${a.originalKey})` : ''}</option>)}
          </select>
        )}
        <select aria-label="Performance key" value={entry.performanceKey ?? ''} onChange={(e) => onPatch({ performanceKey: e.target.value || undefined })} className="input h-9 w-auto text-sm">
          <option value="">{arr.originalKey ? `Key: ${arr.originalKey} (written)` : 'No key (numbers)'}</option>
          {arr.keyOptions?.map((o) => <option key={`o-${o.label}`} value={o.key}>{o.label}: {o.key}</option>)}
          {allKeys('major').map((k) => { const s = keyToString(k); return <option key={s} value={s}>Key: {s}</option>; })}
        </select>
        {!showNotes && <button className="btn-quiet h-9 text-xs" onClick={() => setShowNotes(true)}><Icon name="note" size={14} /> Add note</button>}
      </div>
      {showNotes && (
        <input
          value={entry.notes ?? ''}
          onChange={(e) => onPatch({ notes: e.target.value || undefined })}
          placeholder="e.g. Start with keys only, chorus x3"
          className="input mt-2 h-9"
          aria-label={`Note for ${song.title}`}
          autoFocus={!entry.notes}
        />
      )}
    </div>
  );
}

function SongPicker({ onPick, onClose, addedIds }: { onPick: (id: string) => void; onClose: () => void; addedIds: string[] }) {
  const lib = useLibrary();
  const [q, setQ] = useState('');
  const results = useMemo(() => rankSongs(searchSongs(lib.songs, { query: q }), q).slice(0, 40), [lib, q]);
  return (
    <div className="card p-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Icon name="search" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a song to add…" className="input pl-10" aria-label="Find a song to add" />
        </div>
        <button className="btn-quiet" onClick={onClose}>Done</button>
      </div>
      <ul className="mt-2 max-h-80 overflow-y-auto">
        {results.map((s) => {
          const count = addedIds.filter((x) => x === s.id).length;
          return (
            <li key={s.id}>
              <button onClick={() => onPick(s.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sunken">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sunken text-[11px] font-semibold text-muted">{s.arrangements[0].originalKey ?? '—'}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.title}</span>
                {count > 0 && <span className="text-xs text-accent">Added{count > 1 ? ` ×${count}` : ''}</span>}
                <Icon name="plus" size={16} className="text-faint" />
              </button>
            </li>
          );
        })}
        {results.length === 0 && <li className="px-2 py-4 text-center text-sm text-muted">No songs match “{q}”.</li>}
      </ul>
    </div>
  );
}
