---
phase: 06-mode-panels-on-mobile
plan: 02
subsystem: ui
tags: [i18n, tailwind, mobile, catalog, responsive-grid, tap-target]

requires:
  - phase: 06-01-shared-foundation
    provides: Catalog i18n keys (anglesLabel, hintGenerated) pre-staged in tr.ts + en.ts
provides:
  - Catalog panel with 3-col mobile / 4-col md+ angle grid (desktop byte-preserved at lg+)
  - All 6 angle buttons and the panel label + hint localized via workspace.catalog.* keys
  - 40px tap-target floor on every angle Button via min-h-10
affects: [07-touch-ergonomics]

tech-stack:
  added: []
  patterns:
    - "Responsive grid step at md: grid-cols-3 gap-1 md:grid-cols-4 — 3 columns on phones, 4 on tablet/desktop; preserves the pre-Phase-6 4-col layout at lg+ because md (768px) is narrower than lg (1024px) and the grid-cols-4 value is unchanged at that breakpoint"
    - "labelKey indirection on static const array: AVAILABLE_ANGLES now holds i18n key strings (labelKey) rather than rendered text (label); t(angle.labelKey) is resolved at render time so the array stays module-scope and type-safe"
    - "Tap-size retrofit via min-h-10 + size='xs': second reuse of Plan 06-01's pattern — Button stays xs-density on desktop where vertical space is tight, grows to 40px floor on mobile where tap reachability wins"

key-files:
  created: []
  modified:
    - src/components/CatalogPanel.tsx

key-decisions:
  - "Move translation from module-scope array to render-time via labelKey. The hardcoded `label: 'Önden'` strings were dead-ends for i18n because the const array was evaluated once at module load before t() was available. Switching to labelKey + t(angle.labelKey) in the .map keeps the array cheap/static while unlocking runtime locale switching."
  - "Use `md:` (768px) not `sm:` or `lg:` for the 3→4 column step. CONTEXT locked this to 'no aggressive sm step' and MODES-02 phrased it as 'reflows to 3 on small screens'; md is the widest breakpoint at which 4 columns still render without per-button text clipping on portrait tablets. lg+ (desktop) is byte-preserved because grid-cols-4 at md already applies there."
  - "Reuse Plan 06-01's min-h-10 tap-size retrofit verbatim. Same pattern as OnModelPanel Front/Back buttons: size='xs' + min-h-10 gives 40px tap floor on narrow mobile viewports without introducing a new shadcn button variant or regressing desktop density."

patterns-established:
  - "Responsive-col-step at md: mobile N + md:N+1 is Phase 6's preferred reflow for grids with ≤8 items where desktop density matters"
  - "labelKey indirection for module-scope i18n arrays: avoids capturing t() in closure, keeps static arrays static"

requirements-completed: [MODES-02]

duration: 1min
completed: 2026-04-19
---

# Phase 06 Plan 02: Catalog Panel Mobile Reflow Summary

**Reflowed the CatalogPanel angle grid from always-4-col to 3-col mobile / 4-col md+, localized the 'Açılar' label, 6 angle buttons, and hint paragraph onto workspace.catalog.* keys, and added a 40px tap-target floor to every angle Button — desktop (lg+) is byte-preserved.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-19T14:04:56Z
- **Completed:** 2026-04-19T14:05:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- MODES-02 satisfied: the 6-angle selection grid renders in 2 rows of 3 on a 360px phone (3 columns) and snaps back to 1 row of 4 at md (768px+) — desktop (lg = 1024px+) is identical to pre-Phase-6 because the grid-cols-4 value never changed at that viewport.
- Zero hardcoded Turkish left in CatalogPanel.tsx: `Açılar`, `Her seçilen açı için bir görsel üretilir.`, and the six angle labels (`Önden`, `Arkadan`, `Sol Yan`, `Sağ Yan`, `3/4 Ön`, `3/4 Arka`) all now flow through `t('workspace.catalog.*')`. Both `tr.ts` and `en.ts` already carry the matching keys from Plan 06-01.
- Every angle button now has a 40px minimum tap-target floor via `min-h-10`, alongside the existing `size="xs"` — the second reuse of Plan 06-01's tap-size retrofit pattern. Desktop xs-density is preserved because `min-h-10` is only a floor, not a fixed height.
- Product front + back ImageUpload slots were untouched — they inherit Plan 06-01's wider `accept="image/*"` default and already reflow full-width on mobile via `ImageUpload`'s fluid sizing, so no change was needed here.

## Task Commits

1. **Task 1: Reflow Catalog angle grid to 3→4 cols + localize labels and hint** — `9e84e30a` (feat)

## Files Created/Modified

