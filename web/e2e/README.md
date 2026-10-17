# Browser walkthrough

`flow.mjs` drives the site in Chromium through 21 steps: claim a username, sign in, set up the profile, add and publish work, check drafts stay private, explore and search, and check the mobile layout.

It runs against a local stand-in for Supabase:
- PostgREST in front of a Postgres database loaded with `supabase/tests/supabase_stubs.sql` and the migrations
- `fake-supabase.mjs` for sign-in and storage (magic links are written to `links.log`)

1. Start PostgREST on port 3001 with `jwt-secret` matching the one in `fake-supabase.mjs`.
2. `node fake-supabase.mjs`
3. Build the site with `VITE_SUPABASE_URL=http://localhost:54321`, `VITE_SUPABASE_ANON_KEY=$(node fake-supabase.mjs anon-key)` and `VITE_SITE_URL=http://localhost:4173`, then run `npx vite preview --port 4173`.
4. `npm i -D playwright && node flow.mjs`. You'll need four test images in the folder: `cover.png`, `g1.png`, `g2.png` and `avatar.png`.

You don't need any of this to run the site. It's only for re-testing after changes.
