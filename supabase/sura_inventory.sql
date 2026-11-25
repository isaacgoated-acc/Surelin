create table if not exists public.staff_accounts (account_id uuid primary key references auth.users(id) on delete cascade, level text not null check (level in ('owner','admin')));
alter table public.staff_accounts enable row level security;
create or replace function public.is_surelin_staff() returns boolean language sql stable security definer set search_path = public as $function$ select exists (select 1 from public.staff_accounts where account_id = auth.uid() and level in ('owner','admin')); $function$;
revoke all on function public.is_surelin_staff() from public;
grant execute on function public.is_surelin_staff() to anon, authenticated;
create table if not exists public.profiles (id uuid primary key, username text not null unique, display_name text, bio text not null default '', avatar_url text, sura bigint not null default 0 check (sura >= 0), level integer not null default 1 check (level >= 1), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.profiles add column if not exists sura bigint not null default 0;
alter table public.profiles add column if not exists level integer not null default 1;
alter table public.profiles add column if not exists selected_character_id integer;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles enable row level security;
create or replace function public.ensure_selected_character_owned()
returns trigger
language plpgsql
security definer
set search_path = public
as $trigger$
begin
  if new.selected_character_id is not null and not exists (
    select 1 from public.player_inventory
    where player_id = new.id and asset_type = 'character' and asset_id = new.selected_character_id::text
  ) then
    raise exception 'You do not own that character';
  end if;
  return new;
end;
$trigger$;
drop trigger if exists profiles_selected_character_owned on public.profiles;
create trigger profiles_selected_character_owned before update of selected_character_id on public.profiles for each row execute function public.ensure_selected_character_owned();


drop policy if exists "Profiles are publicly viewable" on public.profiles;
create policy "Profiles are publicly viewable" on public.profiles for select to anon, authenticated using (true);

drop policy if exists "Players can edit their own profile" on public.profiles;
create policy "Players can edit their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

grant select on public.profiles to anon, authenticated;
grant update (username, display_name, bio, avatar_url, selected_character_id) on public.profiles to authenticated;

create table if not exists public.characters (
  id integer primary key,
  name text not null,
  description text not null default '',
  color text not null default '#8db4d8'
);

insert into public.characters (id, name, description, color)
values (1, 'Rawbt', 'The exclusive Rawbt character.', '#e8b5d0')
on conflict (id) do update set name = excluded.name, description = excluded.description, color = excluded.color;

create table if not exists public.catalog_assets (
  asset_type text not null check (asset_type in ('item', 'cosmetic')),
  asset_id text not null,
  name text not null,
  description text not null default '',
  primary key (asset_type, asset_id)
);

create table if not exists public.player_inventory (
  player_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null check (asset_type in ('character', 'item', 'cosmetic')),
  asset_id text not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (player_id, asset_type, asset_id)
);

alter table public.characters enable row level security;
alter table public.catalog_assets enable row level security;
alter table public.player_inventory enable row level security;

drop policy if exists "Characters are visible" on public.characters;
create policy "Characters are visible" on public.characters for select to anon, authenticated using (true);
drop policy if exists "Catalog is visible" on public.catalog_assets;
create policy "Catalog is visible" on public.catalog_assets for select to authenticated using (true);
drop policy if exists "Players can view their inventory" on public.player_inventory;
create policy "Players can view their inventory" on public.player_inventory for select to authenticated using (player_id = auth.uid());

grant select on public.characters to anon, authenticated;
grant select on public.catalog_assets to authenticated;
grant select on public.player_inventory to authenticated;

create or replace function public.admin_adjust_sura(target_username text, amount bigint, adjustment text)
returns bigint
language plpgsql
security definer
set search_path = public
as $function$
declare
  target_id uuid;
  new_balance bigint;
begin
  if not public.is_surelin_staff() then raise exception 'Staff permission required'; end if;
  if amount < 0 then raise exception 'Amount cannot be negative'; end if;
  select id into target_id from public.profiles where lower(username) = lower(trim(target_username)) limit 1;
  if target_id is null then raise exception 'Player not found'; end if;
  if adjustment = 'set' then
    new_balance := amount;
  elsif adjustment = 'give' then
    update public.profiles set sura = sura + amount, updated_at = now() where id = target_id returning sura into new_balance;
    return new_balance;
  else
    raise exception 'Adjustment must be give or set';
  end if;
  update public.profiles set sura = new_balance, updated_at = now() where id = target_id;
  return new_balance;
end;
$function$;

create or replace function public.admin_grant_asset(target_username text, p_asset_type text, p_asset_id text)
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  actor_name text;
  target_id uuid;
begin
  if not public.is_surelin_staff() then raise exception 'Staff permission required'; end if;
  select lower(username) into actor_name from public.profiles where id = auth.uid();
  if p_asset_type not in ('character', 'item', 'cosmetic') then raise exception 'Invalid asset type'; end if;
  if p_asset_type = 'character' and p_asset_id = '1' and actor_name not in ('isaacgoated', 'rawbt') then
    raise exception 'Only isaacgoated and rawbt can grant the Rawbt character';
  end if;
  if p_asset_type = 'character' and not exists (select 1 from public.characters where id::text = p_asset_id) then raise exception 'Character does not exist'; end if;
  if p_asset_type in ('item', 'cosmetic') and not exists (select 1 from public.catalog_assets where catalog_assets.asset_type = p_asset_type and catalog_assets.asset_id = p_asset_id) then
    insert into public.catalog_assets(asset_type, asset_id, name) values (p_asset_type, p_asset_id, p_asset_type || ' ' || p_asset_id) on conflict do nothing;
  end if;
  select id into target_id from public.profiles where lower(username) = lower(trim(target_username)) limit 1;
  if target_id is null then raise exception 'Player not found'; end if;
  insert into public.player_inventory(player_id, asset_type, asset_id, granted_by)
  values (target_id, p_asset_type, p_asset_id, auth.uid())
  on conflict (player_id, asset_type, asset_id) do nothing;
end;
$function$;

revoke all on function public.admin_adjust_sura(text, bigint, text) from public;
revoke all on function public.admin_grant_asset(text, text, text) from public;
grant execute on function public.admin_adjust_sura(text, bigint, text) to authenticated;
grant execute on function public.admin_grant_asset(text, text, text) to authenticated;

insert into public.staff_accounts(account_id, level) select id, case when lower(username) = 'isaacgoated' then 'owner' else 'admin' end from public.profiles where lower(username) in ('isaacgoated', 'rawbt') on conflict (account_id) do nothing;
