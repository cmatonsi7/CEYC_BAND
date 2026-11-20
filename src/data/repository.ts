import type { Library } from './types';

/**
 * Data-access boundary for the song library.
 *
 * The app only talks to this interface. Today it reads a static JSON file
 * shipped with the site; a Firebase/Supabase implementation can be dropped in
 * later without touching the UI.
 */
export interface LibraryRepository {
  load(): Promise<Library>;
}

export class StaticJsonRepository implements LibraryRepository {
  constructor(private readonly url: string) {}

  async load(): Promise<Library> {
    const res = await fetch(this.url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Could not load the song library (${res.status}).`);
    const data = (await res.json()) as Library;
    if (!data || !Array.isArray(data.songs)) throw new Error('The song library file is not in the expected format.');
    return data;
  }
}

/** Resolve a file in /public against Vite's base path so it works under /<repo>/ on GitHub Pages. */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export const defaultRepository: LibraryRepository = new StaticJsonRepository(publicUrl('data/library.json'));
