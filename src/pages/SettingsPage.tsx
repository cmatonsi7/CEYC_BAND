import { useRef, useState } from 'react';
import { useUpdate, useUserData } from '../store/UserDataProvider';
import { actions, emptyUserData, migrate } from '../store/userStore';
import { PageHeader, Segmented } from '../components/ui';
import { NotationSwitch } from '../components/NotationSwitch';
import { Icon } from '../components/Icon';
import { useBand } from '../band/BandProvider';
import { BandUnlock } from '../components/BandUnlock';
import { BandStatusLine } from '../components/BandStatus';

function BandSettings() {
  const band = useBand();
  return (
    <>
      <h2 className="mb-2 mt-8 flex items-center gap-2 font-semibold"><Icon name="users" size={17} /> Band sharing</h2>
      <div className="card space-y-3 p-4">
        {band.enabled ? (
          <>
            <p className="text-sm text-muted">Band setlists and band songs are shared with everyone who opens this app. The app checks for changes every 30 seconds while it’s open, and keeps a copy on this phone for when there’s no signal.</p>
            <div className="flex flex-wrap items-center gap-3">
              <BandStatusLine />
              <button className="btn-quiet h-8 text-xs" onClick={() => band.refresh()}>Check now</button>
            </div>
            <div className="border-t border-line pt-3"><BandUnlock /></div>
          </>
        ) : (
          <p className="text-sm text-muted">Band sharing isn’t switched on for this copy of the app yet, so setlists and added songs stay on each device. Use Share on a setlist to send it to others.</p>
        )}
      </div>
    </>
  );
}

export default function SettingsPage() {
  const user = useUserData();
  const update = useUpdate();
  const s = user.settings;
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ceyc-band-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (f: File) => {
    try {
      const data = migrate(JSON.parse(await f.text()));
      update(actions.replaceAll(data));
      setMsg(`Restored ${data.setlists.length} setlists, ${data.favourites.length} favourites and ${Object.keys(data.notes).length} notes.`);
    } catch {
      setMsg('That file could not be read. Choose a backup exported from this app.');
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Settings" title="Settings" />
      <div className="card divide-y divide-line">
        <Row title="Show progressions as" desc="Number degrees, chord names, or both together. The same switch is on every song and in Performance Mode.">
          <NotationSwitch />
        </Row>
        <Row title="Appearance">
          <Segmented label="Appearance" value={s.theme} onChange={(v) => update(actions.updateSettings({ theme: v }))}
            options={[{ value: 'system', label: 'Auto' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        </Row>
        <Row title="Performance text size" desc={`${Math.round(s.performanceFontScale * 100)}%`}>
          <input type="range" min={0.6} max={2.2} step={0.1} value={s.performanceFontScale} aria-label="Performance text size"
            onChange={(e) => update(actions.updateSettings({ performanceFontScale: Number(e.target.value) }))} className="w-40 accent-[rgb(var(--accent))]" />
        </Row>
        <Row title="Keep screen on in Performance Mode" desc="Uses the browser’s Wake Lock where supported (most current Chrome, Edge and Safari).">
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" checked={s.keepScreenOn} onChange={(e) => update(actions.updateSettings({ keepScreenOn: e.target.checked }))} />
            <span className="h-7 w-12 rounded-full bg-sunken transition-colors peer-checked:bg-accent" />
            <span className="absolute left-1 h-5 w-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
            <span className="sr-only">Keep screen on</span>
          </label>
        </Row>
      </div>

      <BandSettings />

      <h2 className="mb-2 mt-8 font-semibold">Your data</h2>
      <p className="mb-3 text-sm text-muted">
        Favourites, notes, preferred keys and setlists are stored in this browser only. Export a backup to move them to another phone or tablet.
      </p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-outline" onClick={exportData}><Icon name="download" size={16} /> Export backup</button>
        <button className="btn-outline" onClick={() => file.current?.click()}><Icon name="upload" size={16} /> Import backup</button>
        <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        {confirmReset ? (
          <>
            <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={() => { update(actions.replaceAll(emptyUserData())); setConfirmReset(false); setMsg('All personal data cleared.'); }}>Yes, clear everything</button>
            <button className="btn-quiet" onClick={() => setConfirmReset(false)}>Cancel</button>
          </>
        ) : (
          <button className="btn-quiet text-red-600" onClick={() => setConfirmReset(true)}><Icon name="trash" size={16} /> Clear my data</button>
        )}
      </div>
      {msg && <p className="mt-3 text-sm text-muted" role="status">{msg}</p>}

      <h2 className="mb-2 mt-8 font-semibold">How to read the numbers</h2>
      <div className="card space-y-2 p-4 text-sm text-ink/85">
        <p>A plain number is the natural chord of that step of the key: in A, <b>2</b> is Bm, <b>6</b> is F#m and <b>7</b> is G#dim.</p>
        <p><b>maj</b> / <b>min</b> / <b>m</b> written after a number override that (e.g. <b>3maj</b> in A is C#).</p>
        <p><b>6#</b> (or <b>#6</b>) is 6 sharp. The PDF doesn’t say what quality those chords are, so chord view shows just the root with a <span className="font-bold text-warn">?</span>.</p>
        <p><b>2,3</b> (comma, no space) means 2 is a passing chord on the way to 3. The passing chord is drawn smaller and lighter, so <b>3</b> stands out. <b>5/4</b> is shown as a slash chord.</p>
        <p>Songs that change key show the new key on the section, and moving the song’s key moves every section by the same amount.</p>
      </div>
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
      <div className="min-w-0 max-w-sm">
        <p className="text-sm font-medium">{title}</p>
        {desc && <p className="text-xs text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
