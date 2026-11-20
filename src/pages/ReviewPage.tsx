import { Link } from 'react-router-dom';
import { useLibrary } from '../data/LibraryProvider';
import { arrangementFlags, arrangementLabel } from '../data/library';
import { PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';

/** Every place where the PDF was unclear, for the music team to check. */
export default function ReviewPage() {
  const lib = useLibrary();
  const rows = lib.songs
    .map((song) => ({
      song,
      general: song.flags ?? [],
      arrs: song.arrangements.map((a, i) => ({ a, label: arrangementLabel(a, i), flags: arrangementFlags(a) })).filter((x) => x.flags.length),
    }))
    .filter((r) => r.general.length || r.arrs.length);
  const accomp = lib.accompaniment.filter((a) => a.flags.length);
  const total = rows.reduce((n, r) => n + r.general.length + r.arrs.reduce((m, a) => m + a.flags.length, 0), 0) + accomp.reduce((n, a) => n + a.flags.length, 0);

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Data review" title="Check against the PDF"
        subtitle={`${total} notes across ${rows.length} songs. These were left as written rather than guessed.`} />
      <ul className="space-y-3">
        {rows.map(({ song, general, arrs }) => (
          <li key={song.id} className="card p-4">
            <Link to={`/song/${song.id}`} className="flex items-center justify-between gap-2 font-semibold hover:text-accent">
              {song.title} <span className="text-xs font-normal text-faint">p. {song.sourcePages.join(', ')}</span>
            </Link>
            <ul className="mt-2 space-y-1.5 text-sm text-ink/85">
              {general.map((f, i) => <li key={i} className="flex gap-2"><Icon name="flag" size={14} className="mt-0.5 shrink-0 text-warn" />{f}</li>)}
              {arrs.map(({ a, label, flags }) => flags.map((f, i) => (
                <li key={a.id + i} className="flex gap-2">
                  <Icon name="flag" size={14} className="mt-0.5 shrink-0 text-warn" />
                  <span>{song.arrangements.length > 1 && <b className="font-medium">{label}: </b>}{f}</span>
                </li>
              )))}
            </ul>
          </li>
        ))}
        {accomp.map((a) => (
          <li key={a.id} className="card p-4">
            <Link to="/accompaniment" className="font-semibold hover:text-accent">Service accompaniment: {a.title}</Link>
            <ul className="mt-2 space-y-1.5 text-sm">{a.flags.map((f, i) => <li key={i} className="flex gap-2"><Icon name="flag" size={14} className="mt-0.5 shrink-0 text-warn" />{f}</li>)}</ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
