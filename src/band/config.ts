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
  url: 'https://dnqumgeytfyzufiofnos.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucXVtZ2V5dGZ5enVmaW9mbm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMTE4OTAsImV4cCI6MjExMDg4Nzg5MH0.CYo_4pP_li4CVsEEi3oSJDWBmDuC4RovTVds5FXyu5U',
};

export function bandConfig(): { url: string; anonKey: string } | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || BAND_CONFIG.url;
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || BAND_CONFIG.anonKey;
  return url && anonKey ? { url: url.replace(/\/+$/, ''), anonKey } : null;
}