- `src/components/CatalogPanel.tsx` — 4 edits in one commit:
  1. `AVAILABLE_ANGLES` array: `label: '<Turkish>'` → `labelKey: 'workspace.catalog.angle<Key>'` on all 6 entries
  2. Angle section header: `<p>Açılar</p>` → `<p>{t('workspace.catalog.anglesLabel')}</p>`
  3. Grid container: `grid grid-cols-4 gap-1` → `grid grid-cols-3 gap-1 md:grid-cols-4`
  4. Button className: `rounded-none` → `rounded-none min-h-10`; rendered label: `{angle.label}` → `{t(angle.labelKey)}`
  5. Hint paragraph: hardcoded Turkish → `{t('workspace.catalog.hintGenerated')}`

## Decisions Made

- **Use `labelKey` indirection instead of computing labels inside the component.** The `AVAILABLE_ANGLES` const is module-scope, so it evaluates before any component renders — meaning `t()` isn't callable there. Storing the i18n key string in `labelKey` and resolving via `t(angle.labelKey)` in the `.map` keeps the array cheap/static and keeps locale switching reactive.
- **Step at `md:` (768px), not `sm:` or `lg:`.** CONTEXT explicitly rejected an "aggressive sm step." `md` is the widest breakpoint where 4 columns render without squeezing angle labels on portrait tablets, and it cleanly maps to MODES-02's "reflows to 3 on small screens." Desktop (`lg+`) is byte-preserved because grid-cols-4 at md already covers lg.
- **Reuse Plan 06-01's `min-h-10 + size="xs"` tap-size retrofit.** Same pattern as OnModelPanel Front/Back buttons — gives a 40px mobile tap-target floor without introducing a new Button variant. Desktop xs-density is preserved because min-h is a floor.
- **Do not touch ImageUpload blocks in CatalogPanel.** Plan 06-01 already widened ImageUpload's default `accept` to `image/*` and the component is fluid-width by default — the two product ImageUploads above the angle grid inherit mobile-correct behavior for free.

## Deviations from Plan

None — plan executed exactly as written. All 10 grep acceptance_criteria matched their expected counts on the first run; the 4 Edit operations applied cleanly; `npm run build` exited 0; `npm run lint` surfaced only the 3 pre-existing unrelated errors already logged in `deferred-items.md` by Plan 06-01.

## Issues Encountered

- **Pre-existing lint errors (out of scope).** `npm run lint` reports the same 3 errors Plan 06-01 documented: `src/components/ui/button.tsx:58:18` (react-refresh/only-export-components), `src/hooks/useBrandModels.ts:20:7` (react-hooks/set-state-in-effect), `src/hooks/useGenerations.ts:20:5` (react-hooks/set-state-in-effect). None are in `CatalogPanel.tsx`, none were introduced by this plan, and all 3 are already tracked in `.planning/phases/06-mode-panels-on-mobile/deferred-items.md` for a future lint-cleanup or Phase 7. Per GSD scope-boundary rule, did not attempt to fix. Build (`tsc -b && vite build`) passes cleanly.

## User Setup Required

None — frontend/i18n-only changes. No service configuration, no env vars, no migrations.

## Next Phase Readiness

- Wave 2 parallel: this plan touched only `src/components/CatalogPanel.tsx`, zero edits to `tr.ts`/`en.ts`. Plans 06-03 (Colorway), 06-04 (Design Copy), 06-05 (Video), 06-06 (Brand Face) remain free to execute without merge conflict on this file or on the translation files.
- Phase 7 (TOUCH-01 global 40x40 enforcement) will find `CatalogPanel.tsx` already at or above the floor for every button and won't need to revisit this file.

## Self-Check

- [x] `src/components/CatalogPanel.tsx` — FOUND (4 edits applied: labelKey array, anglesLabel t(), grid-cols-3 md:grid-cols-4, min-h-10, {t(angle.labelKey)}, hintGenerated t())
- [x] Commit `9e84e30a` — FOUND (`feat(06-02): reflow CatalogPanel angle grid to 3->4 cols + localize labels`)
- [x] `grid grid-cols-3 gap-1 md:grid-cols-4` — 1 match (expected 1)
- [x] `grid-cols-4 gap-1` without `md:` prefix — 0 matches (expected 0)
- [x] `t('workspace.catalog.anglesLabel')` — 1 match (expected 1)
- [x] `>Açılar<` — 0 matches (expected 0)
- [x] `t('workspace.catalog.hintGenerated')` — 1 match (expected 1)
- [x] `Her seçilen açı` — 0 matches (expected 0)
- [x] `labelKey: 'workspace.catalog.angleFront'` — 1 match (expected 1)
- [x] Old hardcoded labels (`Önden|Arkadan|Sol Yan|Sağ Yan|3/4 Ön|3/4 Arka` inside `label: '...'`) — 0 matches (expected 0)
- [x] `{t(angle.labelKey)}` — 1 match (expected 1)
- [x] `className="rounded-none min-h-10"` — 1 match (expected 1)
- [x] `npm run build` exits 0
- [x] `npm run lint` — only pre-existing unrelated errors (3), logged to deferred-items.md

## Self-Check: PASSED

---
*Phase: 06-mode-panels-on-mobile*
*Completed: 2026-04-19*
