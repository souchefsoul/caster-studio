# 03-06 — Stabilization, FAL Client Migration, Feature Cleanup

**Date:** 2026-04-17
**Type:** Post-phase stabilization (not part of original plan set)
**Trigger:** Multiple production bugs surfaced after Phase 03 shipped — generations vanished on refresh, num_images > 1 returned only 1 image, WORKER_RESOURCE_LIMIT on multi-image refs, HTTP 401 after Supabase key rotation, video generations silently dropped from history.

## Summary

Rewrote the FAL integration end-to-end and tightened persistence/auth to eliminate the class of bugs above. Collections feature removed from UI. On-Model redesigned around a single multi-image upload with a Front/Back view toggle.

## Changes

### FAL integration (src/lib/fal.ts, supabase/functions/fal-proxy/index.ts)

- Adopted `@fal-ai/client` in the browser with `fal.config({ proxyUrl })`.
- `fal-proxy` edge function reduced to a dumb pass-through that forwards `x-fal-target-url` and streams both request and response as `arrayBuffer()`. Status code is preserved so FAL's 422/429 surface to the UI correctly.
- Reference images now go straight to FAL storage via `fal.storage.upload(file)` — base64 never passes through the edge function. This eliminates `WORKER_RESOURCE_LIMIT` on multi-image on-model requests.
- `fal.subscribe()` used for all generation calls so queue polling happens in the browser; the edge function no longer blocks on long-running Kling jobs.
- Generation count fanned out client-side: N = numImages → N parallel calls each with `num_images: 1`. Guarantees N image rows even if a single FAL call returns fewer, and each failure is isolated via `Promise.allSettled`.

### Auth (src/hooks/useAuth.ts, src/hooks/useGenerations.ts)

- `useAuth` preserves the previous `user` reference when the id is unchanged. Supabase silent token refresh no longer invalidates downstream hook identity.
- `useGenerations` depends on `user?.id` (not `user`) and merges fetched rows with in-memory pending generations on every refetch. Pending in-flight work no longer disappears when the tab is backgrounded.
- `fal-proxy` deployed with `--no-verify-jwt` to bypass the new ES256 signing key incompatibility with the default edge function gateway verifier. The function can do its own auth if needed; currently it relies on CORS + endpoint allowlist.

### Database (supabase/migrations/002_fixes.sql)

- `generations.mode` CHECK constraint extended to include `'video'`. Videos now persist and survive refresh.
- Added DELETE RLS policy on `generations` so the Canvas "Sil" button can delete rows.
- Dropped `collections` and `collection_items` tables (feature removed).
- Created `uploads` storage bucket (kept for future needs, not currently used by generation flow since FAL storage handles refs).

### Features

- **Collections removed** — panel, view, hook, lib, store slice, and DB tables gone. Canvas "Koleksiyona Ekle" dropdown and filter logic removed.
- **On-Model** redesigned:
  - Single multi-image upload grid, up to 10 refs, dropzone + click to add, per-image delete.
  - Front/Back view toggle drives a view clause in the prompt so the model shows the requested side.
  - Embedded prompt template forbids collage / split frames / dual views explicitly.
  - Prompt panel kept optional (user-supplied text appended verbatim).
- **Catalog**:
  - Prompt is optional and hidden from the sidebar (panel-driven only).
  - Angle picker rebuilt as a 4-column toggle button grid (matching the Model Üzerinde style) replacing the old checkbox list.
- **Video**:
  - Results now appear in the generation history alongside images. `mode: 'video'` rows use `thumbnailUrl` for the source image and `imageUrl` for the final video URL.
  - Canvas renders `<video controls autoplay loop>` for video generations in single view, adds a play-icon overlay in the grid, and downloads as `.mp4`.
- **Error surfacing** — client parser reads `err.message` and `err.detail.message` in addition to the older shapes so FAL `{ code, message }` envelopes no longer collapse to `HTTP 500`.

## Key Decisions

- [03-06]: FAL refs uploaded to fal.storage from the browser, not Supabase Storage. Edge function stays thin.
- [03-06]: Edge function is a dumb pass-through keyed on `x-fal-target-url`; no endpoint-specific logic.
- [03-06]: `fal.subscribe()` in the browser handles queue polling (avoids 150s edge function cap on Kling).
- [03-06]: numImages fan-out is client-side parallel calls (reliability over a single multi-output call).
- [03-06]: `useGenerations` merges fetched results with in-memory state so pending generations survive silent token refresh.
- [03-06]: On-Model uses a single multi-image grid + Front/Back view toggle instead of per-angle checkboxes and front/back image slots.
- [03-06]: Collections feature cut from v1 UI and schema; frontend simplified around generations + brand face.
- [03-06]: fal-proxy deployed with `--no-verify-jwt` to work around ES256 JWT signing keys; function-level auth deferred.

## Files

- Modified: src/lib/fal.ts, src/components/{Canvas,CatalogPanel,GenerationControls,OnModelPanel,Sidebar,VideoPanel,WorkspaceLayout}.tsx, src/hooks/{useAuth,useGenerations}.ts, src/lib/generations.ts, src/lib/translations/{en,tr}.ts, src/stores/workspaceStore.ts, src/types/workspace.ts, supabase/functions/fal-proxy/index.ts, package.json
- Added: supabase/migrations/002_fixes.sql
- Deleted: src/components/CollectionsPanel.tsx, src/components/CollectionsView.tsx, src/hooks/useCollections.ts, src/lib/collections.ts

## Follow-ups (not done here)

- Function-level auth inside `fal-proxy` so the endpoint isn't open to anyone with the public URL.
- CLAUDE.md still references a stale Supabase project ref (`dtgxpiaqybgpdspdbcfc`); actual project is `twejxttfmdxelihxyxpa`. Other references in CLAUDE.md (iyzico, 11 edge functions, multiple AI features) describe a different app — needs a full rewrite for the current scope.
