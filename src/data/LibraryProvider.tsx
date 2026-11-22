import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useBand } from '../band/BandProvider';
import { mergeLibrary } from '../band/customSongs';
import { useUserData } from '../store/UserDataProvider';
import { defaultRepository, type LibraryRepository } from './repository';
import type { Library } from './types';

type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; library: Library };

const Ctx = createContext<{ state: State; retry: () => void } | null>(null);

export function LibraryProvider({ children, repository = defaultRepository }: { children: ReactNode; repository?: LibraryRepository }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const load = useCallback(() => {
    setState({ status: 'loading' });
    repository
      .load()
      .then((library) => setState({ status: 'ready', library }))
      .catch((e: unknown) => setState({ status: 'error', error: e instanceof Error ? e.message : String(e) }));
  }, [repository]);
  useEffect(() => { load(); }, [load]);
  return <Ctx.Provider value={{ state, retry: load }}>{children}</Ctx.Provider>;
}

export function useLibraryState() {
  const c = useContext(Ctx);
  if (!c) throw new Error('LibraryProvider missing');
  return c;
}

/**
 * The PDF library plus songs added in the app (shared band additions and this
 * device's own). Only call inside <LibraryGate>, where the library is loaded.
 */
export function useLibrary(): Library {
  const { state } = useLibraryState();
  const band = useBand().songs;
  const mine = useUserData((d) => d.customSongs);
  const base = state.status === 'ready' ? state.library : null;
  const merged = useMemo(() => (base ? mergeLibrary(base, band, mine) : null), [base, band, mine]);
  if (!merged) throw new Error('Library not loaded');
  return merged;
}
