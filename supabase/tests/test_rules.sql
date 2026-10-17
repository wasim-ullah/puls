-- Permission and workflow tests. Run after stubs + migrations + seed.
-- Every block prints PASS or raises.
\set ON_ERROR_STOP on
set client_min_messages = warning;

create or replace function pg_temp.expect_fail(sql text, label text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    raise notice 'PASS (blocked): % — %', label, sqlerrm;
    return;
  end;
  raise exception 'FAIL: % was allowed', label;
end $$;

create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'FAIL: %', label; end if;
  raise notice 'PASS: %', label;
end $$;

set client_min_messages = notice;

-- Sign-ups (as the auth service would do)
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'aisha@example.com', '{"username":"Aisha","full_name":"Aisha Rahman"}'),
  ('22222222-2222-2222-2222-222222222222', 'copy@example.com',  '{"username":"aisha"}'),
  ('33333333-3333-3333-3333-333333333333', 'admin@example.com', '{"username":"wasim"}'),
  ('44444444-4444-4444-4444-444444444444', 'nouser@example.com', '{"username":"admin"}');
update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

select pg_temp.check((select username = 'aisha' and display_name = 'Aisha Rahman' from profiles where id = '11111111-1111-1111-1111-111111111111'), 'reserved username claimed at sign-up (lower-cased)');
select pg_temp.check((select username is null from profiles where id = '22222222-2222-2222-2222-222222222222'), 'duplicate username not claimed');
select pg_temp.check((select username is null from profiles where id = '44444444-4444-4444-4444-444444444444'), 'reserved word not claimed');

-- Anonymous visitor checks names
set role anon;
select pg_temp.check(public.username_status('aisha') = 'taken', 'username_status taken');
select pg_temp.check(public.username_status('settings') = 'reserved', 'username_status reserved');
select pg_temp.check(public.username_status('ab') = 'invalid', 'username_status too short');
select pg_temp.check(public.username_status('new_name') = 'available', 'username_status available');
select pg_temp.expect_fail($$ update public.profiles set display_name = 'x' $$, 'anon edits profiles');
reset role;

-- User B (no username yet)
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select pg_temp.expect_fail($$ update public.profiles set username = 'explore' where id = auth.uid() $$, 'pick reserved username');
select pg_temp.expect_fail($$ update public.profiles set username = 'aisha' where id = auth.uid() $$, 'pick taken username');
select pg_temp.expect_fail($$ update public.profiles set role = 'admin' where id = auth.uid() $$, 'promote self to admin');
insert into public.works (id, owner_id, slug, title, cover_path)
  values ('bbbbbbbb-0000-0000-0000-000000000001', auth.uid(), 'my-work', 'My work', 'x/y.jpg');
select pg_temp.expect_fail($$ update public.works set status = 'published' where id = 'bbbbbbbb-0000-0000-0000-000000000001' $$, 'publish without a username');
update public.profiles set username = 'omar_k', display_name = 'Omar' where id = auth.uid();
update public.works set status = 'published' where id = 'bbbbbbbb-0000-0000-0000-000000000001';
select pg_temp.check((select published_at is not null from works where id = 'bbbbbbbb-0000-0000-0000-000000000001'), 'publish after choosing username stamps published_at');
reset role;

-- User A
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into public.works (id, owner_id, slug, title, brand, category_id)
  values ('aaaaaaaa-0000-0000-0000-000000000001', auth.uid(), 'zero-click-funnel', 'The Zero-Click Funnel', 'Ledgerly', 2);
insert into public.work_results (work_id, value, metric, note)
  values ('aaaaaaaa-0000-0000-0000-000000000001', '−52%', 'Cost per lead', 'vs. previous quarter');
insert into public.work_assets (work_id, path) values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111/a.jpg');
select pg_temp.expect_fail($$ update public.works set status = 'published' where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$, 'publish without cover');
select pg_temp.expect_fail($$ insert into public.works (owner_id, slug, title) values ('22222222-2222-2222-2222-222222222222', 'x', 'spoof') $$, 'create work for someone else');
select pg_temp.expect_fail($$ insert into public.works (owner_id, slug, title) values (auth.uid(), 'Bad Slug!', 'x') $$, 'invalid slug');
select pg_temp.expect_fail($$ insert into public.works (owner_id, slug, title, video_url) values (auth.uid(), 'vid', 'x', 'javascript:alert(1)') $$, 'non-https video url');
select pg_temp.expect_fail($$ insert into public.works (owner_id, slug, title, status) values (auth.uid(), 'hid', 'x', 'hidden') $$, 'owner sets hidden');
select pg_temp.expect_fail($$ insert into public.work_results (work_id, value, metric) values ('bbbbbbbb-0000-0000-0000-000000000001', '+1', 'hijack') $$, 'add results to another user''s work');
select pg_temp.check((select count(*) = 0 from public.works where id = 'bbbbbbbb-0000-0000-0000-000000000001' and title = 'hacked'), 'sanity');
update public.works set title = 'hacked' where id = 'bbbbbbbb-0000-0000-0000-000000000001';
select pg_temp.check((select count(*) = 0 from public.works where title = 'hacked'), 'cannot edit another user''s work (0 rows)');
delete from public.works where id = 'bbbbbbbb-0000-0000-0000-000000000001';
reset role;
select pg_temp.check((select count(*) = 1 from public.works where id = 'bbbbbbbb-0000-0000-0000-000000000001'), 'cannot delete another user''s work');

-- Anonymous visitor sees only published work and its children
set role anon;
select pg_temp.check((select count(*) = 1 from public.works), 'anon sees only published works');
select pg_temp.check((select count(*) = 0 from public.work_results), 'anon cannot see results of a draft');
select pg_temp.check((select count(*) = 0 from public.work_assets), 'anon cannot see assets of a draft');
select pg_temp.check((select count(*) = 1 from public.work_cards), 'work_cards respects visibility');
select pg_temp.check((select username = 'omar_k' from public.work_cards limit 1), 'work_cards carries username');
reset role;

-- A publishes; anon now sees it
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
update public.works set cover_path = '11111111-1111-1111-1111-111111111111/cover.jpg', status = 'published'
  where id = 'aaaaaaaa-0000-0000-0000-000000000001';
reset role;
set role anon;
select pg_temp.check((select count(*) = 2 from public.works), 'anon sees newly published work');
select pg_temp.check((select headline_value = '−52%' from public.work_cards where slug = 'zero-click-funnel'), 'headline result on card');
reset role;

-- Admin hides; owner cannot unhide
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
update public.works set status = 'hidden' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select pg_temp.expect_fail($$ update public.works set status = 'published' where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$, 'owner unhides moderated work');
reset role;
set role anon;
select pg_temp.check((select count(*) = 1 from public.works), 'hidden work disappears from public');
reset role;

-- Storage folders
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into storage.objects (bucket_id, name) values ('work-media', '11111111-1111-1111-1111-111111111111/w/cover.jpg');
select pg_temp.expect_fail($$ insert into storage.objects (bucket_id, name) values ('work-media', '22222222-2222-2222-2222-222222222222/w/x.jpg') $$, 'upload into someone else''s folder');
select pg_temp.expect_fail($$ insert into storage.objects (bucket_id, name) values ('other', '11111111-1111-1111-1111-111111111111/x.jpg') $$, 'upload into unknown bucket');
reset role;

-- Deleting an account removes profile and work
delete from auth.users where id = '22222222-2222-2222-2222-222222222222';
select pg_temp.check((select count(*) = 0 from public.works where owner_id = '22222222-2222-2222-2222-222222222222'), 'account deletion cascades');

select 'ALL TESTS PASSED' as result;
