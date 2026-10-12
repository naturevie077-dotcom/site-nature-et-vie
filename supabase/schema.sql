-- ============================================================================
-- Nature et Vie — base de données de l'administration (Supabase)
-- À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
-- Sécurité : RLS activée partout ; toute écriture exige un compte administrateur
-- ET une session validée par le code à 2 étapes (aal2).
-- ============================================================================

-- 1. Administrateurs --------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admin lit sa propre ligne" on public.admins;
create policy "admin lit sa propre ligne" on public.admins
  for select to authenticated using (user_id = auth.uid());
-- Aucune policy d'écriture : on ajoute un admin uniquement depuis le SQL Editor.

-- Vrai seulement si : l'utilisateur est dans `admins` ET sa session a passé la 2e étape (TOTP).
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid())
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2. Pages publiées et brouillons ------------------------------------------
create table if not exists public.pages (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,40}$'),
  blocks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint pages_is_array check (jsonb_typeof(blocks) = 'array'),
  constraint pages_size check (octet_length(blocks::text) < 400000)
);
create table if not exists public.page_drafts (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,40}$'),
  blocks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint drafts_is_array check (jsonb_typeof(blocks) = 'array'),
  constraint drafts_size check (octet_length(blocks::text) < 400000)
);

-- 3. Réglages (couleurs, informations de la maison) -------------------------
create table if not exists public.settings (
  key text primary key check (key in ('theme', 'site')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint settings_size check (octet_length(value::text) < 20000)
);

-- 4. Publicités ---------------------------------------------------------------
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 120),
  subtitle text check (char_length(subtitle) <= 240),
  image_url text check (char_length(image_url) <= 600),
  video_url text check (char_length(video_url) <= 600),
  link_url text check (char_length(link_url) <= 600),
  cta_label text check (char_length(cta_label) <= 60),
  active boolean not null default true,
  position integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Journal d'audit (qui a modifié quoi, et quand) -----------------------------
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_id uuid,
  action text not null,
  table_name text not null,
  row_key text
);

create or replace function public.log_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  r := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  insert into public.audit_log (user_id, action, table_name, row_key)
  values (auth.uid(), tg_op, tg_table_name, coalesce(r ->> 'slug', r ->> 'key', r ->> 'id'));
  return coalesce(new, old);
end $$;

create or replace function public.touch_updated() returns trigger
language plpgsql as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;

create or replace function public.touch_updated_ads() returns trigger
language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_pages_touch on public.pages;
create trigger trg_pages_touch before insert or update on public.pages for each row execute function public.touch_updated();
drop trigger if exists trg_drafts_touch on public.page_drafts;
create trigger trg_drafts_touch before insert or update on public.page_drafts for each row execute function public.touch_updated();
drop trigger if exists trg_settings_touch on public.settings;
create trigger trg_settings_touch before insert or update on public.settings for each row execute function public.touch_updated();
drop trigger if exists trg_ads_touch on public.ads;
create trigger trg_ads_touch before update on public.ads for each row execute function public.touch_updated_ads();

drop trigger if exists trg_pages_audit on public.pages;
create trigger trg_pages_audit after insert or update or delete on public.pages for each row execute function public.log_change();
drop trigger if exists trg_settings_audit on public.settings;
create trigger trg_settings_audit after insert or update or delete on public.settings for each row execute function public.log_change();
drop trigger if exists trg_ads_audit on public.ads;
create trigger trg_ads_audit after insert or update or delete on public.ads for each row execute function public.log_change();

-- 6. Row Level Security -------------------------------------------------------
alter table public.pages enable row level security;
alter table public.page_drafts enable row level security;
alter table public.settings enable row level security;
alter table public.ads enable row level security;
alter table public.audit_log enable row level security;

-- Lecture publique : uniquement ce qui est publié.
drop policy if exists "pages lecture publique" on public.pages;
create policy "pages lecture publique" on public.pages for select to anon, authenticated using (true);
drop policy if exists "pages écriture admin" on public.pages;
create policy "pages écriture admin" on public.pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Les brouillons ne sont JAMAIS publics.
drop policy if exists "brouillons admin" on public.page_drafts;
create policy "brouillons admin" on public.page_drafts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "réglages lecture publique" on public.settings;
create policy "réglages lecture publique" on public.settings for select to anon, authenticated using (true);
drop policy if exists "réglages écriture admin" on public.settings;
create policy "réglages écriture admin" on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Publicités : le public ne voit que les publicités actives et dans leur période.
drop policy if exists "pubs lecture publique" on public.ads;
create policy "pubs lecture publique" on public.ads for select to anon, authenticated
  using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
drop policy if exists "pubs admin" on public.ads;
create policy "pubs admin" on public.ads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "audit lecture admin" on public.audit_log;
create policy "audit lecture admin" on public.audit_log for select to authenticated using (public.is_admin());
-- Pas de policy d'écriture : seuls les déclencheurs (security definer) écrivent dans le journal.

-- 7. Stockage des images et vidéos --------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'])
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];

-- Les adresses publiques des fichiers fonctionnent sans policy ; la policy ci-dessous
-- réserve la LISTE, l'envoi, la modification et la suppression aux administrateurs.
drop policy if exists "media lecture admin" on storage.objects;
create policy "media lecture admin" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media envoi admin" on storage.objects;
create policy "media envoi admin" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media modification admin" on storage.objects;
create policy "media modification admin" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media suppression admin" on storage.objects;
create policy "media suppression admin" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- 8. Premier administrateur ---------------------------------------------------
-- Après avoir créé l'utilisateur dans Authentication > Users, exécuter (avec VOTRE e-mail) :
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'votre-adresse@exemple.com';
