-- 20 more Laud sample profiles: fictional people, brands and results, each labelled 'Sample' on the site.
-- Run after samples.sql. To remove every sample profile later, run supabase/samples_remove.sql.

begin;

-- Hana Al Sayed (@hana_alsayed)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('fe0d2199-ad21-55be-b78e-b7956369a9b4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+hana_alsayed@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "hana_alsayed", "full_name": "Hana Al Sayed"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'hana_alsayed', display_name = 'Hana Al Sayed', headline = 'Social media manager for F&B brands', bio = 'I run social for restaurants and cafe groups. Short video, local creators and a lot of food styling.',
  location = 'Doha, Qatar', kind = 'person', skills = array['Instagram','TikTok','Creators','F&B']::text[], available_for_work = true, is_sample = true
where id = 'fe0d2199-ad21-55be-b78e-b7956369a9b4';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('5007a81a-8a26-57d3-8705-c744df1ed5dd', 'fe0d2199-ad21-55be-b78e-b7956369a9b4', 'sabil-cafe-reels', 'Sabil Café: one reel a day', 'Sabil Café', '', 'Social lead',
  (select id from public.categories where slug = 'paid-social'), array['Qatar']::text[], 2025,
  'Ninety days of daily reels shot on one phone by the café team.', 'The café had great coffee and an empty Instagram.', 'Trained two baristas to shoot, set a daily format, and boosted only the top five reels each month.', 'Followers and weekday footfall both grew.',
  '/samples/sabil-cafe-reels.jpg', 'bars', '#7A3E2B', 'published', 0, now() - interval '4 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '5007a81a-8a26-57d3-8705-c744df1ed5dd', '+310%', 'Instagram followers', '90 days', 0 where not exists (select 1 from public.work_results where work_id = '5007a81a-8a26-57d3-8705-c744df1ed5dd' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '5007a81a-8a26-57d3-8705-c744df1ed5dd', '+19%', 'Weekday visits', '', 1 where not exists (select 1 from public.work_results where work_id = '5007a81a-8a26-57d3-8705-c744df1ed5dd' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('fc8ee216-40b4-51c0-9e9e-28a1a3373797', 'fe0d2199-ad21-55be-b78e-b7956369a9b4', 'mezze-house-launch', 'Mezze House opening week', 'Mezze House', '', 'Social lead',
  (select id from public.categories where slug = 'launch-gtm'), array['Qatar']::text[], 2024,
  'Opening-week campaign with twelve local food creators.', 'A new restaurant in a crowded district.', 'Invited twelve creators to a soft opening and released their videos on the same evening.', 'The first month was fully booked on weekends.',
  '/samples/mezze-house-launch.jpg', 'headline', '#FF4F00', 'published', 1, now() - interval '6 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'fc8ee216-40b4-51c0-9e9e-28a1a3373797', '100%', 'Weekend bookings', 'first month', 0 where not exists (select 1 from public.work_results where work_id = 'fc8ee216-40b4-51c0-9e9e-28a1a3373797' and sort = 0);

-- David Okafor (@david_okafor)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('e39cff75-c3d6-58b7-a016-fc9dd7381461', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+david_okafor@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "david_okafor", "full_name": "David Okafor"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'david_okafor', display_name = 'David Okafor', headline = 'Head of growth, consumer fintech', bio = 'Growth for consumer fintech in West Africa. Referral loops, USSD and app onboarding.',
  location = 'Lagos, Nigeria', kind = 'person', skills = array['Growth','Referral','Fintech','Onboarding']::text[], available_for_work = false, is_sample = true
where id = 'e39cff75-c3d6-58b7-a016-fc9dd7381461';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('bfab0475-ab1f-5d24-b012-bf5acf72a625', 'e39cff75-c3d6-58b7-a016-fc9dd7381461', 'kudi-referrals', 'Referrals that paid for themselves at Kudipay', 'Kudipay', '', 'Head of growth',
  (select id from public.categories where slug = 'launch-gtm'), array['Nigeria','Ghana']::text[], 2025,
  'A referral programme that rewarded the first real transaction, not the sign-up.', 'Paid installs were cheap but most users never transacted.', 'Rewards unlocked only after the referred friend sent their first transfer.', 'Referred users transacted at twice the rate of paid users.',
  '/samples/kudi-referrals.jpg', 'stat', '#1F7A4D', 'published', 0, now() - interval '8 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'bfab0475-ab1f-5d24-b012-bf5acf72a625', '2x', 'Transacting rate', 'vs paid installs', 0 where not exists (select 1 from public.work_results where work_id = 'bfab0475-ab1f-5d24-b012-bf5acf72a625' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'bfab0475-ab1f-5d24-b012-bf5acf72a625', '-46%', 'Cost per active user', '', 1 where not exists (select 1 from public.work_results where work_id = 'bfab0475-ab1f-5d24-b012-bf5acf72a625' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('ab66e2e9-61c1-53fe-8a85-96598e4c28a3', 'e39cff75-c3d6-58b7-a016-fc9dd7381461', 'kudi-onboarding', 'Onboarding in three screens', 'Kudipay', '', 'Head of growth',
  (select id from public.categories where slug = 'landing-pages'), array['Nigeria']::text[], 2024,
  'Cut onboarding from nine screens to three.', 'Half of sign-ups dropped before verifying their ID.', 'Moved ID checks after the first small transfer and pre-filled what the phone already knew.', 'Verified accounts rose and support calls fell.',
  '/samples/kudi-onboarding.jpg', 'curve', '#111111', 'published', 1, now() - interval '10 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'ab66e2e9-61c1-53fe-8a85-96598e4c28a3', '+58%', 'Verified accounts', '', 0 where not exists (select 1 from public.work_results where work_id = 'ab66e2e9-61c1-53fe-8a85-96598e4c28a3' and sort = 0);

-- Elena Rossi (@elena_rossi)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('299b60e6-5a02-55d0-9a11-a12987213b8e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+elena_rossi@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "elena_rossi", "full_name": "Elena Rossi"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'elena_rossi', display_name = 'Elena Rossi', headline = 'Brand strategist for fashion and beauty', bio = 'Brand strategy for fashion and beauty houses. Positioning, naming and launch narratives.',
  location = 'Milan, Italy', kind = 'person', skills = array['Brand Strategy','Positioning','Fashion','Beauty']::text[], available_for_work = true, is_sample = true
where id = '299b60e6-5a02-55d0-9a11-a12987213b8e';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('494d899e-2aad-5555-8acb-d500b3cf3cca', '299b60e6-5a02-55d0-9a11-a12987213b8e', 'verde-rebrand', 'Verde Atelier repositioning', 'Verde Atelier', '', 'Brand strategist',
  (select id from public.categories where slug = 'brand-film'), array['Italy','France']::text[], 2025,
  'Repositioned a heritage tailoring house for a younger audience without losing its clients.', 'Loyal clients were ageing and new customers saw the brand as formal.', 'Kept the craft story, changed the cast and moved the campaign onto the street.', 'New-customer share grew while repeat clients stayed.',
  '/samples/verde-rebrand.jpg', 'headline', '#2B4C7E', 'published', 0, now() - interval '12 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '494d899e-2aad-5555-8acb-d500b3cf3cca', '+34%', 'New customers', 'year on year', 0 where not exists (select 1 from public.work_results where work_id = '494d899e-2aad-5555-8acb-d500b3cf3cca' and sort = 0);

-- Tariq Nasser (@tariq_nasser)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('31197313-84f4-5e9d-8d7c-a9f576aa44ee', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+tariq_nasser@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "tariq_nasser", "full_name": "Tariq Nasser"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'tariq_nasser', display_name = 'Tariq Nasser', headline = 'Performance marketer for real estate', bio = 'Lead generation for off-plan property. Meta, Google, WhatsApp and a lot of call-centre feedback loops.',
  location = 'Dubai, UAE', kind = 'person', skills = array['Meta Ads','Lead Gen','Real Estate','WhatsApp']::text[], available_for_work = true, is_sample = true
where id = '31197313-84f4-5e9d-8d7c-a9f576aa44ee';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('00bc0177-9a7b-5479-be86-1ab14c29e9d9', '31197313-84f4-5e9d-8d7c-a9f576aa44ee', 'harbour-view-leads', 'Harbour View launch leads', 'Harbour View Residences', '', 'Performance lead',
  (select id from public.categories where slug = 'search-performance'), array['UAE','UK','India']::text[], 2025,
  'Lead campaign for an off-plan launch, tuned daily on sales-team feedback.', 'Leads were plentiful but the call centre rejected most of them.', 'Synced call outcomes back to ad platforms every night and optimised for qualified calls.', 'Qualified leads rose and the launch sold out its first phase.',
  '/samples/harbour-view-leads.jpg', 'stat', '#2E7FA8', 'published', 0, now() - interval '14 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '00bc0177-9a7b-5479-be86-1ab14c29e9d9', '3.1x', 'Qualified lead rate', '', 0 where not exists (select 1 from public.work_results where work_id = '00bc0177-9a7b-5479-be86-1ab14c29e9d9' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '00bc0177-9a7b-5479-be86-1ab14c29e9d9', '-42%', 'Cost per site visit', '', 1 where not exists (select 1 from public.work_results where work_id = '00bc0177-9a7b-5479-be86-1ab14c29e9d9' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('35900404-4ab9-5d19-8857-811a3fff5f3a', '31197313-84f4-5e9d-8d7c-a9f576aa44ee', 'whatsapp-nurture', 'WhatsApp nurture for investors', 'Harbour View Residences', '', 'Performance lead',
  (select id from public.categories where slug = 'email-crm'), array['UAE']::text[], 2024,
  'A WhatsApp sequence that sent floor plans, payment plans and a viewing slot.', 'Investors went cold within days of enquiring.', 'Five WhatsApp messages over ten days, each with one useful document.', 'More enquiries turned into viewings.',
  '/samples/whatsapp-nurture.jpg', 'bars', '#1F7A4D', 'published', 1, now() - interval '16 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '35900404-4ab9-5d19-8857-811a3fff5f3a', '+27%', 'Viewing bookings', '', 0 where not exists (select 1 from public.work_results where work_id = '35900404-4ab9-5d19-8857-811a3fff5f3a' and sort = 0);

-- Inès Moreau (@ines_moreau)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('3d8c077c-85ab-5669-a1bc-7888f634aa67', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+ines_moreau@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "ines_moreau", "full_name": "In\u00e8s Moreau"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'ines_moreau', display_name = 'Inès Moreau', headline = 'Content lead for B2B SaaS', bio = 'I build content engines for B2B SaaS. Research reports, SEO and the sales enablement that comes out of them.',
  location = 'Paris, France', kind = 'person', skills = array['SEO','Content','B2B','Research']::text[], available_for_work = false, is_sample = true
where id = '3d8c077c-85ab-5669-a1bc-7888f634aa67';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('84a1b7cd-039d-5e86-97cb-751d4707ae9f', '3d8c077c-85ab-5669-a1bc-7888f634aa67', 'ledger-report', 'The State of Mid-Market Finance report', 'Ledgerline', '', 'Content lead',
  (select id from public.categories where slug = 'content-seo'), array['France','Germany','UK']::text[], 2025,
  'An annual research report built from 600 CFO survey responses.', 'The blog ranked for nothing that buyers searched.', 'One flagship report, twenty articles from its data, and a sales deck for every chart.', 'The report became the top source of demo requests.',
  '/samples/ledger-report.jpg', 'stat', '#5B3FA0', 'published', 0, now() - interval '18 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '84a1b7cd-039d-5e86-97cb-751d4707ae9f', '1,900', 'Report downloads', 'first quarter', 0 where not exists (select 1 from public.work_results where work_id = '84a1b7cd-039d-5e86-97cb-751d4707ae9f' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '84a1b7cd-039d-5e86-97cb-751d4707ae9f', '+62%', 'Organic demo requests', '', 1 where not exists (select 1 from public.work_results where work_id = '84a1b7cd-039d-5e86-97cb-751d4707ae9f' and sort = 1);

-- Ravi Kumar (@ravi_kumar)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('ade456ca-b5cf-5f8e-88e3-57719300fdc7', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+ravi_kumar@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "ravi_kumar", "full_name": "Ravi Kumar"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'ravi_kumar', display_name = 'Ravi Kumar', headline = 'Marketing analytics and attribution', bio = 'I connect ad spend to revenue. Server-side tracking, MMM and dashboards people actually read.',
  location = 'Hyderabad, India', kind = 'person', skills = array['Analytics','GA4','Attribution','Looker Studio']::text[], available_for_work = true, is_sample = true
where id = 'ade456ca-b5cf-5f8e-88e3-57719300fdc7';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('a0e62156-617c-561b-9c40-6e711cbbbcaa', 'ade456ca-b5cf-5f8e-88e3-57719300fdc7', 'server-side-tracking', 'Server-side tracking for Cartwise', 'Cartwise', '', 'Analytics lead',
  (select id from public.categories where slug = 'search-performance'), array['India']::text[], 2025,
  'Moved an e-commerce site to server-side tracking before cookie changes hit.', 'Conversion data had gaps of nearly a third.', 'Server-side tagging, consent mode and offline conversion upload from the order system.', 'Ad platforms saw more conversions and bidding improved.',
  '/samples/server-side-tracking.jpg', 'curve', '#111111', 'published', 0, now() - interval '20 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'a0e62156-617c-561b-9c40-6e711cbbbcaa', '+29%', 'Conversions captured', '', 0 where not exists (select 1 from public.work_results where work_id = 'a0e62156-617c-561b-9c40-6e711cbbbcaa' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'a0e62156-617c-561b-9c40-6e711cbbbcaa', '-18%', 'Cost per order', '', 1 where not exists (select 1 from public.work_results where work_id = 'a0e62156-617c-561b-9c40-6e711cbbbcaa' and sort = 1);
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('5f4e5698-337f-5454-af5b-1b806c27441c', 'ade456ca-b5cf-5f8e-88e3-57719300fdc7', 'mmm-pilot', 'Media mix model pilot', 'Cartwise', '', 'Analytics lead',
  (select id from public.categories where slug = 'search-performance'), array['India']::text[], 2024,
  'A lightweight media mix model that moved budget out of brand search.', 'Every channel claimed credit for the same sales.', 'Built an open-source MMM on two years of weekly data and tested its advice with a holdout.', 'Budget moved to the channels the model and the test agreed on.',
  '/samples/mmm-pilot.jpg', 'headline', '#F4F4F1', 'published', 1, now() - interval '22 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '5f4e5698-337f-5454-af5b-1b806c27441c', '+12%', 'Revenue at same spend', '', 0 where not exists (select 1 from public.work_results where work_id = '5f4e5698-337f-5454-af5b-1b806c27441c' and sort = 0);

-- Amira Haddad (@amira_haddad)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('4bda0e45-7c51-5c44-98dd-5c1274462e42', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+amira_haddad@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "amira_haddad", "full_name": "Amira Haddad"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'amira_haddad', display_name = 'Amira Haddad', headline = 'Copywriter, English and Arabic', bio = 'Bilingual copywriter for banks, telecoms and NGOs. I write the line, then the hundred lines around it.',
  location = 'Beirut, Lebanon', kind = 'person', skills = array['Copywriting','Arabic','Brand Voice','Campaigns']::text[], available_for_work = true, is_sample = true
where id = '4bda0e45-7c51-5c44-98dd-5c1274462e42';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('2181e61b-b9cc-5cbf-aff2-5b00b15c53f3', '4bda0e45-7c51-5c44-98dd-5c1274462e42', 'cedar-bank-voice', 'Cedar Bank tone of voice', 'Cedar Bank', '', 'Copywriter',
  (select id from public.categories where slug = 'brand-film'), array['Lebanon','UAE']::text[], 2024,
  'A bilingual tone of voice for a bank that wanted to sound human.', 'Every message sounded like a legal notice in two languages.', 'Wrote the voice guide in both languages at once, then rewrote the 50 most-sent messages.', 'Complaints about unclear messages fell sharply.',
  '/samples/cedar-bank-voice.jpg', 'headline', '#7A3E2B', 'published', 0, now() - interval '24 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '2181e61b-b9cc-5cbf-aff2-5b00b15c53f3', '-40%', 'Complaints about clarity', '', 0 where not exists (select 1 from public.work_results where work_id = '2181e61b-b9cc-5cbf-aff2-5b00b15c53f3' and sort = 0);

-- Lucas Silva (@lucas_silva)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('811967c0-11d4-565f-948e-9bb3d44b54ac', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+lucas_silva@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "lucas_silva", "full_name": "Lucas Silva"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'lucas_silva', display_name = 'Lucas Silva', headline = 'Paid social for mobile games', bio = 'Creative testing at scale for mobile games. Hundreds of ads a month, most of them killed by Thursday.',
  location = 'São Paulo, Brazil', kind = 'person', skills = array['Creative Testing','TikTok','Mobile Games','Meta Ads']::text[], available_for_work = false, is_sample = true
where id = '811967c0-11d4-565f-948e-9bb3d44b54ac';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('910df7a2-71ae-559c-9c3f-0f8e4f8aa19b', '811967c0-11d4-565f-948e-9bb3d44b54ac', 'puzzle-quest-ua', 'Puzzle Harbor creative testing', 'Puzzle Harbor', '', 'UA lead',
  (select id from public.categories where slug = 'paid-social'), array['Brazil','Mexico']::text[], 2025,
  'A weekly creative-testing system that ran 400 ads a month.', 'Install costs kept rising as old creatives fatigued.', 'Weekly sprints with ten concepts, five hooks each, and automatic shutdown below target.', 'Install cost fell and day-seven retention held.',
  '/samples/puzzle-quest-ua.jpg', 'bars', '#FF4F00', 'published', 0, now() - interval '26 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '910df7a2-71ae-559c-9c3f-0f8e4f8aa19b', '-37%', 'Cost per install', '', 0 where not exists (select 1 from public.work_results where work_id = '910df7a2-71ae-559c-9c3f-0f8e4f8aa19b' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '910df7a2-71ae-559c-9c3f-0f8e4f8aa19b', '400', 'Ads tested a month', '', 1 where not exists (select 1 from public.work_results where work_id = '910df7a2-71ae-559c-9c3f-0f8e4f8aa19b' and sort = 1);

-- Yuki Sato (@yuki_sato)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('42c84b77-7926-5fb3-b129-93e53824ad38', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+yuki_sato@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "yuki_sato", "full_name": "Yuki Sato"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'yuki_sato', display_name = 'Yuki Sato', headline = 'Brand manager, consumer electronics', bio = 'Brand manager for audio products. Launches, retail and a lot of product photography.',
  location = 'Tokyo, Japan', kind = 'person', skills = array['Brand Management','Retail','Product Launch','Electronics']::text[], available_for_work = false, is_sample = true
where id = '42c84b77-7926-5fb3-b129-93e53824ad38';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('3db6484e-51b0-5f13-b61b-dbbbc46db264', '42c84b77-7926-5fb3-b129-93e53824ad38', 'hush-earbuds', 'Hush earbuds launch', 'Hush Audio', '', 'Brand manager',
  (select id from public.categories where slug = 'launch-gtm'), array['Japan','Korea']::text[], 2025,
  'Launched noise-cancelling earbuds with silent pop-up booths in train stations.', 'A crowded category with no clear reason to choose a new brand.', 'Six soundproof booths at busy stations where people could hear the silence for themselves.', 'The first production run sold through in four weeks.',
  '/samples/hush-earbuds.jpg', 'headline', '#111111', 'published', 0, now() - interval '28 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '3db6484e-51b0-5f13-b61b-dbbbc46db264', '4 weeks', 'Sell-through of first run', '', 0 where not exists (select 1 from public.work_results where work_id = '3db6484e-51b0-5f13-b61b-dbbbc46db264' and sort = 0);

-- Fatima Zahra (@fatima_zahra)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('213aa057-cd40-5a27-bd2c-93bac6b42b55', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+fatima_zahra@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "fatima_zahra", "full_name": "Fatima Zahra"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'fatima_zahra', display_name = 'Fatima Zahra', headline = 'CRM manager for e-commerce', bio = 'Email, SMS and loyalty for fashion e-commerce in North Africa and France.',
  location = 'Rabat, Morocco', kind = 'person', skills = array['Email','SMS','Loyalty','Klaviyo']::text[], available_for_work = true, is_sample = true
where id = '213aa057-cd40-5a27-bd2c-93bac6b42b55';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('6b4f7737-c233-5ea0-8216-8f68b229460e', '213aa057-cd40-5a27-bd2c-93bac6b42b55', 'loyalty-relaunch', 'Loyalty relaunch for Riad Mode', 'Riad Mode', '', 'CRM manager',
  (select id from public.categories where slug = 'email-crm'), array['Morocco','France']::text[], 2025,
  'Replaced a points scheme nobody used with three simple tiers.', 'Fewer than one in ten customers knew they had points.', 'Three tiers, one clear perk each, and a monthly email that showed progress.', 'Repeat purchase rate rose within two quarters.',
  '/samples/loyalty-relaunch.jpg', 'stat', '#5B3FA0', 'published', 0, now() - interval '30 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '6b4f7737-c233-5ea0-8216-8f68b229460e', '+23%', 'Repeat purchase rate', '', 0 where not exists (select 1 from public.work_results where work_id = '6b4f7737-c233-5ea0-8216-8f68b229460e' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '6b4f7737-c233-5ea0-8216-8f68b229460e', '61%', 'Members who know their tier', '', 1 where not exists (select 1 from public.work_results where work_id = '6b4f7737-c233-5ea0-8216-8f68b229460e' and sort = 1);

-- Oliver Grant (@oliver_grant)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('0a76e904-d388-52b8-b53e-6c9e13414698', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+oliver_grant@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "oliver_grant", "full_name": "Oliver Grant"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'oliver_grant', display_name = 'Oliver Grant', headline = 'Out-of-home and experiential', bio = 'OOH and experiential campaigns for retail and travel brands.',
  location = 'Sydney, Australia', kind = 'person', skills = array['OOH','Experiential','Retail','Travel']::text[], available_for_work = false, is_sample = true
where id = '0a76e904-d388-52b8-b53e-6c9e13414698';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('80f29aa4-6957-5622-841c-36d44b46957a', '0a76e904-d388-52b8-b53e-6c9e13414698', 'weather-billboards', 'Weather-triggered billboards for Coastline Air', 'Coastline Air', '', 'Strategist',
  (select id from public.categories where slug = 'out-of-home'), array['Australia']::text[], 2024,
  'Digital billboards that showed beach fares whenever it rained in the city.', 'Short-haul leisure travel dipped every winter.', 'Live weather data switched creative to the cheapest sunny destination when rain started.', 'Bookings from billboard cities rose during rainy weeks.',
  '/samples/weather-billboards.jpg', 'curve', '#2E7FA8', 'published', 0, now() - interval '32 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '80f29aa4-6957-5622-841c-36d44b46957a', '+26%', 'Rainy-week bookings', '', 0 where not exists (select 1 from public.work_results where work_id = '80f29aa4-6957-5622-841c-36d44b46957a' and sort = 0);

-- Noura Al Harbi (@noura_alharbi)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('03969813-59e6-5662-a051-0c0eb8c97e35', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+noura_alharbi@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "noura_alharbi", "full_name": "Noura Al Harbi"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'noura_alharbi', display_name = 'Noura Al Harbi', headline = 'Government and public sector campaigns', bio = 'Public awareness campaigns for health and transport. Behaviour change measured in behaviour, not reach.',
  location = 'Riyadh, KSA', kind = 'person', skills = array['Public Sector','Behaviour Change','Research','Arabic Content']::text[], available_for_work = false, is_sample = true
where id = '03969813-59e6-5662-a051-0c0eb8c97e35';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('6349b60d-d79b-5960-b914-a275b563b511', '03969813-59e6-5662-a051-0c0eb8c97e35', 'seatbelt-campaign', 'Back seat belts campaign', 'Riyadh Road Safety', '', 'Campaign lead',
  (select id from public.categories where slug = 'brand-film'), array['KSA']::text[], 2025,
  'A campaign that made back-seat belts about children copying their parents.', 'Back-seat belt use was low and fines alone were not working.', 'Short films shot from a child''s eye level, aired before school runs.', 'Observed back-seat belt use rose in roadside surveys.',
  '/samples/seatbelt-campaign.jpg', 'stat', '#1F7A4D', 'published', 0, now() - interval '34 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '6349b60d-d79b-5960-b914-a275b563b511', '+21 pts', 'Back-seat belt use', 'roadside survey', 0 where not exists (select 1 from public.work_results where work_id = '6349b60d-d79b-5960-b914-a275b563b511' and sort = 0);

-- Marco Bianchi (@marco_bianchi)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('c9228aa5-cb64-5864-9f65-e477278609eb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+marco_bianchi@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "marco_bianchi", "full_name": "Marco Bianchi"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'marco_bianchi', display_name = 'Marco Bianchi', headline = 'SEO lead for travel', bio = 'Technical and content SEO for travel and hospitality sites in six languages.',
  location = 'Rome, Italy', kind = 'person', skills = array['SEO','Technical SEO','Travel','Localisation']::text[], available_for_work = true, is_sample = true
where id = 'c9228aa5-cb64-5864-9f65-e477278609eb';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('711cdd95-7f35-55a1-b5ac-5684e5334d21', 'c9228aa5-cb64-5864-9f65-e477278609eb', 'villa-seo', 'Six languages, one villa site', 'Villa Serena', '', 'SEO lead',
  (select id from public.categories where slug = 'content-seo'), array['Italy','Germany','UK']::text[], 2024,
  'Rebuilt a villa rental site''s structure and translated its best pages properly.', 'Machine-translated pages ranked nowhere outside Italy.', 'Native writers for six languages, hreflang fixes and one guide per destination.', 'Non-Italian organic bookings grew strongly.',
  '/samples/villa-seo.jpg', 'bars', '#2B4C7E', 'published', 0, now() - interval '36 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '711cdd95-7f35-55a1-b5ac-5684e5334d21', '+180%', 'Non-Italian organic traffic', '', 0 where not exists (select 1 from public.work_results where work_id = '711cdd95-7f35-55a1-b5ac-5684e5334d21' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '711cdd95-7f35-55a1-b5ac-5684e5334d21', '+44%', 'Direct bookings', '', 1 where not exists (select 1 from public.work_results where work_id = '711cdd95-7f35-55a1-b5ac-5684e5334d21' and sort = 1);

-- Grace Lee (@grace_lee)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('7102fc16-a2bf-5ade-b5c0-5dae687d55cf', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+grace_lee@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "grace_lee", "full_name": "Grace Lee"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'grace_lee', display_name = 'Grace Lee', headline = 'Influencer marketing lead', bio = 'Influencer programmes for beauty brands across Korea and Southeast Asia.',
  location = 'Seoul, Korea', kind = 'person', skills = array['Influencers','Beauty','K-beauty','TikTok']::text[], available_for_work = true, is_sample = true
where id = '7102fc16-a2bf-5ade-b5c0-5dae687d55cf';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('11c70357-cbe5-50e0-8375-d98c38074d34', '7102fc16-a2bf-5ade-b5c0-5dae687d55cf', 'glowlab-creators', 'GlowLab creator programme', 'GlowLab', '', 'Influencer lead',
  (select id from public.categories where slug = 'paid-social'), array['Korea','Thailand','Vietnam']::text[], 2025,
  'A long-term programme with 40 micro-creators instead of one celebrity.', 'A celebrity campaign drove awareness but few sales.', 'Forty micro-creators on six-month contracts, each with a unique code.', 'Creator codes became the largest single sales channel.',
  '/samples/glowlab-creators.jpg', 'stat', '#FF4F00', 'published', 0, now() - interval '38 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '11c70357-cbe5-50e0-8375-d98c38074d34', '31%', 'Sales from creator codes', '', 0 where not exists (select 1 from public.work_results where work_id = '11c70357-cbe5-50e0-8375-d98c38074d34' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '11c70357-cbe5-50e0-8375-d98c38074d34', '5.8x', 'Return on creator spend', '', 1 where not exists (select 1 from public.work_results where work_id = '11c70357-cbe5-50e0-8375-d98c38074d34' and sort = 1);

-- Ahmed Rashid (@ahmed_rashid)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('adf3fc4d-c851-5a84-b442-e3402366fac2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+ahmed_rashid@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "ahmed_rashid", "full_name": "Ahmed Rashid"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'ahmed_rashid', display_name = 'Ahmed Rashid', headline = 'Marketing lead, logistics B2B', bio = 'B2B marketing for logistics and freight. LinkedIn, events and a sales team I sit next to.',
  location = 'Karachi, Pakistan', kind = 'person', skills = array['B2B','LinkedIn Ads','Events','Logistics']::text[], available_for_work = true, is_sample = true
where id = 'adf3fc4d-c851-5a84-b442-e3402366fac2';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('a1bf17e2-b44c-5735-b3ef-9c84ff653f26', 'adf3fc4d-c851-5a84-b442-e3402366fac2', 'freight-events', 'Shipper breakfasts for Indus Freight', 'Indus Freight', '', 'Marketing lead',
  (select id from public.categories where slug = 'b2b'), array['Pakistan','UAE']::text[], 2025,
  'Small breakfast events for 15 shippers at a time, followed by tailored quotes.', 'Large expos produced cards but no contracts.', 'Twelve breakfasts across three cities, each with a live rate comparison.', 'More contracts closed than from two years of expos.',
  '/samples/freight-events.jpg', 'headline', '#111111', 'published', 0, now() - interval '40 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'a1bf17e2-b44c-5735-b3ef-9c84ff653f26', '19', 'New contracts', '12 events', 0 where not exists (select 1 from public.work_results where work_id = 'a1bf17e2-b44c-5735-b3ef-9c84ff653f26' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'a1bf17e2-b44c-5735-b3ef-9c84ff653f26', '-70%', 'Cost per contract', 'vs expos', 1 where not exists (select 1 from public.work_results where work_id = 'a1bf17e2-b44c-5735-b3ef-9c84ff653f26' and sort = 1);

-- Sara Lindqvist (@sara_lindqvist)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('c3bb7534-0449-5d9d-b24d-a1ebf40551a4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+sara_lindqvist@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "sara_lindqvist", "full_name": "Sara Lindqvist"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'sara_lindqvist', display_name = 'Sara Lindqvist', headline = 'Product marketing for developer tools', bio = 'Product marketing for tools developers actually choose. Docs, launches and pricing pages.',
  location = 'Stockholm, Sweden', kind = 'person', skills = array['Product Marketing','Developer Tools','Pricing','Launch']::text[], available_for_work = false, is_sample = true
where id = 'c3bb7534-0449-5d9d-b24d-a1ebf40551a4';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('76f9be3d-6686-502f-a704-42f327fc1f29', 'c3bb7534-0449-5d9d-b24d-a1ebf40551a4', 'pricing-page', 'Pricing page rewrite for Stackfold', 'Stackfold', '', 'Product marketer',
  (select id from public.categories where slug = 'landing-pages'), array['Global']::text[], 2025,
  'Rewrote a confusing pricing page around what teams actually use.', 'Most trial users chose the wrong plan and churned.', 'Interviewed 30 customers and rebuilt plans around usage limits they recognised.', 'Trial-to-paid conversion rose and plan downgrades fell.',
  '/samples/pricing-page.jpg', 'bars', '#111111', 'published', 0, now() - interval '42 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '76f9be3d-6686-502f-a704-42f327fc1f29', '+41%', 'Trial to paid', '', 0 where not exists (select 1 from public.work_results where work_id = '76f9be3d-6686-502f-a704-42f327fc1f29' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '76f9be3d-6686-502f-a704-42f327fc1f29', '-33%', 'Downgrades', '', 1 where not exists (select 1 from public.work_results where work_id = '76f9be3d-6686-502f-a704-42f327fc1f29' and sort = 1);

-- Khalid Mansour (@khalid_mansour)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('ec36febf-63e6-5ee4-86c4-1ca8fc66b363', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+khalid_mansour@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "khalid_mansour", "full_name": "Khalid Mansour"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'khalid_mansour', display_name = 'Khalid Mansour', headline = 'Sports and events marketing', bio = 'Ticketing and fan campaigns for sports clubs and events in the Gulf.',
  location = 'Abu Dhabi, UAE', kind = 'person', skills = array['Sports','Ticketing','Events','Fan Engagement']::text[], available_for_work = true, is_sample = true
where id = 'ec36febf-63e6-5ee4-86c4-1ca8fc66b363';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('1a2d0c5d-770b-56ac-a2f2-b104bf2f08d0', 'ec36febf-63e6-5ee4-86c4-1ca8fc66b363', 'derby-tickets', 'Derby day ticketing campaign', 'Al Sahil FC', '', 'Marketing lead',
  (select id from public.categories where slug = 'paid-social'), array['UAE']::text[], 2024,
  'A ticket campaign aimed at families, with a fan zone opening three hours early.', 'Big matches sold out but regular league games played to empty stands.', 'Family bundles, early fan-zone entry and kids'' kits for the first thousand buyers.', 'Average league attendance rose across the season.',
  '/samples/derby-tickets.jpg', 'curve', '#1F7A4D', 'published', 0, now() - interval '44 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '1a2d0c5d-770b-56ac-a2f2-b104bf2f08d0', '+48%', 'Average attendance', 'league games', 0 where not exists (select 1 from public.work_results where work_id = '1a2d0c5d-770b-56ac-a2f2-b104bf2f08d0' and sort = 0);

-- Chloé Martin (@chloe_martin)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('2bd63d34-0164-5746-a61a-b6c25fb44be6', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+chloe_martin@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "chloe_martin", "full_name": "Chlo\u00e9 Martin"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'chloe_martin', display_name = 'Chloé Martin', headline = 'Email marketing for publishers', bio = 'Newsletter growth and monetisation for digital publishers.',
  location = 'Montreal, Canada', kind = 'person', skills = array['Newsletters','Email','Publishing','Monetisation']::text[], available_for_work = false, is_sample = true
where id = '2bd63d34-0164-5746-a61a-b6c25fb44be6';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('67935381-4d1b-5b51-9963-ca8f65831ae2', '2bd63d34-0164-5746-a61a-b6c25fb44be6', 'newsletter-growth', 'Morning brief newsletter growth', 'The Daily Maple', '', 'Newsletter lead',
  (select id from public.categories where slug = 'email-crm'), array['Canada']::text[], 2025,
  'Grew a morning newsletter with a referral programme and a better welcome series.', 'Sign-ups plateaued and new readers stopped opening within a week.', 'A three-email welcome series, a referral ladder and one sponsor slot per issue.', 'Subscribers and sponsor revenue both grew.',
  '/samples/newsletter-growth.jpg', 'stat', '#2B4C7E', 'published', 0, now() - interval '46 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select '67935381-4d1b-5b51-9963-ca8f65831ae2', '+120k', 'Subscribers', '12 months', 0 where not exists (select 1 from public.work_results where work_id = '67935381-4d1b-5b51-9963-ca8f65831ae2' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select '67935381-4d1b-5b51-9963-ca8f65831ae2', '2.4x', 'Sponsor revenue', '', 1 where not exists (select 1 from public.work_results where work_id = '67935381-4d1b-5b51-9963-ca8f65831ae2' and sort = 1);

-- Pulse Collective (@pulse_collective)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('afd81724-3eeb-59b6-aea1-0d60a7ae81b7', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+pulse_collective@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "pulse_collective", "full_name": "Pulse Collective"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'pulse_collective', display_name = 'Pulse Collective', headline = 'Creative studio for social-first brands', bio = 'A twelve-person studio making social-first campaigns for brands across Egypt and the Gulf.',
  location = 'Cairo, Egypt', kind = 'agency', skills = array['Creative','Social','Production','Arabic Content']::text[], available_for_work = true, is_sample = true
where id = 'afd81724-3eeb-59b6-aea1-0d60a7ae81b7';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('c1693646-99c2-549a-805d-e1d334d60c2b', 'afd81724-3eeb-59b6-aea1-0d60a7ae81b7', 'nile-juice-campaign', 'Nile Juice summer campaign', 'Nile Juice', '', 'Studio',
  (select id from public.categories where slug = 'paid-social'), array['Egypt']::text[], 2025,
  'A summer campaign built from 60 street interviews about the hottest day of the year.', 'A juice brand competing with cheaper local stalls.', 'Sixty street interviews cut into short, funny ads, released one a day through July.', 'Summer sales grew and the interviews became a recurring series.',
  '/samples/nile-juice-campaign.jpg', 'headline', '#FF4F00', 'published', 0, now() - interval '48 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'c1693646-99c2-549a-805d-e1d334d60c2b', '+33%', 'Summer sales', '', 0 where not exists (select 1 from public.work_results where work_id = 'c1693646-99c2-549a-805d-e1d334d60c2b' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'c1693646-99c2-549a-805d-e1d334d60c2b', '21M', 'Video views', '', 1 where not exists (select 1 from public.work_results where work_id = 'c1693646-99c2-549a-805d-e1d334d60c2b' and sort = 1);

-- Anna Kowalski (@anna_kowalski)
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values ('1899c66c-975a-5cc1-b36e-2bec146fbb11', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sample+anna_kowalski@laud.pro',
  '{"provider":"email","providers":["email"]}', '{"username": "anna_kowalski", "full_name": "Anna Kowalski"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
update public.profiles set username = 'anna_kowalski', display_name = 'Anna Kowalski', headline = 'Marketing operations lead', bio = 'Marketing ops for scale-ups. HubSpot, lead routing and the reports leadership reads on Monday.',
  location = 'Warsaw, Poland', kind = 'person', skills = array['Marketing Ops','HubSpot','Lead Routing','Reporting']::text[], available_for_work = true, is_sample = true
where id = '1899c66c-975a-5cc1-b36e-2bec146fbb11';
insert into public.works (id, owner_id, slug, title, brand, agency, my_role, category_id, markets, year, summary, challenge, approach, outcome,
  cover_path, cover_style, cover_color, status, sort, published_at)
values ('cdf5d52c-b2dd-53ff-b3a6-f7edd50e65ce', '1899c66c-975a-5cc1-b36e-2bec146fbb11', 'lead-routing', 'Five-minute lead routing at Tessly', 'Tessly', '', 'Marketing ops lead',
  (select id from public.categories where slug = 'b2b'), array['Poland','Germany']::text[], 2025,
  'Rebuilt lead routing so every demo request reached a rep within five minutes.', 'Demo requests waited hours in a shared inbox.', 'Round-robin routing by region and size, with Slack alerts and a fallback after three minutes.', 'Response time dropped and meetings booked rose.',
  '/samples/lead-routing.jpg', 'stat', '#111111', 'published', 0, now() - interval '50 days')
on conflict (id) do nothing;
insert into public.work_results (work_id, value, metric, note, sort) select 'cdf5d52c-b2dd-53ff-b3a6-f7edd50e65ce', '4 min', 'Median response time', 'from 6 hours', 0 where not exists (select 1 from public.work_results where work_id = 'cdf5d52c-b2dd-53ff-b3a6-f7edd50e65ce' and sort = 0);
insert into public.work_results (work_id, value, metric, note, sort) select 'cdf5d52c-b2dd-53ff-b3a6-f7edd50e65ce', '+36%', 'Meetings booked', '', 1 where not exists (select 1 from public.work_results where work_id = 'cdf5d52c-b2dd-53ff-b3a6-f7edd50e65ce' and sort = 1);

commit;
