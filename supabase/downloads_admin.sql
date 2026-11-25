create or replace function public.is_surelin_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_accounts
    where account_id = auth.uid()
      and level in ('owner', 'admin')
  );
$$;

revoke all on function public.is_surelin_staff() from public;
grant execute on function public.is_surelin_staff() to authenticated;

create table if not exists public.download_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.download_links enable row level security;

drop policy if exists "Published downloads are public" on public.download_links;
create policy "Published downloads are public"
on public.download_links
for select
to anon, authenticated
using (active = true or public.is_surelin_staff());

drop policy if exists "Staff can add downloads" on public.download_links;
create policy "Staff can add downloads"
on public.download_links
for insert
to authenticated
with check (public.is_surelin_staff());

drop policy if exists "Staff can update downloads" on public.download_links;
create policy "Staff can update downloads"
on public.download_links
for update
to authenticated
using (public.is_surelin_staff())
with check (public.is_surelin_staff());

drop policy if exists "Staff can delete downloads" on public.download_links;
create policy "Staff can delete downloads"
on public.download_links
for delete
to authenticated
using (public.is_surelin_staff());

grant select on public.download_links to anon, authenticated;
grant insert, update, delete on public.download_links to authenticated;
