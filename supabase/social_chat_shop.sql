create table if not exists public.direct_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  constraint direct_messages_no_self check (sender_id <> recipient_id)
);

alter table public.direct_messages enable row level security;
drop policy if exists "Chat participants can read messages" on public.direct_messages;
create policy "Chat participants can read messages" on public.direct_messages for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "Players can send direct messages" on public.direct_messages;
create policy "Players can send direct messages" on public.direct_messages for insert to authenticated with check (auth.uid() = sender_id and sender_id <> recipient_id and char_length(trim(body)) between 1 and 1000);
grant select, insert on public.direct_messages to authenticated;

create table if not exists public.asset_reviews (
  id bigint generated always as identity primary key,
  player_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in ('character','item','cosmetic')),
  asset_id text not null,
  rating integer not null check (rating between 1 and 5),
  review text not null default '' check (char_length(review) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(player_id, asset_type, asset_id)
);

alter table public.asset_reviews enable row level security;
drop policy if exists "Reviews are publicly readable" on public.asset_reviews;
create policy "Reviews are publicly readable" on public.asset_reviews for select to authenticated using (true);
drop policy if exists "Players can create own reviews" on public.asset_reviews;
create policy "Players can create own reviews" on public.asset_reviews for insert to authenticated with check (auth.uid() = player_id);
drop policy if exists "Players can update own reviews" on public.asset_reviews;
create policy "Players can update own reviews" on public.asset_reviews for update to authenticated using (auth.uid() = player_id) with check (auth.uid() = player_id);
drop policy if exists "Players can delete own reviews" on public.asset_reviews;
create policy "Players can delete own reviews" on public.asset_reviews for delete to authenticated using (auth.uid() = player_id);
grant select, insert, update, delete on public.asset_reviews to authenticated;

alter table public.characters add column if not exists model_url text;
alter table public.characters add column if not exists image_url text;
alter table public.characters add column if not exists price_sura bigint not null default 0 check (price_sura >= 0);
alter table public.catalog_assets add column if not exists price_sura bigint not null default 0 check (price_sura >= 0);
alter table public.catalog_assets add column if not exists image_url text;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'direct_messages'
    ) then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end
$$;

insert into public.characters (id, name, description, color, price_sura)
values (2, 'Celine', 'A Surelin character.', '#9bb9d1', 0)
on conflict (id) do update set name = excluded.name, description = excluded.description;
