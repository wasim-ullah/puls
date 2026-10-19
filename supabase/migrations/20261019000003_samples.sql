-- Sample profiles: clearly labelled demo accounts that fill the site before launch.
-- Members cannot set this flag themselves (it is not in the profiles update grant).
alter table public.profiles add column if not exists is_sample boolean not null default false;

create or replace view public.work_cards with (security_invoker = true) as
select
  w.id, w.owner_id, w.slug, w.title, w.brand, w.agency, w.markets, w.year, w.summary, w.cover_path,
  w.status, w.sort, w.published_at, w.updated_at,
  c.slug as category_slug, c.name as category_name,
  p.username, p.display_name, p.avatar_url,
  (select r.value from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_value,
  (select r.metric from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_metric,
  p.is_sample
from public.works w
join public.profiles p on p.id = w.owner_id
left join public.categories c on c.id = w.category_id;

grant select on public.work_cards to anon, authenticated;
