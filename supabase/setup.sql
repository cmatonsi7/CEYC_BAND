-- =====================================================================
-- CEYC Band Library: shared band setlists and songs
--
-- HOW TO USE: in Supabase, open "SQL Editor", paste this whole file,
-- change the PIN on the line marked  >>> CHANGE THIS <<<  and press Run.
-- Running it again is safe: it keeps your data and just updates the PIN.
--
-- Who can do what:
--   * Anyone with the app link can READ band setlists and band songs.
--   * Creating, editing or deleting needs the band edit PIN.
--     The PIN is stored hashed and is never readable through the API.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.band_setlists (
  id           text primary key,
  name         text not null,
  service_date date,
  songs        jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now()
);

create table if not exists public.band_songs (
  id         text primary key,
  title      text not null,
  song       jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.band_settings (
  id            int primary key default 1 check (id = 1),
  edit_pin_hash text not null
);

-- Row level security: read-only for the public, no direct writes at all.
alter table public.band_setlists enable row level security;
alter table public.band_songs    enable row level security;
alter table public.band_settings enable row level security;

drop policy if exists "Anyone can read band setlists" on public.band_setlists;
create policy "Anyone can read band setlists" on public.band_setlists for select to anon, authenticated using (true);
drop policy if exists "Anyone can read band songs" on public.band_songs;
create policy "Anyone can read band songs" on public.band_songs for select to anon, authenticated using (true);

revoke insert, update, delete on public.band_setlists, public.band_songs from anon, authenticated;
revoke all on public.band_settings from anon, authenticated;
grant select on public.band_setlists, public.band_songs to anon, authenticated;

-- >>> CHANGE THIS <<<  Pick a PIN of at least 6 characters and share it only with whoever plans setlists.
insert into public.band_settings (id, edit_pin_hash)
values (1, extensions.crypt('CHANGE-ME-123', extensions.gen_salt('bf')))
on conflict (id) do update set edit_pin_hash = excluded.edit_pin_hash;

-- ---------------------------------------------------------------------
-- PIN check (internal). A wrong PIN waits one second to slow down guessing.
create or replace function public._band_pin_ok(p_pin text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare ok boolean;
begin
  select s.edit_pin_hash = extensions.crypt(coalesce(p_pin, ''), s.edit_pin_hash) into ok
  from public.band_settings s where s.id = 1;
  if not coalesce(ok, false) then perform pg_sleep(1); end if;
  return coalesce(ok, false);
end $$;
revoke execute on function public._band_pin_ok(text) from public, anon, authenticated;

create or replace function public._band_require_pin(p_pin text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public._band_pin_ok(p_pin) then
    raise exception 'Wrong band PIN' using errcode = '28P01';
  end if;
end $$;
revoke execute on function public._band_require_pin(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Public functions the app calls.
create or replace function public.band_check_pin(p_pin text)
returns boolean language sql security definer set search_path = public as $$
  select public._band_pin_ok(p_pin);
$$;

create or replace function public.band_save_setlist(p_pin text, p_setlist jsonb)
returns public.band_setlists language plpgsql security definer set search_path = public as $$
declare row public.band_setlists;
begin
  perform public._band_require_pin(p_pin);
  if coalesce(p_setlist->>'id', '') = '' then raise exception 'Setlist id is required'; end if;
  if octet_length(p_setlist::text) > 100000 then raise exception 'Setlist is too large'; end if;
  insert into public.band_setlists (id, name, service_date, songs, updated_at)
  values (
    p_setlist->>'id',
    coalesce(nullif(trim(p_setlist->>'name'), ''), 'Untitled setlist'),
    nullif(p_setlist->>'date', '')::date,
    coalesce(p_setlist->'songs', '[]'::jsonb),
    now()
  )
  on conflict (id) do update set
    name = excluded.name, service_date = excluded.service_date, songs = excluded.songs, updated_at = now()
  returning * into row;
  return row;
end $$;

create or replace function public.band_delete_setlist(p_pin text, p_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._band_require_pin(p_pin);
  delete from public.band_setlists where id = p_id;
end $$;

create or replace function public.band_save_song(p_pin text, p_song jsonb)
returns public.band_songs language plpgsql security definer set search_path = public as $$
declare row public.band_songs;
begin
  perform public._band_require_pin(p_pin);
  if coalesce(p_song->>'id', '') = '' or coalesce(trim(p_song->>'title'), '') = '' then
    raise exception 'Song id and title are required';
  end if;
  if octet_length(p_song::text) > 100000 then raise exception 'Song is too large'; end if;
  insert into public.band_songs (id, title, song, updated_at)
  values (p_song->>'id', trim(p_song->>'title'), p_song, now())
  on conflict (id) do update set title = excluded.title, song = excluded.song, updated_at = now()
  returning * into row;
  return row;
end $$;

create or replace function public.band_delete_song(p_pin text, p_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._band_require_pin(p_pin);
  delete from public.band_songs where id = p_id;
end $$;

grant execute on function public.band_check_pin(text), public.band_save_setlist(text, jsonb),
  public.band_delete_setlist(text, text), public.band_save_song(text, jsonb), public.band_delete_song(text, text)
  to anon, authenticated;
