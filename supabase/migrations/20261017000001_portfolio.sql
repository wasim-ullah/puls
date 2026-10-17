-- Puls — release 1: portfolio profiles at puls.so/@username.
-- Tables: profiles, categories, works (+ assets, results, credits).
-- Release 2 (verification, jury, awards) will add tables alongside these.

create extension if not exists citext;

-- ─────────────────────────────────────────────────────────────
-- Usernames
-- ─────────────────────────────────────────────────────────────
create table public.reserved_usernames (name citext primary key);
insert into public.reserved_usernames (name) values
  ('admin'),('api'),('about'),('account'),('auth'),('awards'),('blog'),('careers'),('dashboard'),
  ('directory'),('edit'),('explore'),('help'),('jury'),('judge'),('leaderboard'),('login'),('logout'),
  ('me'),('methodology'),('new'),('nominees'),('null'),('privacy'),('pricing'),('puls'),('root'),
  ('settings'),('signin'),('signup'),('static'),('submit'),('support'),('system'),('terms'),
  ('undefined'),('winners'),('work'),('www');

create type public.profile_kind as enum ('person', 'agency', 'team');
create type public.user_role as enum ('member', 'admin');

create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  username           citext unique,
  display_name       text not null default '',
  headline           text not null default '',
  bio                text not null default '',
  location           text not null default '',
  website            text not null default '',
  linkedin           text not null default '',
  avatar_url         text not null default '',
  kind               public.profile_kind not null default 'person',
  skills             text[] not null default '{}',
  available_for_work boolean not null default false,
  role               public.user_role not null default 'member',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  constraint profile_text_lens check (
    char_length(display_name) <= 80 and char_length(headline) <= 160 and char_length(bio) <= 1200
    and char_length(location) <= 80 and char_length(website) <= 200 and char_length(linkedin) <= 200
    and cardinality(skills) <= 12)
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.check_reserved_username() returns trigger
language plpgsql as $$
begin
  if new.username is not null
     and exists (select 1 from public.reserved_usernames r where r.name = new.username) then
    raise exception 'That username is reserved' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger profiles_reserved before insert or update of username on public.profiles
  for each row execute function public.check_reserved_username();

-- Anyone (signed in or not) can check a username before signing up.
-- Returns: 'available' | 'taken' | 'reserved' | 'invalid'
create or replace function public.username_status(p_name text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when p_name is null or lower(p_name) !~ '^[a-z0-9_]{3,30}$' then 'invalid'
    when exists (select 1 from public.reserved_usernames where name = lower(p_name)::citext) then 'reserved'
    when exists (select 1 from public.profiles where username = lower(p_name)::citext) then 'taken'
    else 'available'
  end;
$$;
grant execute on function public.username_status(text) to anon, authenticated;

-- New account → profile row. If they reserved a username on the homepage,
-- it travels in the sign-up metadata and is claimed here when still free.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare wanted text := lower(nullif(new.raw_user_meta_data ->> 'username', ''));
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80),
    case when public.username_status(wanted) = 'available' then wanted end
  );
  return new;
exception when unique_violation then
  -- Someone claimed it a moment earlier: create the profile without it.
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

-- Named for Puls so it can live alongside other apps' sign-up triggers in a shared project.
drop trigger if exists puls_on_auth_user_created on auth.users;
create trigger puls_on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id    smallserial primary key,
  slug  text not null unique,
  name  text not null,
  sort  smallint not null default 0
);

-- ─────────────────────────────────────────────────────────────
-- Works (portfolio items) — puls.so/@username/<slug>
-- ─────────────────────────────────────────────────────────────
create type public.work_status as enum ('draft', 'published', 'hidden');

create table public.works (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  slug          text not null,
  title         text not null default '',
  brand         text not null default '',
  agency        text not null default '',     -- agency / team that made it
  my_role       text not null default '',     -- what the owner did on it
  category_id   smallint references public.categories (id),
  markets       text[] not null default '{}',
  year          smallint check (year is null or year between 1990 and 2100),
  summary       text not null default '',     -- one or two lines for cards
  challenge     text not null default '',
  approach      text not null default '',
  outcome       text not null default '',
  cover_path    text not null default '',
  video_url     text not null default '',
  link_url      text not null default '',
  status        public.work_status not null default 'draft',
  sort          int not null default 0,       -- owner's ordering on their profile
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id, slug),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  constraint work_text_lens check (
    char_length(title) <= 120 and char_length(brand) <= 80 and char_length(agency) <= 80
    and char_length(my_role) <= 80 and char_length(summary) <= 280
    and char_length(challenge) <= 2000 and char_length(approach) <= 3000 and char_length(outcome) <= 2000
    and cardinality(markets) <= 10),
  constraint urls_are_http check (
    (video_url = '' or video_url ~* '^https://') and (link_url = '' or link_url ~* '^https?://'))
);
create index works_public_idx on public.works (status, published_at desc);
create index works_owner_idx on public.works (owner_id, sort);
create trigger works_touch before update on public.works
  for each row execute function public.touch_updated_at();

