# VØYD MVP

**Idea → Startup Launch Package**

A web app that takes an idea and produces a structured startup launch package: market research, competitor map, MVP feature list, product/tech plan, launch marketing plan, and 5 ready-to-use content pieces — plus a CEO assistant that coordinates internal agents (Research, Product, CTO, Marketing, Finance).

## Quick Start

### 1. Environment

Create `.env.local` in the project root and fill in:

Required:

- `NEXT_PUBLIC_SUPABASE_URL` — from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (for orchestrator; never expose client-side)
- `OPENROUTER_KEY` — from [OpenRouter](https://openrouter.ai/keys)

**Public landing vs full app (waitlist launch)**

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_APP_ACCESS` | Set to `waitlist` to hide the product from the public: only the marketing site + waitlist are available unless the visitor has a **dev access cookie** (see below). Use `open` (or omit) for normal local/staging where anyone can use **Launch App** after login. |
| `DEV_ACCESS_PASSWORD` | Server-only secret. Team members visit `/dev-access`, submit this password; on success an httpOnly cookie is set so `/login`, `/signup`, `/dashboard`, and `/project/*` work. **Required in production** when `NEXT_PUBLIC_APP_ACCESS=waitlist` (unless you rely only on `NODE_ENV=development` bypass). |
| `DEV_ALLOWED_EMAILS` | Optional comma-separated allowlist (e.g. `you@domain.com,cofounder@domain.com`). If set, only these emails may use the app after sign-in; others are redirected home. |

**Flow when `NEXT_PUBLIC_APP_ACCESS=waitlist`**

1. Visitors browse `/` and use **Join Waitlist** only (Launch App is hidden in the dock).
2. Developers open `/dev-access` (bookmark; not linked on the site), enter `DEV_ACCESS_PASSWORD`, then sign in at `/login`.
3. In **development** (`npm run dev`), the dev cookie is **not** required so local work stays fast.

**API routes** under `/api/projects` and `/api/jobs` return 403 without the dev cookie when waitlist mode is on (OAuth and `/api/auth/*` stay available for the callback).

**Waitlist (landing signups, referrals, hybrid count)**

The marketing waitlist uses `POST /api/waitlist` and `GET /api/waitlist/stats` with the **service role** key (server-side only). Requires `db/migrations/002_waitlist_referrals.sql` applied in Supabase.

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_WAITLIST_COUNT_FLOOR` | Optional non-negative integer. Public count is `max(real_database_count, floor)`. Default `0`. |
| `NEXT_PUBLIC_WAITLIST_COUNT_PLUS` | Set to `true` to append `+` to the public count when the floor is higher than the real count (`showPlus`). |
| `NEXT_PUBLIC_WAITLIST_LEADERBOARD` | Set to `false` at public launch to hide the pre-launch top-five referral leaderboard on the landing page. Defaults to on when unset. |
| `WAITLIST_IP_HASH_SALT` | Optional salt for hashing client IPs stored on signup (`signup_ip_hash`). Defaults to a built-in string if unset; set in production for separation between environments. |
| `NEXT_PUBLIC_SITE_URL` | **Production:** Canonical public origin for referral share links, sitemap, and OG metadata (e.g. `https://voyd.one`, no trailing slash). Set on Vercel/hosting for **Production** (and **Preview** if you want preview deploys to emit real links). If unset, the app defaults to `https://voyd.one` on the server and still exposes the resolved URL via `GET /api/public-config`. |

The legacy `NEXT_PUBLIC_WAITLIST_URL` (Google Apps Script) is **no longer used** by the app; signups go through `/api/waitlist` when Supabase is configured.

### Production deploy checklist (referrals and auth)

1. **`NEXT_PUBLIC_SITE_URL`** — Set to your live marketing domain (e.g. `https://voyd.one`). Redeploy after changing. Referral `?ref=` links and copied URLs use this (and `GET /api/public-config` as a runtime check).
2. **OAuth redirect allowlist** — In Supabase **Authentication → URL configuration**, add `https://<your-domain>/api/auth/callback` (and keep `http://localhost:3000/api/auth/callback` for local dev). This is **not** the same as the marketing referral URL; OAuth must match where the app is actually served.
3. **Preview vs production** — Preview deployments often use a `*.vercel.app` host. Either set `NEXT_PUBLIC_SITE_URL` per Preview to that host or accept that copied referral links point at the canonical production domain (recommended for consistent sharing).
4. **Future hardening (optional)** — Higher-volume abuse mitigation (Redis rate limits, SQL rank optimization, httpOnly cookie for `ref` across OAuth) is not required for launch; track as follow-up if needed.

### 2. Database

1. Create a Supabase project
2. In SQL Editor, run `db/migrations/001_initial_schema.sql`
3. Run `db/migrations/002_waitlist_referrals.sql` (waitlist signups, referral codes, and `increment_waitlist_referrer_points` RPC)
4. Run `db/migrations/003_waitlist_oauth.sql` if you use **Google** on the waitlist (links `auth_user_id` + `avatar_url`)

**Supabase Auth:** Enable the Google provider and add redirect URLs: `https://<your-domain>/api/auth/callback` and `http://localhost:3000/api/auth/callback`.

**Waitlist error after running `002` (“table not in schema cache” / PGRST205)**  
The table can exist while the REST API still uses an old cache.

1. In **the same Supabase project** where you ran `002`, open SQL Editor and run [`db/scripts/verify_waitlist_and_reload_postgrest.sql`](db/scripts/verify_waitlist_and_reload_postgrest.sql) (the `NOTIFY pgrst, 'reload schema';` line is what fixes it).
2. Confirm `.env.local` **`NEXT_PUBLIC_SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** are from that project (**Settings → API** — URL must match).
3. Restart `npm run dev`. If it still fails, use **Project Settings → General → Pause project → Restore** once to force a full API restart.

### 3. Google Auth (optional)

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Toggle **Enable Sign in with Google**
3. Add Google OAuth credentials (create at [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID)
4. Add `https://<your-project>.supabase.co/auth/v1/callback` to Authorized redirect URIs

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With default **open** access, use **Launch App** in the nav to go to the dashboard. With **waitlist** mode, use `/dev-access` first (or develop locally without the cookie gate).

**Dev server: white page, 500, or React #418 / `SegmentViewNode` errors**

These usually mean a **broken `.next` folder** (cache deleted while `npm run dev` was running, or multiple dev servers on port 3000). Fix:

1. Stop **every** `npm run dev` (Task Manager → end **Node** if needed).
2. Run **`npm run clean`** or **`npm run clean:deep`** (also clears `node_modules/.cache`).
3. Start a **single** dev server: **`npm run dev`** (or **`npm run dev:clean`**).

Do not run `npm run clean` while the dev server is still running.

## Flow

1. **Sign up / Login** — Google or email
2. **New Project** → Enter idea (one sentence + optional context)
3. **Run VØYD** → Orchestrator runs CEO → Research → Product → CTO → CMO → CFO
4. **View outputs** — Research, Product, Tech, Marketing, Finance tabs
5. **CEO Assistant** (bottom-right) — Request iterations, refinements, new outputs
6. **Download** — HTML, copy content (PDF/ZIP coming later)

## Architecture

- **Frontend:** Next.js 15 (App Router), React, Tailwind
- **Backend:** Next.js API routes
- **DB:** Supabase (Postgres, Auth, Storage)
- **LLM:** OpenRouter (model routing: cheap-first)
- **Orchestrator:** Sequential agent flow; stores outputs in DB

## Model Router

Tasks are routed by type:

| Task       | Model (default)              |
| ---------- | ---------------------------- |
| Research   | `anthropic/claude-sonnet-4`  |
| Product    | `google/gemini-2.0-flash-001` |
| Marketing  | `google/gemini-2.0-flash-001` |
| Code       | `anthropic/claude-sonnet-4`  |
| Fallback   | `google/gemini-2.0-flash-001` |

Edit `src/lib/model-router.ts` to change models or add your OpenRouter key per-user.

## Deployment (Vercel)

1. Connect repo to Vercel
2. Set env vars: `SUPABASE_*`, `OPENROUTER_KEY`, `NEXT_PUBLIC_BASE_URL`
3. In Supabase Auth → URL Configuration, add your Vercel URL to Redirect URLs

## API

- `POST /api/projects` — Create project
- `GET /api/projects` — List user projects
- `GET /api/projects/:id` — Project + outputs
- `POST /api/projects/:id/run` — Start orchestrator
- `GET /api/jobs/:id` — Job status

## License

Private / Internal use.
