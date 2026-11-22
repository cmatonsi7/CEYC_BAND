import { useBand } from '../band/BandProvider';
import { Icon } from './Icon';

/** One line saying whether band setlists are live, saving or offline. */
export function BandStatusLine({ editing = false }: { editing?: boolean }) {
  const band = useBand();
  if (!band.enabled) return null;
  let text: string;
  let tone = 'text-faint';
  if (editing && band.error) { text = band.error; tone = 'text-red-600'; }
  else if (editing && band.saving) text = 'Saving for the band…';
  else if (band.status === 'loading') text = 'Checking for band updates…';
  else if (band.status === 'offline') {
    text = `Offline: showing the copy saved on this phone${band.lastSynced ? ` (${new Date(band.lastSynced).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })})` : ''}.`;
    tone = 'text-amber-600';
  } else text = editing ? 'Saved for the band. Everyone sees changes within about 30 seconds.' : 'Up to date with the band.';
  return (
    <p className={`flex items-center gap-1.5 text-xs ${tone}`} role="status">
      <Icon name="cloud" size={14} /> {text}
    </p>
  );
}
