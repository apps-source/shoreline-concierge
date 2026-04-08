# Shoreline Concierge — Next.js PWA (TypeScript + Tailwind)

This repository is a production-ready scaffold for Shoreline Concierge (shorelineconcierge.travel): a mobile-first Progressive Web App (PWA) built with Next.js App Router, TypeScript, and Tailwind CSS. It focuses on curated coastal experiences (excursions, private charters, sunset cruises) with a future-ready structure for Viator API integration.

Features included:
- Next.js App Router (app/)
- TypeScript
- Tailwind CSS with a coastal palette
- PWA manifest, icons, and a simple service worker (public/sw.js)
- Mobile-first responsive layout and reusable components
- Mock data for experiences, categories, and destinations
- Placeholder lib/viator/ folder for future Viator integration

Getting started
1. Install dependencies

```bash
# from the project root (macOS zsh)
npm install
```

2. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 to view the site.

Environment setup (.env.local)
Create a `.env.local` file (not committed) based on `.env.local.example`:

```
VIATOR_SANDBOX_KEY=your_sandbox_key_here
VIATOR_API_KEY=your_production_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_key   # optional if using OpenAI
GEMINI_API_KEY=your_gemini_key   # optional if using Gemini
```

Only set the keys on the server (never in client code). The public site URL is safe to expose.

Supabase (concierge leads)
- Table DDL (run in Supabase SQL editor):

```sql
create table if not exists concierge_leads (
  id uuid default gen_random_uuid() primary key,
  destination text not null,
  startDate text not null,
  endDate text not null,
  groupType text not null,
  interests text,
  budgetStyle text,
  notes text,
  status text not null default 'new',
  source text not null default 'concierge-form',
  created_at timestamptz not null default now()
);
```

- Required env vars (set in Vercel or `.env.local`):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

- The API route `POST /api/concierge/submit` validates input, trims to safe lengths, enforces ISO dates, and inserts into `concierge_leads` when env vars are present. If env is missing, it logs and still responds success so the UX stays smooth.

AI planning route
- `POST /api/plan` (or `GET /api/plan` for a lightweight check) uses server-side keys only and returns a stubbed AI planning response.
- It prefers `GEMINI_API_KEY` when present; otherwise uses `OPENAI_API_KEY`. If neither is set, it returns 500 with `AI key missing`.

Production build

```bash
npm run build
npm start
```

PWA notes
- Manifest is `public/manifest.json` and icons are in `public/icons/`.
- Service worker is a minimal `public/sw.js` used to cache basic static assets. For full offline-first behavior and advanced caching strategies, replace with Workbox or next-pwa and register server routes accordingly.

Viator integration (search-first for MVP)
- Server-only provider logic: `lib/viator/client.ts`, `types.ts`, `transformers.ts`.
- Internal API route: `app/api/viator/experiences/route.ts` supports `q`, `destination`, `category`, `featured`, `limit` and returns `{ data: Experience[] }`.
- Search-first model (preferred for MVP):
  - Uses search endpoints (e.g., `/products/search`, `/search/freetext`) for on-demand results via **POST JSON payloads** (not query-string searches). Payloads include filtering, sorting, pagination, and currency fields aligned with Viator docs. Requests are capped at 50 results and cached in-memory for up to 1 hour (per Viator guidance for search caching).
  - `getNormalizedExperiences()` tries sandbox search with `VIATOR_SANDBOX_KEY`.
  - If sandbox is missing/failed/empty, it falls back to mock data (no secrets exposed). Production search is stubbed for `VIATOR_API_KEY` when ready.
- Ingestion model (later): `/products/modified-since` can be added to sync a full catalog into a local store; keep the transformer as the single normalization layer either way.
- Homepage featured experiences now prefer a remote call to `/api/viator/experiences?featured=true&limit=6` when a deploy URL is available (`NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`). Otherwise they use a pre-fetched normalized fallback, so builds never rely on localhost fetches.
- Transformer layer remains the single source of truth: all provider data passes through `transformers.ts` into the normalized `Experience` model before reaching the UI.

Security
- Keep API secrets in environment variables (e.g., `.env.local`) and access them only from server code (`process.env.VIATOR_API_KEY`).

Next improvements / suggestions
- Add a small integration test suite and Storybook for UI components.
- Replace the simple `sw.js` with a more robust caching strategy (Workbox or next-pwa).
- Add analytics, SSO, bookings provider integration and payment flow as separate, secure server endpoints.

Viator debug (temporary)
- Diagnostic route: `/api/viator/debug` returns source (sandbox/production/mock), endpoint used, method, status code + status text, response shape hint, fallback reason, request/response previews, result count, and sample titles.
- Hidden page: `/viator-debug` fetches the diagnostics API and renders the fields. Not linked in nav; remove later when not needed.
- “sandbox” means a sandbox search response was used; “mock” means fallback due to missing key, error, or empty/invalid response. `fallbackReason` explains why. Use `/viator-debug` locally to see sandbox 400 payloads and headers (API keys redacted).

Files created (high level)
- `app/` — Next.js App Router pages and layout (home, experiences, experience detail, destinations, concierge, about, contact).
- `components/` — Reusable UI components (Header, Footer, Hero, cards, service worker registrar).
- `data/` — Mock data for categories, experiences, and destinations.
- `lib/viator/` — Placeholder files for Viator API integration.
- `public/` — Manifest, icons, service worker and static assets.

If you'd like, I can:
- Add API routes to fetch and cache Viator data server-side with an example env var usage.
- Wire up next-pwa with a robust caching strategy.
- Create unit tests for key components.

— Completed scaffold
