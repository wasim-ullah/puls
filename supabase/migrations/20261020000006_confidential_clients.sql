-- Confidential clients: show the results, describe the client, keep the name private.
-- When a work is marked confidential, its public brand is always blank and the real
-- client name lives in work_private, which only the owner (and admins) can read.
alter table public.works add column if not exists client_hidden boolean not null default false;
alter table public.works add column if not exists client_descriptor text not null default '';
do $$ begin
  alter table public.works add constraint client_descriptor_len check (char_length(client_descriptor) <= 80);
exception when duplicate_object then null; end $$;

create or replace function public.works_hide_client() returns trigger
language plpgsql as $$
begin
  if new.client_hidden then
    new.brand := '';
    if btrim(new.client_descriptor) = '' then new.client_descriptor := 'Confidential client'; end if;
  else
    new.client_descriptor := '';
  end if;
  return new;
end $$;
drop trigger if exists works_hide_client on public.works;
create trigger works_hide_client before insert or update on public.works
  for each row execute function public.works_hide_client();

create table if not exists public.work_private (
  work_id     uuid primary key references public.works (id) on delete cascade,
  client_name text not null default '' check (char_length(client_name) <= 80),
  updated_at  timestamptz not null default now()
);
alter table public.work_private enable row level security;
revoke all on public.work_private from anon;
grant select, insert, update, delete on public.work_private to authenticated;
drop policy if exists "owner manages private client" on public.work_private;
create policy "owner manages private client" on public.work_private for all to authenticated
  using (public.owns_work(work_id)) with check (public.owns_work(work_id));
drop policy if exists "admins read private client" on public.work_private;
create policy "admins read private client" on public.work_private for select to authenticated
  using (public.is_admin());

create or replace view public.work_cards with (security_invoker = true) as
select
  w.id, w.owner_id, w.slug, w.title, w.brand, w.agency, w.markets, w.year, w.summary, w.cover_path,
  w.status, w.sort, w.published_at, w.updated_at,
  c.slug as category_slug, c.name as category_name,
  p.username, p.display_name, p.avatar_url,
  (select r.value from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_value,
  (select r.metric from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_metric,
  p.is_sample,
  p.is_verified,
  w.client_hidden,
  w.client_descriptor
from public.works w
join public.profiles p on p.id = w.owner_id
left join public.categories c on c.id = w.category_id;
grant select on public.work_cards to anon, authenticated;
