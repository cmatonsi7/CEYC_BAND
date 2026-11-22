import { useState } from 'react';
import { useBand } from '../band/BandProvider';
import { Icon } from './Icon';

/** Lets the MD (or anyone with the band PIN) turn on editing on this device. */
export function BandUnlock({ compact = false, onDone }: { compact?: boolean; onDone?: () => void }) {
  const band = useBand();
  const [pin, setPin] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'wrong' | 'error'>('idle');
  if (!band.enabled) return null;
  if (band.canEdit) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-accent"><Icon name="unlock" size={16} /> Band editing is on for this device</span>
        <button className="btn-quiet h-9" onClick={() => band.lock()}>Turn off</button>
      </div>
    );
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('busy');
    try {
      const ok = await band.unlock(pin);
      setState(ok ? 'idle' : 'wrong');
      if (ok) { setPin(''); onDone?.(); }
    } catch {
      setState('error');
    }
  };
  return (
    <form onSubmit={submit} className={compact ? 'flex flex-wrap items-center gap-2' : 'space-y-2'}>
      {!compact && <p className="text-sm text-muted">Anyone can view band setlists. To create or change them, or add songs for the band, enter the band PIN once on this device.</p>}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="band-pin" className="sr-only">Band PIN</label>
        <input id="band-pin" type="password" autoComplete="off" value={pin} onChange={(e) => { setPin(e.target.value); setState('idle'); }} placeholder="Band PIN" className="input h-10 w-40" />
        <button className="btn-primary h-10" disabled={!pin.trim() || state === 'busy'}><Icon name="lock" size={15} /> {state === 'busy' ? 'Checking…' : 'Unlock editing'}</button>
      </div>
      {state === 'wrong' && <p className="text-sm text-red-600" role="alert">That PIN isn’t right.</p>}
      {state === 'error' && <p className="text-sm text-red-600" role="alert">Couldn’t check the PIN. Are you online?</p>}
    </form>
  );
}
