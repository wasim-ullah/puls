# Laud — release 1

Portfolios for marketers. Each person gets **laud.pro/@username**, adds their work (images, video, story, results, credits), and shares one link. Jury scoring, verified results and awards are planned for release 2.

```
laud/
├── web/        The website (React + Vite). Deploys to Vercel.
└── supabase/   Database, security rules and file storage. Runs on Supabase.
```

Everything below fits within the free plans of Supabase and Vercel. The only cost is the domain.

---

## 1. Set up Supabase (about 10 minutes)

1. Create a project at [supabase.com](https://supabase.com). Choose a region near your users; Frankfurt or Mumbai suits the GCC.
2. Open **SQL Editor**, paste the whole of `supabase/setup.sql` and press **Run** once. It contains everything below in one file. Or run these files in order, pasting each one and pressing Run:
   1. `supabase/migrations/20261017000001_portfolio.sql`
   2. `supabase/migrations/20261017000002_storage.sql`
   3. `supabase/seed.sql` (adds the categories)
3. Go to **Authentication → URL Configuration**:
   - **Site URL:** `https://laud.pro`
   - **Redirect URLs:** add `https://laud.pro/**`, plus `http://localhost:5173/**` for local development.
4. **Authentication → Emails → SMTP Settings.** Supabase's built-in email only sends a few messages an hour, which is enough for testing but not for a launch. Connect a free sender such as Resend (3,000 emails a month free): create an account, verify the `laud.pro` domain, and paste its SMTP details here.
5. Optional: **Authentication → Emails → Templates → Magic Link.** Edit the subject to read "Your Laud sign-in link".
6. Optional: to allow sign-in with Google, enable it under **Authentication → Providers → Google**, then set `VITE_ENABLE_GOOGLE=true` below.
7. Copy the **Project URL** and **anon public key** from **Project Settings → API**.

## 2. Run it on your computer

```bash
cd web
cp .env.example .env      # paste your Project URL and anon key into .env
npm install
npm run dev               # opens on http://localhost:5173
```

## 3. Put it live on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Change these settings before you deploy:
   - **Root Directory:** `web` (click Edit next to it)
   - **Framework Preset:** Vite (usually detected automatically)
   - **Environment Variables:**

     | Name | Value |
     |---|---|
     | `VITE_SUPABASE_URL` | your Supabase Project URL |
     | `VITE_SUPABASE_ANON_KEY` | your Supabase anon public key |
     | `VITE_SITE_URL` | `https://laud.pro`, or your `….vercel.app` address until the domain is connected |
     | `VITE_ENABLE_GOOGLE` | `true` only if you turned on Google sign-in |
4. Click **Deploy**.
5. Under **Settings → Domains**, add `laud.pro` and follow the DNS instructions Vercel shows.
6. In Supabase, go to **Authentication → URL Configuration** and add your `….vercel.app` address to the Redirect URLs as well (for example `https://laud-xyz.vercel.app/**`).

If you connected Supabase through Vercel's Supabase integration instead, you can skip `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The site also reads the `SUPABASE_URL` and `SUPABASE_ANON_KEY` variables that the integration adds. It never puts the integration's secret keys (service role, JWT secret, Postgres password) into the website.

These variables are read when the site is built. After changing one, open **Deployments**, click the three dots on the latest deployment and choose **Redeploy**.

`web/vercel.json` already sends every address to the app, so links like `/@username` work when opened directly.

Vercel's free Hobby plan is for non-commercial use. That's fine while Laud is free. Once you start charging (paid entries, ads or sponsorships), move to Vercel Pro (about $20 a month) or to Cloudflare Pages, which allows commercial use for free.

## Sample profiles (optional)

To fill the site before launch, run `supabase/samples.sql` in the Supabase SQL Editor. It adds 8 fictional marketers and agencies with 14 pieces of work. Run `supabase/samples_more.sql` after it for 20 more profiles (24 more pieces). Each one is labelled "Sample" on its card, profile and work page, and none of them can log in. Cover images are in `web/public/samples/`.

When real members arrive, run `supabase/samples_remove.sql` to delete every sample profile and its work. Real accounts are not touched.

## 4. Make yourself an admin

After you sign up on the live site, run this in the Supabase SQL Editor, replacing the email with yours:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

As an admin you get an **Admin** link in your account menu (laud.pro/admin). There you can give a blue verified tick to people you have checked, and hide or restore work. Sample profiles can never be verified. The same can be done in SQL:

```sql
update public.works set status = 'hidden' where id = '…';     -- hide
update public.works set status = 'published' where id = '…';  -- restore
```

The owner keeps their work but can't republish it. A moderation screen is planned for release 2.

---

## What's in release 1

| Page | Address | What it does |
|---|---|---|
| Home | `/` | Hero with "claim your username", latest work, categories |
| Explore | `/explore` | All published work, with category filter and search |
| Profile | `/@username` | Photo, headline, stats, work grid, about, skills, links |
| Work page | `/@username/work-slug` | Cover, gallery, video, story, results, credits, more from this person |
| Log in / sign up | `/login` | Email magic link, with optional Google sign-in |
| Add or edit work | `/new`, `/edit/:id` | Full submission form with image uploads; save a draft or publish |
| My work | `/dashboard` | Every piece, its status, publish and unpublish, reorder, delete, profile checklist |
| Settings | `/settings` | Username, photo, name, headline, bio, skills, links, "available for work" |

**How claiming a username works.** On the homepage a visitor types a name and sees live whether it's available, taken or reserved. They then enter their email and click the link they receive. The account is created with that username already claimed. If someone takes the name in the meantime, they're asked to pick another one.

**Security.** Every rule is enforced in the database, not just in the browser:

- People can only edit their own profile and work.
- Drafts, and their images and results, are invisible to everyone else.
- Nobody can make themselves an admin.
- Uploads can only go into the uploader's own folder.
- A title and a username are required before anything is published. Covers are drawn automatically from the title and headline result, so every card matches.
- Video links only embed from YouTube and Vimeo.
- Words like `settings`, `explore` and `admin` can't be taken as usernames.

**Storage.** Supabase's free plan includes 1 GB of files. Large photos are resized in the browser before upload, which keeps typical images at around 300–600 KB.

## Tests

- **Database rules** (34 checks covering sign-up, username claiming, permissions, publishing rules, moderation and uploads) run against plain Postgres:
  `PGHOST=… PGPORT=… PGUSER=postgres supabase/tests/run.sh`
- **Full browser walkthrough** (21 steps: claim a username, sign in, fill the profile, add and publish work, drafts stay private, explore and search, the mobile layout) passed against a local copy of the database. The scripts for it are in `web/e2e/`.

## Release 2 (planned)

Verified results (platform connections or client sign-off), the monthly jury and public votes, scoring, Laud of the Day / Month / Year, a moderation screen, and follows. The database was designed so these can be added as new tables without changing release 1 data.
