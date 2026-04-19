# Deferred Items — Phase 06 Execution

Issues discovered during Phase 6 execution that are **out of scope** for the current plan (no file modified by this plan owns them). Logged per GSD scope-boundary rule.

## Pre-existing Lint Errors (discovered during Plan 06-01)

These 3 ESLint errors already exist on master (verified via `git stash` + lint comparison) and sit in files unrelated to Phase 6 panels. Do NOT fix in Phase 6 unless a later plan's scope naturally touches them.

1. `src/components/ui/button.tsx:58:18` — `react-refresh/only-export-components` (shadcn button exports variants alongside the component; addressing changes the shadcn-generated file).
2. `src/hooks/useBrandModels.ts:20:7` — `react-hooks/set-state-in-effect` (Phase 3-06 era; requires hook refactor to event handlers / useSyncExternalStore).
3. `src/hooks/useGenerations.ts:20:5` — `react-hooks/set-state-in-effect` (same category as `useBrandModels`; Phase 3 hook).

**Recommendation:** bundle into a future lint-cleanup plan (post-Phase 6) or address in Phase 7's touch-ergonomics pass if any of these files get reworked there. Phase 6 plans that modify these files naturally are NOT expected; leave them alone.
