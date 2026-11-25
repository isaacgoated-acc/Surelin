create table if not exists public.profiles (
  id uuid primary key,
  username text not null unique,
  display_name text,
  bio text not null default '',
  avatar_url text,
  sura bigint not null default 0 check (sura >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly viewable" on public.profiles;
create policy "Profiles are publicly viewable"
on public.profiles for select
to anon, authenticated using (true);

drop policy if exists "Players can create their own profile" on public.profiles;
create policy "Players can create their own profile"
on public.profiles for insert
to authenticated with check (auth.uid() = id);

drop policy if exists "Players can edit their own profile" on public.profiles;
create policy "Players can edit their own profile"
on public.profiles for update
to authenticated using (auth.uid() = id) with check (auth.uid() = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert on public.profiles to authenticated;
grant update (username, display_name, bio, avatar_url) on public.profiles to authenticated;

create or replace function public.create_surelin_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_username text;
begin
  chosen_username := coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(coalesce(new.email, 'player'), '@', 1));
  if exists (select 1 from public.profiles where username = chosen_username and id <> new.id) then
    chosen_username := left(chosen_username, 15) || '_' || substr(new.id::text, 1, 8);
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, chosen_username, chosen_username)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_surelin_profile on auth.users;
create trigger on_auth_user_created_surelin_profile
after insert on auth.users
for each row execute function public.create_surelin_profile();

insert into public.profiles (id, username, display_name)
select
  users.id,
  case
    when exists (select 1 from public.profiles p where p.username = coalesce(nullif(users.raw_user_meta_data->>'username', ''), split_part(coalesce(users.email, 'player'), '@', 1)) and p.id <> users.id)
      then left(coalesce(nullif(users.raw_user_meta_data->>'username', ''), split_part(coalesce(users.email, 'player'), '@', 1)), 15) || '_' || substr(users.id::text, 1, 8)
    else coalesce(nullif(users.raw_user_meta_data->>'username', ''), split_part(coalesce(users.email, 'player'), '@', 1))
  end,
  coalesce(nullif(users.raw_user_meta_data->>'display_name', ''), nullif(users.raw_user_meta_data->>'username', ''), split_part(coalesce(users.email, 'player'), '@', 1))
from auth.users users
on conflict (id) do nothing;
