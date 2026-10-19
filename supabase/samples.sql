-- Laud sample profiles: fictional people, brands and results that show how the site works.
-- Every profile here is marked is_sample, shows a 'Sample' label on the site, and cannot log in.
-- Run once in the Supabase SQL Editor (after migration 20261019000003_samples.sql).
-- To remove them all later, run supabase/samples_remove.sql.

-- Part 1: the sample flag (safe to run more than once).
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

-- Part 2: the sample profiles.

begin;

-- Layla Haddad (@layla_haddad)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('d5095721-fe8e-5095-84ee-aef54f355d14', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+layla_haddad@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "layla_haddad", "full_name": "Layla Haddad"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'layla_haddad', display_name = 'Layla Haddad', headline = 'Performance lead for GCC retail and e-commerce', bio = 'Eight years running paid media for retail and e-commerce brands across the Gulf. I like messy account structures and clean attribution.',
  location = 'Dubai, UAE', kind = 'person', skills = array['Paid Social','Meta Ads','Google Ads','Attribution','E-commerce']::text[], available_for_work = true, is_sample = true
where id = 'd5095721-fe8e-5095-84ee-aef54f355d14';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('95613ac7-0c46-5795-9830-a1c13a1f6d61', 'd5095721-fe8e-5095-84ee-aef54f355d14', 'ramadan-always-on', 'Ramadan always-on for Halaya Skincare', 'Halaya Skincare', '', 'Paid media lead',
  (select id from public.categories where slug = 'paid-social'), array['UAE','KSA']::text[], 2025,
  'Rebuilt the Ramadan paid social plan around late-night viewing and gifting, with creative that changed every week of the month.', 'Ramadan CPMs doubled while the brand''s budget stayed flat, and last year''s campaign spent half its money before the gifting peak.', 'Shifted delivery to 9pm to 2am, split the month into four creative chapters, and moved budget weekly toward gifting bundles.', 'Revenue grew while cost per purchase fell, and the gifting bundles sold out in the final week.',
  '/samples/ramadan-always-on.jpg', 'published', 0, now() - interval '2 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '95613ac7-0c46-5795-9830-a1c13a1f6d61', '+64%', 'Online revenue', 'vs Ramadan last year', 0 where not exists (select 1 from public.work_results where work_id = '95613ac7-0c46-5795-9830-a1c13a1f6d61' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '95613ac7-0c46-5795-9830-a1c13a1f6d61', '-31%', 'Cost per purchase', '', 1 where not exists (select 1 from public.work_results where work_id = '95613ac7-0c46-5795-9830-a1c13a1f6d61' and sort = 1);
insert into public.work_results (work_id, value, metric, note, sort) select '95613ac7-0c46-5795-9830-a1c13a1f6d61', '4.2x', 'ROAS', '', 2 where not exists (select 1 from public.work_results where work_id = '95613ac7-0c46-5795-9830-a1c13a1f6d61' and sort = 2);
insert into public.work_credits (work_id, role, name, sort) select '95613ac7-0c46-5795-9830-a1c13a1f6d61', 'Creative', 'Omar Farouk', 0 where not exists (select 1 from public.work_credits where work_id = '95613ac7-0c46-5795-9830-a1c13a1f6d61' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '95613ac7-0c46-5795-9830-a1c13a1f6d61', 'Media buying', 'Layla Haddad', 1 where not exists (select 1 from public.work_credits where work_id = '95613ac7-0c46-5795-9830-a1c13a1f6d61' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('31d31b98-cc12-5f2b-a3d8-40b9eb5cad86', 'd5095721-fe8e-5095-84ee-aef54f355d14', 'marsa-cycles-launch', 'Launching Marsa Cycles in the UAE', 'Marsa Cycles', '', 'Growth lead',
  (select id from public.categories where slug = 'launch-gtm'), array['UAE']::text[], 2024,
  'Took a new e-bike brand from zero to sold-out first batch with a waitlist, test rides and creator content.', 'An unknown brand with a premium price and no store, launching in summer heat.', 'A waitlist with a refundable deposit, weekend test rides at two beaches, and twenty local creators filming real commutes.', 'The first batch sold out before stock landed, and deposits paid for the launch media.',
  '/samples/marsa-cycles-launch.jpg', 'published', 1, now() - interval '5 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '31d31b98-cc12-5f2b-a3d8-40b9eb5cad86', '2,400', 'Waitlist sign-ups', 'in 6 weeks', 0 where not exists (select 1 from public.work_results where work_id = '31d31b98-cc12-5f2b-a3d8-40b9eb5cad86' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '31d31b98-cc12-5f2b-a3d8-40b9eb5cad86', '100%', 'First batch sold', '', 1 where not exists (select 1 from public.work_results where work_id = '31d31b98-cc12-5f2b-a3d8-40b9eb5cad86' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select '31d31b98-cc12-5f2b-a3d8-40b9eb5cad86', 'Content', 'Rana Saleh', 0 where not exists (select 1 from public.work_credits where work_id = '31d31b98-cc12-5f2b-a3d8-40b9eb5cad86' and sort = 0);

-- Arjun Mehta (@arjun_mehta)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('7610e932-1cd8-56a2-899a-0496b7666e4c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+arjun_mehta@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "arjun_mehta", "full_name": "Arjun Mehta"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'arjun_mehta', display_name = 'Arjun Mehta', headline = 'Search and CRO for fintech', bio = 'I work where search intent meets landing pages. Mostly fintech and insurance, mostly measured in qualified applications.',
  location = 'Bengaluru, India', kind = 'person', skills = array['Google Ads','SEO','CRO','Landing Pages','Fintech']::text[], available_for_work = false, is_sample = true
where id = '7610e932-1cd8-56a2-899a-0496b7666e4c';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('29c24a7b-a19a-5dc3-a4d8-64d7a22216a3', '7610e932-1cd8-56a2-899a-0496b7666e4c', 'orbitpay-landing-tests', 'Twelve landing page tests for Orbitpay', 'Orbitpay', '', 'CRO lead',
  (select id from public.categories where slug = 'landing-pages'), array['India']::text[], 2025,
  'A quarter of disciplined A/B tests on Orbitpay''s card application page, one change at a time.', 'Paid traffic was healthy but only one in nine visitors finished the card application.', 'Twelve sequential tests: shorter form, fee table above the fold, instant eligibility check, and trust badges near the button.', 'Completion more than doubled, and the eligibility check became the default across all products.',
  '/samples/orbitpay-landing-tests.jpg', 'published', 0, now() - interval '8 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3', '2.3x', 'Application completion', '', 0 where not exists (select 1 from public.work_results where work_id = '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3', '-38%', 'Cost per approved card', '', 1 where not exists (select 1 from public.work_results where work_id = '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3', 'Design', 'Priya Nair', 0 where not exists (select 1 from public.work_credits where work_id = '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3', 'Engineering', 'Kiran Rao', 1 where not exists (select 1 from public.work_credits where work_id = '29c24a7b-a19a-5dc3-a4d8-64d7a22216a3' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('447bf8c5-e4eb-5615-a773-2a4826bbc8ea', '7610e932-1cd8-56a2-899a-0496b7666e4c', 'lantern-insurance-search', 'Rebuilding search for Lantern Insurance', 'Lantern Insurance', '', 'Search lead',
  (select id from public.categories where slug = 'search-performance'), array['India']::text[], 2024,
  'Restructured 900 ad groups into 40 intent themes and matched each to its own landing page.', 'Years of keyword sprawl meant budget was spread thin and quality scores were low.', 'Clustered search terms by intent, rebuilt the account around themes, and wrote one landing page per theme.', 'Leads grew at the same budget and the account became manageable by one person.',
  '/samples/lantern-insurance-search.jpg', 'published', 1, now() - interval '11 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '447bf8c5-e4eb-5615-a773-2a4826bbc8ea', '+47%', 'Qualified leads', 'same budget', 0 where not exists (select 1 from public.work_results where work_id = '447bf8c5-e4eb-5615-a773-2a4826bbc8ea' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '447bf8c5-e4eb-5615-a773-2a4826bbc8ea', '6 to 8', 'Average quality score', '', 1 where not exists (select 1 from public.work_results where work_id = '447bf8c5-e4eb-5615-a773-2a4826bbc8ea' and sort = 1);

-- Sofia Marín (@sofia_marin)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('6eeb2f77-3dbb-5375-986a-ea5da2c78b42', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+sofia_marin@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "sofia_marin", "full_name": "Sofia Mar\u00edn"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'sofia_marin', display_name = 'Sofia Marín', headline = 'Brand and film for consumer brands', bio = 'Strategist turned producer. I write briefs that directors want to shoot and track what the film actually did afterwards.',
  location = 'Madrid, Spain', kind = 'person', skills = array['Brand Strategy','Film','Creative Direction','YouTube']::text[], available_for_work = true, is_sample = true
where id = '6eeb2f77-3dbb-5375-986a-ea5da2c78b42';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('402cc1e7-99ff-57fa-94c2-0b39a0002aaf', '6eeb2f77-3dbb-5375-986a-ea5da2c78b42', 'kettle-and-crumb-film', 'Kettle & Crumb: Slow Mornings', 'Kettle & Crumb', 'Casa Norte', 'Strategist and producer',
  (select id from public.categories where slug = 'brand-film'), array['Spain','Portugal']::text[], 2025,
  'A 60-second film about the one slow breakfast of the week, cut into six-second moments for social.', 'A bakery chain everyone knew but nobody chose on purpose.', 'One quiet film shot in a real kitchen, with no voiceover and one line of text at the end.', 'Brand recall rose and Sunday sales grew in every region the film ran.',
  '/samples/kettle-and-crumb-film.jpg', 'published', 0, now() - interval '14 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '402cc1e7-99ff-57fa-94c2-0b39a0002aaf', '+22 pts', 'Ad recall', 'brand lift study', 0 where not exists (select 1 from public.work_results where work_id = '402cc1e7-99ff-57fa-94c2-0b39a0002aaf' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '402cc1e7-99ff-57fa-94c2-0b39a0002aaf', '+11%', 'Sunday sales', '', 1 where not exists (select 1 from public.work_results where work_id = '402cc1e7-99ff-57fa-94c2-0b39a0002aaf' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select '402cc1e7-99ff-57fa-94c2-0b39a0002aaf', 'Director', 'Inés Calvo', 0 where not exists (select 1 from public.work_credits where work_id = '402cc1e7-99ff-57fa-94c2-0b39a0002aaf' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '402cc1e7-99ff-57fa-94c2-0b39a0002aaf', 'Agency', 'Casa Norte', 1 where not exists (select 1 from public.work_credits where work_id = '402cc1e7-99ff-57fa-94c2-0b39a0002aaf' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('2d05d2bc-7f0a-5c38-a4e8-de4f4a40f343', '6eeb2f77-3dbb-5375-986a-ea5da2c78b42', 'fennec-shoes-ooh', 'Fennec Shoes: Walk the City', 'Fennec Shoes', 'Casa Norte', 'Creative strategist',
  (select id from public.categories where slug = 'out-of-home'), array['Spain']::text[], 2024,
  'Billboards that counted the steps between them and the nearest store.', 'A new shoe store network that people walked past without noticing.', 'Each billboard showed the step count to the closest store, updated with the route.', 'Store visits from nearby areas grew during the eight-week run.',
  '/samples/fennec-shoes-ooh.jpg', 'published', 1, now() - interval '17 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '2d05d2bc-7f0a-5c38-a4e8-de4f4a40f343', '+18%', 'Store visits', 'in flight areas', 0 where not exists (select 1 from public.work_results where work_id = '2d05d2bc-7f0a-5c38-a4e8-de4f4a40f343' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '2d05d2bc-7f0a-5c38-a4e8-de4f4a40f343', 'Design', 'Pablo Ruiz', 0 where not exists (select 1 from public.work_credits where work_id = '2d05d2bc-7f0a-5c38-a4e8-de4f4a40f343' and sort = 0);

-- Omar Farouk (@omar_farouk)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('80f43b8b-fdda-5791-8910-c67b3d752da0', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+omar_farouk@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "omar_farouk", "full_name": "Omar Farouk"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'omar_farouk', display_name = 'Omar Farouk', headline = 'Creative lead, Arabic-first social content', bio = 'I make social content that sounds like how people in the Gulf actually talk. Arabic first, then everything else.',
  location = 'Riyadh, KSA', kind = 'person', skills = array['Copywriting','Arabic Content','TikTok','Creative Direction']::text[], available_for_work = true, is_sample = true
where id = '80f43b8b-fdda-5791-8910-c67b3d752da0';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a', '80f43b8b-fdda-5791-8910-c67b3d752da0', 'tamrah-dates-tiktok', 'Tamrah Dates on TikTok', 'Tamrah Dates', '', 'Creative lead',
  (select id from public.categories where slug = 'paid-social'), array['KSA']::text[], 2025,
  'A grandmother-and-grandson series about date varieties that turned a gift brand into a daily snack.', 'Dates were seen as a Ramadan gift, not something you buy in October.', 'Twenty short episodes where a grandmother taught her grandson one variety at a time, in Najdi dialect.', 'Off-season sales grew and the series was picked up by two TV morning shows.',
  '/samples/tamrah-dates-tiktok.jpg', 'published', 0, now() - interval '20 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a', '38M', 'Views', 'organic and paid', 0 where not exists (select 1 from public.work_results where work_id = 'b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a', '+29%', 'Off-season sales', '', 1 where not exists (select 1 from public.work_results where work_id = 'b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select 'b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a', 'Production', 'Studio Rimal', 0 where not exists (select 1 from public.work_credits where work_id = 'b5ef9b1c-28f9-53ff-8527-a2b5f6f96c4a' and sort = 0);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('933b2c51-15b2-577d-99a2-7353e0e176e7', '80f43b8b-fdda-5791-8910-c67b3d752da0', 'sahm-fitness-launch', 'Sahm Fitness: Ladies'' hours', 'Sahm Fitness', '', 'Copy and concept',
  (select id from public.categories where slug = 'launch-gtm'), array['KSA']::text[], 2024,
  'Launch campaign for women-only gym hours, written with members rather than about them.', 'A gym chain opening women-only hours to an audience that had never been asked.', 'Interviewed forty members and built every line of the campaign from their words.', 'Membership targets for the new hours were reached in half the planned time.',
  '/samples/sahm-fitness-launch.jpg', 'published', 1, now() - interval '23 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '933b2c51-15b2-577d-99a2-7353e0e176e7', '2x', 'Speed to membership target', '', 0 where not exists (select 1 from public.work_results where work_id = '933b2c51-15b2-577d-99a2-7353e0e176e7' and sort = 0);

-- Northbeam Studio (@northbeam_studio)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('d218eecd-f7c5-5844-9ffa-958e1133eb8a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+northbeam_studio@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "northbeam_studio", "full_name": "Northbeam Studio"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'northbeam_studio', display_name = 'Northbeam Studio', headline = 'Lifecycle and CRM agency', bio = 'A small CRM agency for subscription brands. We design lifecycle programmes, write the emails, and report on retention, not opens.',
  location = 'London, UK', kind = 'agency', skills = array['Email','CRM','Lifecycle','Klaviyo','Retention']::text[], available_for_work = true, is_sample = true
where id = 'd218eecd-f7c5-5844-9ffa-958e1133eb8a';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('0a2baaf8-273b-5e89-abf4-eb54652806da', 'd218eecd-f7c5-5844-9ffa-958e1133eb8a', 'brightbox-win-back', 'Brightbox Storage win-back programme', 'Brightbox Storage', 'Northbeam Studio', 'Agency',
  (select id from public.categories where slug = 'email-crm'), array['UK']::text[], 2025,
  'A five-step win-back flow for customers who cancelled self-storage plans.', 'Churned customers were never contacted again after cancelling.', 'Five emails over sixty days, each tied to a life moment: moving, renovating, a new baby, a new job.', 'One in eight lapsed customers came back within three months.',
  '/samples/brightbox-win-back.jpg', 'published', 0, now() - interval '26 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '0a2baaf8-273b-5e89-abf4-eb54652806da', '12.5%', 'Win-back rate', '90 days', 0 where not exists (select 1 from public.work_results where work_id = '0a2baaf8-273b-5e89-abf4-eb54652806da' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '0a2baaf8-273b-5e89-abf4-eb54652806da', '£410k', 'Recovered annual revenue', '', 1 where not exists (select 1 from public.work_results where work_id = '0a2baaf8-273b-5e89-abf4-eb54652806da' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select '0a2baaf8-273b-5e89-abf4-eb54652806da', 'Strategy', 'Hannah Cole', 0 where not exists (select 1 from public.work_credits where work_id = '0a2baaf8-273b-5e89-abf4-eb54652806da' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '0a2baaf8-273b-5e89-abf4-eb54652806da', 'Copy', 'Theo Grant', 1 where not exists (select 1 from public.work_credits where work_id = '0a2baaf8-273b-5e89-abf4-eb54652806da' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('6142e517-723f-5dcb-874b-6afda45a5c74', 'd218eecd-f7c5-5844-9ffa-958e1133eb8a', 'paloma-kitchen-onboarding', 'Paloma Kitchen onboarding', 'Paloma Kitchen', 'Northbeam Studio', 'Agency',
  (select id from public.categories where slug = 'email-crm'), array['UK','Ireland']::text[], 2024,
  'Rewrote the first fourteen days of a meal-kit subscription around the first cooked meal.', 'Half of new subscribers skipped their second box.', 'Every message in the first two weeks pointed to one goal: cook the first recipe within 48 hours of delivery.', 'Second-box retention rose and support tickets about recipes fell.',
  '/samples/paloma-kitchen-onboarding.jpg', 'published', 1, now() - interval '29 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '6142e517-723f-5dcb-874b-6afda45a5c74', '+21%', 'Second-box retention', '', 0 where not exists (select 1 from public.work_results where work_id = '6142e517-723f-5dcb-874b-6afda45a5c74' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '6142e517-723f-5dcb-874b-6afda45a5c74', 'Lifecycle', 'Hannah Cole', 0 where not exists (select 1 from public.work_credits where work_id = '6142e517-723f-5dcb-874b-6afda45a5c74' and sort = 0);

-- Mei Tanaka (@mei_tanaka)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('942e4645-cb41-5247-b03c-3fd9432c8643', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+mei_tanaka@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "mei_tanaka", "full_name": "Mei Tanaka"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'mei_tanaka', display_name = 'Mei Tanaka', headline = 'B2B demand gen for SaaS', bio = 'I build pipeline for B2B SaaS across APAC. Account-based, content-led, and honest about attribution.',
  location = 'Singapore', kind = 'person', skills = array['ABM','LinkedIn Ads','B2B','HubSpot','Content']::text[], available_for_work = false, is_sample = true
where id = '942e4645-cb41-5247-b03c-3fd9432c8643';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('d04ee9fe-de89-5fb0-958a-6902209bf648', '942e4645-cb41-5247-b03c-3fd9432c8643', 'rivet-crm-abm', 'Account-based pilot for Rivet CRM', 'Rivet CRM', '', 'Demand gen lead',
  (select id from public.categories where slug = 'b2b'), array['Singapore','Australia']::text[], 2025,
  'An ABM pilot on 150 named accounts, with sales and marketing working off one shared list.', 'Marketing leads were plentiful but sales accepted fewer than one in ten.', 'A shared list of 150 accounts, tailored LinkedIn ads per industry, and SDR follow-up within one day of engagement.', 'Pipeline from target accounts grew and sales acceptance rose sharply.',
  '/samples/rivet-crm-abm.jpg', 'published', 0, now() - interval '32 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'd04ee9fe-de89-5fb0-958a-6902209bf648', '$2.1M', 'Pipeline created', '6 months', 0 where not exists (select 1 from public.work_results where work_id = 'd04ee9fe-de89-5fb0-958a-6902209bf648' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'd04ee9fe-de89-5fb0-958a-6902209bf648', '41%', 'Sales acceptance rate', 'up from 9%', 1 where not exists (select 1 from public.work_results where work_id = 'd04ee9fe-de89-5fb0-958a-6902209bf648' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select 'd04ee9fe-de89-5fb0-958a-6902209bf648', 'Sales', 'Daniel Lim', 0 where not exists (select 1 from public.work_credits where work_id = 'd04ee9fe-de89-5fb0-958a-6902209bf648' and sort = 0);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('cf2f8940-c7f9-5d94-8fdb-73b29b33f501', '942e4645-cb41-5247-b03c-3fd9432c8643', 'atlas-learn-webinars', 'Atlas Learn webinar series', 'Atlas Learn', '', 'Content lead',
  (select id from public.categories where slug = 'content-seo'), array['APAC']::text[], 2024,
  'A monthly webinar series for HR leaders, cut into articles, clips and a newsletter.', 'Organic traffic had flatlined and the blog had no point of view.', 'One expert webinar a month, turned into four articles, ten clips and a newsletter issue.', 'Organic traffic and newsletter sign-ups both grew through the year.',
  '/samples/atlas-learn-webinars.jpg', 'published', 1, now() - interval '35 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'cf2f8940-c7f9-5d94-8fdb-73b29b33f501', '+140%', 'Organic traffic', 'year on year', 0 where not exists (select 1 from public.work_results where work_id = 'cf2f8940-c7f9-5d94-8fdb-73b29b33f501' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'cf2f8940-c7f9-5d94-8fdb-73b29b33f501', '9,800', 'Newsletter subscribers', '', 1 where not exists (select 1 from public.work_results where work_id = 'cf2f8940-c7f9-5d94-8fdb-73b29b33f501' and sort = 1);

-- Karim Bensaid (@karim_bensaid)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('a01cc7f7-0a30-5182-8877-d6f55227e48f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+karim_bensaid@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "karim_bensaid", "full_name": "Karim Bensaid"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'karim_bensaid', display_name = 'Karim Bensaid', headline = 'Growth marketer for consumer apps', bio = 'App growth across MENA and France. Onboarding, referrals and the paid campaigns that feed them.',
  location = 'Casablanca, Morocco', kind = 'person', skills = array['App Growth','Referral','Onboarding','Firebase']::text[], available_for_work = true, is_sample = true
where id = 'a01cc7f7-0a30-5182-8877-d6f55227e48f';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('a0b1a308-78fc-538e-87d8-e0f1696c78ba', 'a01cc7f7-0a30-5182-8877-d6f55227e48f', 'ziba-home-referrals', 'Referral loop for Ziba Home', 'Ziba Home', '', 'Growth lead',
  (select id from public.categories where slug = 'launch-gtm'), array['Morocco','France']::text[], 2025,
  'A two-sided referral programme built into the home-services booking flow.', 'Paid installs were getting expensive and word of mouth was not tracked.', 'Both people got a discount on their next booking, with the invite shown right after a five-star rating.', 'Referrals became the second-largest source of new customers.',
  '/samples/ziba-home-referrals.jpg', 'published', 0, now() - interval '38 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'a0b1a308-78fc-538e-87d8-e0f1696c78ba', '27%', 'New users from referral', '', 0 where not exists (select 1 from public.work_results where work_id = 'a0b1a308-78fc-538e-87d8-e0f1696c78ba' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'a0b1a308-78fc-538e-87d8-e0f1696c78ba', '-44%', 'Blended acquisition cost', '', 1 where not exists (select 1 from public.work_results where work_id = 'a0b1a308-78fc-538e-87d8-e0f1696c78ba' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select 'a0b1a308-78fc-538e-87d8-e0f1696c78ba', 'Product', 'Yasmine Alaoui', 0 where not exists (select 1 from public.work_credits where work_id = 'a0b1a308-78fc-538e-87d8-e0f1696c78ba' and sort = 0);

-- Dunewell Marketing Team (@dunewell_team)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('e525f20a-e3b9-5159-a12d-b5d0d408b9f9', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+dunewell_team@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "dunewell_team", "full_name": "Dunewell Marketing Team"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'dunewell_team', display_name = 'Dunewell Marketing Team', headline = 'In-house brand team at Dunewell Water', bio = 'The in-house team behind Dunewell Water. Brand, digital and trade marketing under one roof.',
  location = 'Abu Dhabi, UAE', kind = 'team', skills = array['Brand','Sustainability','Retail','OOH']::text[], available_for_work = false, is_sample = true
where id = 'e525f20a-e3b9-5159-a12d-b5d0d408b9f9';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, status, sort, published_at)
values ('4def7297-44c7-5cc3-982b-923005d83bab', 'e525f20a-e3b9-5159-a12d-b5d0d408b9f9', 'refill-not-landfill', 'Refill, not landfill', 'Dunewell Water', '', 'In-house team',
  (select id from public.categories where slug = 'out-of-home'), array['UAE']::text[], 2025,
  'Refill stations at metro stops, with screens that counted the bottles saved that day.', 'A bottled water brand under pressure to cut single-use plastic.', 'Free refill stations at twelve metro stops, each with a live counter and a QR code for a reusable bottle.', 'Bottles saved became the campaign''s main message, and reusable bottle sales grew.',
  '/samples/refill-not-landfill.jpg', 'published', 0, now() - interval '41 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '4def7297-44c7-5cc3-982b-923005d83bab', '1.2M', 'Bottles saved', 'first 6 months', 0 where not exists (select 1 from public.work_results where work_id = '4def7297-44c7-5cc3-982b-923005d83bab' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '4def7297-44c7-5cc3-982b-923005d83bab', '+35%', 'Reusable bottle sales', '', 1 where not exists (select 1 from public.work_results where work_id = '4def7297-44c7-5cc3-982b-923005d83bab' and sort = 1);
insert into public.work_credits (work_id, role, name, sort) select '4def7297-44c7-5cc3-982b-923005d83bab', 'Brand', 'Dunewell team', 0 where not exists (select 1 from public.work_credits where work_id = '4def7297-44c7-5cc3-982b-923005d83bab' and sort = 0);
insert into public.work_credits (work_id, role, name, sort) select '4def7297-44c7-5cc3-982b-923005d83bab', 'Installation', 'Metro partners', 1 where not exists (select 1 from public.work_credits where work_id = '4def7297-44c7-5cc3-982b-923005d83bab' and sort = 1);

commit;
