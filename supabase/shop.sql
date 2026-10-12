-- ============================================================================
-- Nature et Vie — boutique : catalogue des produits (Supabase)
-- À exécuter APRÈS supabase/schema.sql (qui définit public.is_admin()).
-- Tant que cette table est vide ou absente, le site utilise lib/catalog.js.
-- ============================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  name text not null check (char_length(name) <= 120),
  category text not null default '' check (char_length(category) <= 60),
  tagline text not null default '' check (char_length(tagline) <= 160),
  details text[] not null default '{}' check (cardinality(details) <= 5),
  description text not null default '' check (char_length(description) <= 3000),
  composition jsonb not null default '[]'::jsonb check (jsonb_typeof(composition) = 'array'),
  usage text not null default '' check (char_length(usage) <= 600),
  cautions text[] not null default '{}' check (cardinality(cautions) <= 8),
  gallery text[] not null default '{}' check (cardinality(gallery) <= 6),  -- photos supplémentaires
  packshot boolean not null default false,                                 -- photo sur fond blanc
  origin text not null default '' check (char_length(origin) <= 160),
  price integer check (price is null or price > 0),   -- en FCFA
  unit text not null default '' check (char_length(unit) <= 40),
  image_url text check (char_length(image_url) <= 600),
  status text not null default 'soon' check (status in ('available', 'soon', 'hidden')),
  stock integer check (stock is null or stock >= 0),  -- null = non suivi
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Le public lit uniquement les produits non masqués.
drop policy if exists "produits lecture publique" on public.products;
create policy "produits lecture publique" on public.products
  for select to anon, authenticated using (status <> 'hidden');

-- Seul un administrateur validé par le code à 2 étapes écrit.
drop policy if exists "produits admin" on public.products;
create policy "produits admin" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_products() returns trigger
language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch before update on public.products
  for each row execute function public.touch_products();

drop trigger if exists trg_products_audit on public.products;
create trigger trg_products_audit after insert or update or delete on public.products
  for each row execute function public.log_change();

-- Étapes suivantes (avec l'agrégateur de paiement), à ajouter ensemble :
--   orders, order_items, payments — écriture réservée aux fonctions serveur (service_role),
--   lecture réservée à l'administrateur ; jamais d'accès public.
