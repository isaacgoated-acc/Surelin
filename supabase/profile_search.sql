create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text not null default '',
  avatar_url text,
  sura bigint not null default 0 check (sura >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  chosen_username := coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1));
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
select id,
       coalesce(nullif(raw_user_meta_data->>'username', ''), split_part(email, '@', 1)),
       coalesce(nullif(raw_user_meta_data->>'display_name', ''), nullif(raw_user_meta_data->>'username', ''), split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
