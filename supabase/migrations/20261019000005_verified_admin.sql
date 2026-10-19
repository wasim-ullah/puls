-- Verified tick: granted only by an admin, after checking the person is who they say.
-- Members cannot set it (not in the profiles update grant). Sample profiles can never be verified.
alter table public.profiles add column if not exists is_sample boolean not null default false;
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists verified_at timestamptz;

create or replace function public.admin_set_verified(p_profile uuid, p_value boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can verify profiles' using errcode = '42501';
  end if;
  if p_value and exists (select 1 from public.profiles where id = p_profile and is_sample) then
    raise exception 'Sample profiles cannot be verified' using errcode = '23514';
  end if;
  update public.profiles
     set is_verified = p_value, verified_at = case when p_value then now() end
   where id = p_profile;
end $$;
revoke all on function public.admin_set_verified(uuid, boolean) from public, anon;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;

create or replace view public.work_cards with (security_invoker = true) as
select
  w.id, w.owner_id, w.slug, w.title, w.brand, w.agency, w.markets, w.year, w.summary, w.cover_path,
  w.status, w.sort, w.published_at, w.updated_at,
  c.slug as category_slug, c.name as category_name,
  p.username, p.display_name, p.avatar_url,
  (select r.value from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_value,
  (select r.metric from public.work_results r where r.work_id = w.id order by r.sort limit 1) as headline_metric,
  p.is_sample,
  p.is_verified
from public.works w
join public.profiles p on p.id = w.owner_id
left join public.categories c on c.id = w.category_id;
grant select on public.work_cards to anon, authenticated;
