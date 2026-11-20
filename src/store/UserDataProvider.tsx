import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import type { UserData } from '../data/types';
import { LocalUserStore, STORAGE_KEY, type UserStore } from './userStore';

const StoreContext = createContext<UserStore | null>(null);

function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    s.setItem('__probe', '1');
    s.removeItem('__probe');
    return s;
  } catch {
    return null;
  }
}

export function UserDataProvider({ children, store }: { children: ReactNode; store?: UserStore }) {
  const value = useMemo(() => store ?? new LocalUserStore(safeStorage()), [store]);
  useEffect(() => {
    if (!(value instanceof LocalUserStore)) return;
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && value.reload();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [value]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore(): UserStore {
  const s = useContext(StoreContext);
  if (!s) throw new Error('UserDataProvider missing');
  return s;
}

/** Subscribe to user data. Pass a selector to limit re-renders. */
export function useUserData<T = UserData>(selector?: (d: UserData) => T): T {
  const store = useStore();
  const snap = useSyncExternalStore(store.subscribe.bind(store), () => store.get());
  return selector ? selector(snap) : (snap as unknown as T);
}

export function useUpdate(): (fn: (d: UserData) => UserData) => void {
  const store = useStore();
  return useMemo(() => store.update.bind(store), [store]);
}
