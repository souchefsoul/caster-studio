# Phase 04 — Deferred Items

Pre-existing issues discovered but NOT fixed (out-of-scope per executor scope boundary).

## Pre-existing lint errors (found during 04-02)

These existed prior to Phase 04 work and are unrelated to the responsive-shell plan:

1. `src/components/ui/button.tsx:58` — `react-refresh/only-export-components`: "Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components" (shadcn-generated pattern; `buttonVariants` export alongside component).

2. `src/hooks/useBrandModels.ts:20` — `react-hooks/set-state-in-effect`: "Calling setState synchronously within an effect can trigger cascading renders".

3. `src/hooks/useGenerations.ts:20` — `react-hooks/set-state-in-effect`: "Calling setState synchronously within an effect can trigger cascading renders".

**Scoping:** None of these are in files modified by Phase 04 plans. `eslint src/components/Sidebar.tsx src/stores/workspaceStore.ts` exits clean — our changes introduce no new lint errors. Pre-existing issues should be addressed in a dedicated cleanup plan (not v1.1 mobile-responsive scope).
