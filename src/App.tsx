import { lazy, Suspense } from 'react';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { LibraryProvider, useLibraryState } from './data/LibraryProvider';
import { UserDataProvider } from './store/UserDataProvider';
import { Layout } from './components/Layout';
import { EmptyState, Spinner } from './components/ui';
import { useTheme } from './hooks/useTheme';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SongPage from './pages/SongPage';

// Less-used screens load on demand.
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const SetlistsPage = lazy(() => import('./pages/SetlistsPage'));
const SetlistEditorPage = lazy(() => import('./pages/SetlistEditorPage'));
const AccompanimentPage = lazy(() => import('./pages/AccompanimentPage'));
const FavouritesPage = lazy(() => import('./pages/FavouritesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));

/**
 * HashRouter keeps every route under index.html (#/song/...), so refreshing a
 * nested page on GitHub Pages never hits a 404.
 */
export default function App() {
  return (
    <UserDataProvider>
      <LibraryProvider>
        <HashRouter>
          <Themed />
          <LibraryGate>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/perform/:mode/:id" element={<PerformancePage />} />
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="library" element={<LibraryPage />} />
                  <Route path="song/:songId" element={<SongPage />} />
                  <Route path="setlists" element={<SetlistsPage />} />
                  <Route path="setlists/:id" element={<SetlistEditorPage />} />
                  <Route path="accompaniment" element={<AccompanimentPage />} />
                  <Route path="favourites" element={<FavouritesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="review" element={<ReviewPage />} />
                  <Route path="*" element={<EmptyState icon="music" title="Page not found" action={<Link to="/" className="btn-outline">Go home</Link>} />} />
                </Route>
              </Routes>
            </Suspense>
          </LibraryGate>
        </HashRouter>
      </LibraryProvider>
    </UserDataProvider>
  );
}

function Themed() {
  useTheme();
  return null;
}

function LibraryGate({ children }: { children: React.ReactNode }) {
  const { state, retry } = useLibraryState();
  if (state.status === 'loading') return <Spinner label="Loading the song library" />;
  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-md p-6 pt-24">
        <EmptyState icon="info" title="Couldn’t load the songs" action={<button className="btn-primary" onClick={retry}>Try again</button>}>
          {state.error} If you’re offline, open the app once while connected so it can be saved for offline use.
        </EmptyState>
      </div>
    );
  }
  return <>{children}</>;
}
