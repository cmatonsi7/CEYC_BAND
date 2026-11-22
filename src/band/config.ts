/**
 * Band sharing (Supabase) connection.
 *
 * Fill in the two values from Supabase → Project Settings → API:
 *   url:     "Project URL", e.g. https://abcd1234.supabase.co
 *   anonKey: the "anon" / "public" key (safe to publish: the database only
 *            allows reading, and every change needs the band PIN).
 * Leave them empty to run without band sharing (everything stays on each device).
 */
export const BAND_CONFIG = {
  url: '',
  anonKey: '',
};

export function bandConfig(): { url: string; anonKey: string } | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || BAND_CONFIG.url;
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || BAND_CONFIG.anonKey;
  return url && anonKey ? { url: url.replace(/\/+$/, ''), anonKey } : null;
}