-- Publishing stamps the date and requires the basics.
create or replace function public.works_before_write() returns trigger
language plpgsql as $$
begin
  if new.status = 'published' then
    if char_length(new.title) < 2 then raise exception 'Add a title before publishing' using errcode = '23514'; end if;
    if new.cover_path = '' then raise exception 'Add a cover image before publishing' using errcode = '23514'; end if;
    if not exists (select 1 from public.profiles where id = new.owner_id and username is not null) then
      raise exception 'Choose your username before publishing' using errcode = '23514';
    end if;
    if new.published_at is null then new.published_at := now(); end if;
  end if;
  -- Only admins may set or clear "hidden".
  if (tg_op = 'INSERT' and new.status = 'hidden')
     or (tg_op = 'UPDATE' and (new.status = 'hidden') <> (old.status = 'hidden')) then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'This work was hidden by a moderator' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger works_rules before insert or update on public.works
  for each row execute function public.works_before_write();

create table public.work_assets (
  id       uuid primary key default gen_random_uuid(),
  work_id  uuid not null references public.works (id) on delete cascade,
  path     text not null,
  caption  text not null default '' check (char_length(caption) <= 200),
  sort     smallint not null default 0
);
create index work_assets_work_idx on public.work_assets (work_id, sort);

-- Self-reported results for release 1 (verification arrives in release 2).
create table public.work_results (
  id       uuid primary key default gen_random_uuid(),
  work_id  uuid not null references public.works (id) on delete cascade,
  value    text not null check (char_length(value) between 1 and 24),   -- "+184%", "3.4×", "−41%"
  metric   text not null check (char_length(metric) between 1 and 80),  -- "Online revenue"
  note     text not null default '' check (char_length(note) <= 120),   -- "vs. Ramadan 2025"
  sort     smallint not null default 0
);
create index work_results_work_idx on public.work_results (work_id, sort);

create table public.work_credits (
  id       uuid primary key default gen_random_uuid(),
  work_id  uuid not null references public.works (id) on delete cascade,
  role     text not null check (char_length(role) between 1 and 60),
  name     text not null check (char_length(name) between 1 and 80),
  sort     smallint not null default 0
);
create index work_credits_work_idx on public.work_credits (work_id, sort);

-- ─────────────────────────────────────────────────────────────
-- Permissions
-- ─────────────────────────────────────────────────────────────
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, display_name, headline, bio, location, website, linkedin, avatar_url, kind,
              skills, available_for_work)
  on public.profiles to authenticated;

revoke insert, update, delete on public.reserved_usernames, public.categories from anon, authenticated;
revoke insert, update, delete on public.works, public.work_assets, public.work_results, public.work_credits from anon;

alter table public.reserved_usernames enable row level security;
alter table public.profiles           enable row level security;
alter table public.categories         enable row level security;
alter table public.works              enable row level security;
alter table public.work_assets        enable row level security;
alter table public.work_results       enable row level security;
alter table public.work_credits       enable row level security;

create policy "reserved names are readable" on public.reserved_usernames for select using (true);
create policy "categories are public" on public.categories for select using (true);

create policy "profiles are public" on public.profiles for select using (true);
create policy "edit own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "published work is public" on public.works for select using (status = 'published');
create policy "owners see own work" on public.works for select to authenticated using (owner_id = auth.uid());
create policy "admins see all work" on public.works for select to authenticated using (public.is_admin());
create policy "add own work" on public.works for insert to authenticated with check (owner_id = auth.uid());
create policy "edit own work" on public.works for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy "delete own work" on public.works for delete to authenticated using (owner_id = auth.uid());

create or replace function public.owns_work(p_work uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.works w where w.id = p_work and w.owner_id = auth.uid());
$$;

-- Child rows follow their work: readable when the work is, editable by its owner.
create policy "read assets" on public.work_assets for select
  using (exists (select 1 from public.works w where w.id = work_id));
create policy "manage own assets" on public.work_assets for all to authenticated
  using (public.owns_work(work_id)) with check (public.owns_work(work_id));

create policy "read results" on public.work_results for select
  using (exists (select 1 from public.works w where w.id = work_id));
create policy "manage own results" on public.work_results for all to authenticated
  using (public.owns_work(work_id)) with check (public.owns_work(work_id));

create policy "read credits" on public.work_credits for select
  using (exists (select 1 from public.works w where w.id = work_id));
create policy "manage own credits" on public.work_credits for all to authenticated
  using (public.owns_work(work_id)) with check (public.owns_work(work_id));

-- ─────────────────────────────────────────────────────────────
-- Read helpers
-- ─────────────────────────────────────────────────────────────

-- Cards for galleries (explore, homepage, profiles). Respects the caller's permissions.
create or replace view public.work_cards with (security_invoker = true) as
select
  w.id, w.owner_id, w.slug, w.title, w.brand, w.agency, w.markets, w.year, w.summary, w.cover_path,
  w.status, w.sort, w.published_at, w.updated_at,
  c.slug as category_slug, c.name as category_name,
  p.username, p.display_name, p.avatar_url,
  (select r.value from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_value,
  (select r.metric from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_metric
from public.works w
join public.profiles p on p.id = w.owner_id
left join public.categories c on c.id = w.category_id;

grant select on public.work_cards to anon, authenticated;
