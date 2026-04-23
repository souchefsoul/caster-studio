# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on http://localhost:5173
- `npm run build` — `tsc -b` then `vite build` (typecheck is part of the build)
- `npm run lint` — ESLint across `src/`
- `npm run preview` — preview the production build
- Typecheck only: `npx tsc --noEmit -p tsconfig.app.json`

No unit test suite is wired up. Frontend verification is manual via the dev server.

## Stack snapshot

React 19 + TypeScript + Vite SPA. UI is Tailwind v4 + shadcn (base-nova style, neutral palette, lucide icons). State is Zustand. Routing is react-router v7. Backend is Supabase (auth, Postgres, Storage, Realtime, one edge function). AI image/video generation is FAL (`@fal-ai/client`). The project is Turkish-first (`tr`) with English (`en`) as the secondary locale.

Supabase project ref: `dtgxpiaqybgpdspdbcfc` (West EU). Default branch: **master**. Vercel auto-deploys on push to master.

## Architecture: things you only learn by reading multiple files

### Client calls FAL directly — via a Supabase edge-function proxy

The FAL API key is **not** in the frontend. `src/lib/fal.ts` configures `@fal-ai/client` with `proxyUrl: ${VITE_SUPABASE_URL}/functions/v1/fal-proxy`. The `fal-proxy` edge function ([supabase/functions/fal-proxy/index.ts](supabase/functions/fal-proxy/index.ts)) is a generic tunneller: it reads `x-fal-target-url` from the SDK, forwards the body, injects `Authorization: Key $fal`, and returns the response. This means **every** FAL SDK call from the browser (`fal.subscribe`, `fal.queue.submit`, `fal.queue.status`, `fal.queue.result`, `fal.storage.upload`) automatically routes through the proxy with credentials — no custom fetch wrapping needed.

To update the FAL key: `npx supabase secrets set "fal=..." --project-ref dtgxpiaqybgpdspdbcfc`.
To deploy a function: `SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy <name> --project-ref dtgxpiaqybgpdspdbcfc`.

### One Zustand store is the app's single source of truth

[src/stores/workspaceStore.ts](src/stores/workspaceStore.ts) holds everything non-ephemeral the UI cares about: theme, sidebar + gallery state, current generation mode + params, product-image refs, brand-face selection, the generations list, gallery multi-select state, batch queue state, queue drawer state. Hooks (`useGenerations`, `useBatchJobs`, etc.) are thin wrappers that call Supabase and mutate the store. If you need app-wide state, add it here rather than introducing another store.

### Auth + singletons live in `AuthedLayout`, not `ProtectedRoute`

[src/App.tsx](src/App.tsx) uses a react-router v7 layout-route pattern: `/` and `/batch` are children of `<AuthedLayout>`. The layout mounts **once per session** (not per route change), which is where singletons live:
- `useBatchJobsSync()` — loads batches, subscribes to realtime, starts the batch runner
- `<QueueDrawer />` — the global floating drawer, openable from any page

`ProtectedRoute.tsx` still exists but is no longer referenced. If adding a new protected route, nest it under `<AuthedLayout>`; don't wrap it in `<ProtectedRoute>` individually — that would remount the singletons on every navigation.

### Single-image generation flow

Side-panel components ([OnModelPanel](src/components/OnModelPanel.tsx), Catalog, Colorway, DesignCopy, Video) collect inputs via the Zustand store. `GenerationControls` calls `generateOnModel` / `generateCatalog` / etc. in [src/lib/fal.ts](src/lib/fal.ts). Each function uploads referenced images to FAL storage, builds a prompt from `PROMPT_TEMPLATES`, calls `fal.subscribe`, then persists the result to the `generations` table via [src/lib/generations.ts](src/lib/generations.ts). `Canvas.tsx` reads from the store and renders grid + single views.

### Batch generation: durable queue with client-driven polling

The batch feature (`/batch` page + queue drawer) is designed to resume across sessions **without** server-side webhooks. Two tables in [supabase/migrations/003_batch_jobs.sql](supabase/migrations/003_batch_jobs.sql) persist state: `batch_jobs` (one row per batch) and `batch_job_items` (one row per product). Realtime is enabled on both.

The runner in [src/lib/batchRunner.ts](src/lib/batchRunner.ts) is a **module-level singleton** started once by `useBatchJobsSync()`. Every `BATCH_POLL_INTERVAL_MS` it:
1. Fetches the user's in-flight items from the DB
2. For items with `status=queued`, up to `BATCH_CONCURRENCY` (default 3): calls `fal.queue.submit`, stores the returned `request_id`, transitions to `status=processing`
3. For items with `status=processing`: calls `fal.queue.status`; on `COMPLETED` fetches the result, inserts a row into `generations` (so the image shows in the normal gallery), transitions to `status=completed`; otherwise transitions to `status=failed`
4. Updates the parent `batch_job` counters via `recomputeBatchJob`

**Failsafes we deliberately kept:** no server-side retry (failed items stay failed until the user clicks retry in the UI); concurrency is a constant, not user-configurable; the runner assumes a single active tab per user (no cross-tab coordination). Adding webhook-based push is a known optional upgrade, not a fix.

### Storage layout

Single `uploads` bucket (created in migration 002), public-read, authenticated-write with RLS `foldername[1] = auth.uid()`. Paths:
- Brand face + ad-hoc product refs: `{user_id}/...`
- Batch products: `{user_id}/batches/{job_id}/{item_id}.{ext}`

Both fit the same RLS rule.

### i18n is a hand-rolled lookup, not a library

[src/lib/i18n.ts](src/lib/i18n.ts) exports `t(path)` that walks dotted keys over either `tr` or `en` from [src/lib/translations/](src/lib/translations/). There is **no interpolation** — do `.replace('{count}', String(n))` at the call site. Default locale is `tr`, stored in `localStorage` as `stivra-locale`. When adding translated strings, always update both `tr.ts` and `en.ts` with matching shape (the `TranslationKeys` type is derived from `tr`).

### Routing is intentionally tiny

`/auth` (public), `/` → `WorkspaceLayout`, `/batch` → `BatchPage`, `*` → redirect to `/`. `WorkspaceLayout` further multiplexes via `activeView` in the store (`workspace` vs `brand-face`), so adding a new in-workspace view means adding an `ActiveView` variant and a render case rather than a new route.

## Conventions worth knowing

- Only env vars prefixed `VITE_` are exposed to the client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The FAL key is a Supabase secret, never in `.env`.
- localStorage keys are prefixed `stivra-` (legacy name).
- The Vite alias `@/` maps to `src/`.
- When adding a Supabase table, add its RLS policies in the same migration and, if the client needs live updates, `ALTER PUBLICATION supabase_realtime ADD TABLE ...`.
- `PROMPT_TEMPLATES` in `lib/fal.ts` is exported because `batchRunner.ts` reuses the on-model template. Keep it exported.
