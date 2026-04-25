# Scalable SPA Migration with v0, Supabase, and Cloud Hosting

CIS329 Rich Internet Applications - Mario Cuevas

A React single-page app backed by Supabase (auth + Postgres) and deployed to
Google Cloud Platform. Public visitors browse a product catalog; signed-in
customers manage their profile and order history; admins get a full CRUD
interface for the products table directly from the UI.

## Repository layout

```
full-stack/
  app/                React SPA (Vite + React 18 + react-router-dom)
    src/
      context/        AuthContext: user + role + session
      components/     Navbar, ProductCard, ProtectedRoute, Spinner
      pages/          Home, Login, Signup, Profile, Admin, NotFound
      lib/            supabaseClient.js
      styles/         globals.css
    .env.example      copy to .env.local
  database/
    schema.sql        tables, indexes, is_admin(), signup trigger
    rls-policies.sql  row-level security (public read, admin write, per-user orders)
    seed-data.sql     12 products across 4 categories
  docs/
    component-hierarchy.md   component tree, state flow, auth diagram
    lighthouse-audit.pdf     Lighthouse report (Performance/Accessibility/BP/SEO)
```

## Prerequisites

- Node.js 18 or newer
- A Supabase project (free tier is fine)
- A GCP account with billing enabled (only needed for deployment)

## Supabase setup

1. Create a new project at https://supabase.com/dashboard.
2. In the SQL editor, run the three files in order:
   - `database/schema.sql`
   - `database/rls-policies.sql`
   - `database/seed-data.sql`
3. Authentication > Providers: enable **Email** and enable **Google**. For
   Google, follow Supabase's OAuth setup and paste the callback URL they
   give you into the Google Cloud Console OAuth credentials screen.
4. Settings > API: copy the project URL and the `anon` public key.

To promote a user to admin, sign them up through the app first, then run
this in the Supabase SQL editor:

```sql
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'you@example.com');
```

## Running locally

```bash
cd app
cp .env.example .env.local
# edit .env.local with your Supabase URL and anon key
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Building for production

```bash
cd app
npm run build
npm run preview   # optional: serve the built output at :4173
```

The production bundle lands in `app/dist/`.

## Deployment

Deployed to Google Cloud Run using `app/Dockerfile` and `app/cloudbuild.yaml`.
The container serves the static Vite build through nginx (`app/nginx.conf`).

```bash
cd app
gcloud builds submit --config cloudbuild.yaml
```

## Environment variables

Only two, and both live in `app/.env.local`:

| Name                    | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `VITE_SUPABASE_URL`     | Your project URL from Supabase API settings |
| `VITE_SUPABASE_ANON_KEY`| The anon/public key (safe for the browser)  |

The anon key is safe on the client because every table is gated by Row
Level Security. The service role key is never used in this project and
should never be committed or shipped to the browser.

## Deliverables checklist

- [x] Live GCP URL: https://rich-inter-spa-1015753113669.us-central1.run.app
- [x] GitHub repository with this README
- [x] Demo video: https://www.loom.com/share/f7716bddcc474b8e9940ae07ac0d0c87
- [x] Lighthouse audit PDF showing 90+ scores (`docs/lighthouse-audit.pdf`)
- [x] SQL export (`database/schema.sql`)

## License

Coursework, no license assigned.
