import { useState } from 'react';
import type { Setlist } from '../data/types';
import { shareUrl } from '../data/shareLink';
import { Icon } from './Icon';

/** Copies a read-only link to the setlist (or opens the phone's share sheet). */
export function ShareButton({ setlist, compact = false }: { setlist: Pick<Setlist, 'name' | 'date' | 'songs'>; compact?: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [url, setUrl] = useState('');
  const disabled = setlist.songs.length === 0;

  const share = async () => {
    const link = shareUrl(setlist);
    setUrl(link);
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse && navigator.share) {
      try {
        await navigator.share({ title: setlist.name, text: `Setlist: ${setlist.name}`, url: link });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setState('copied');
      window.setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('manual');
    }
  };

  return (
    <span className="relative inline-flex">
      <button className={compact ? 'btn-quiet h-9' : 'btn-outline'} onClick={share} disabled={disabled} title={disabled ? 'Add songs first' : 'Anyone with the link can view this setlist'}>
        <Icon name={state === 'copied' ? 'check' : 'external'} size={compact ? 15 : 16} /> {state === 'copied' ? 'Link copied' : 'Share'}
      </button>
      <span className="sr-only" role="status">{state === 'copied' ? 'Share link copied' : ''}</span>
      {state === 'manual' && (
        <span className="absolute right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-line bg-surface p-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)]">
          <span className="mb-1.5 block text-xs text-muted">Copy this link:</span>
          <input readOnly value={url} onFocus={(e) => e.target.select()} autoFocus className="input h-9 text-xs" aria-label="Share link" />
          <button className="btn-quiet mt-1 h-8 w-full text-xs" onClick={() => setState('idle')}>Close</button>
        </span>
      )}
    </span>
  );
}
