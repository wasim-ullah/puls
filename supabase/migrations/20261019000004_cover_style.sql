-- Covers are drawn by Laud from each work's title and headline result.
-- These two columns remember the style and colour the member picked.
alter table public.works add column if not exists cover_style text not null default 'stat';
alter table public.works add column if not exists cover_color text not null default '#111111';
do $$ begin
  alter table public.works add constraint cover_style_check check (cover_style in ('stat', 'headline', 'bars', 'curve'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.works add constraint cover_color_check check (cover_color ~ '^#[0-9A-Fa-f]{6}$');
exception when duplicate_object then null; end $$;
