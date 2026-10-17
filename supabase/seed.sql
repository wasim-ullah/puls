-- Puls — starting categories. Safe to re-run.
insert into public.categories (slug, name, sort) values
  ('paid-social',          'Paid Social',           1),
  ('search-performance',   'Search & Performance',  2),
  ('brand-film',           'Brand & Film',          3),
  ('email-crm',            'Email & CRM',           4),
  ('content-seo',          'Content & SEO',         5),
  ('landing-pages',        'Landing Pages',         6),
  ('launch-gtm',           'Launch & GTM',          7),
  ('b2b',                  'B2B',                   8),
  ('out-of-home',          'Out-of-Home',           9)
on conflict (slug) do nothing;

-- After you sign up on the live site, make yourself an admin (replace the email):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
