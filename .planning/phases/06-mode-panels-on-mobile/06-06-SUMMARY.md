---
phase: 06-mode-panels-on-mobile
plan: 06
subsystem: ui
tags: [react, tailwind, mobile, responsive, brand-face, tap-targets]

# Dependency graph
requires:
  - phase: 06-mode-panels-on-mobile
    provides: Phase 6 tap-target + mobile-grid conventions (40px floor via min-h-10, responsive grid reflow at lg:)
  - phase: 05.1-mobile-layout-flip
    provides: Full-width sidebar below lg (panels have full viewport width to reflow into)
  - phase: 03-workspace-first
    provides: BrandFacePanel + useBrandModels hook + workspaceStore (setActiveBrandFaceUrl, setActiveView)
provides:
  - Brand Face panel operable on 360px phones with 2-col thumbnail grid and 40px tap targets
  - MODES-06 satisfied — final Phase 6 requirement closed
  - Final plan of Phase 06 (mode-panels-on-mobile) complete
affects: [07-touch-ergonomics, 08-real-device-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Responsive grid step at lg: grid-cols-2 gap-1 lg:grid-cols-4 — mirrors Phase 06-02 catalog pattern (3-col mobile / 4-col md+) at a coarser breakpoint because Brand Face tiles need more width than catalog angles (active caption overlay needs ~160px tile)"
    - "min-h-20 explicit pixel floor on aspect-square tiles — protects 80px parmak-dostu target when sidebar drops below 360px (iPhone SE at 320px), no-op on lg+ where aspect-square already exceeds 80px; same floor-pattern as Phase 06-01 upload slots"
    - "min-h-10 tap-target retrofit on existing dense-density buttons — adds 40px vertical floor to collapse toggle + View All without changing their compact text-xs density class, same retrofit Phase 06-01 used for shadcn xs buttons"

key-files:
  created:
    - ".planning/phases/06-mode-panels-on-mobile/06-06-SUMMARY.md"
  modified:
    - "src/components/BrandFacePanel.tsx"

key-decisions:
  - "2-col mobile wrap grid (grid-cols-2 lg:grid-cols-4) — CONTEXT-locked decision. At 360px the 4-col-always layout produced ~80px tiles with no room for the 'Aktif' caption overlay; 2-col yields ~160px tiles that comfortably fit the caption at text-[9px] + bg-foreground/80"
  - "min-h-20 floor on tiles — aspect-square alone would let tiles dip below 80px on very narrow viewports (iPhone SE 320px with gap-1 and padding); the floor becomes a no-op on lg+ where 4-col in a 32rem sidebar already exceeds 80px"
  - "min-h-10 on collapse toggle + View All instead of introducing new button variant — matches Phase 6 retrofit pattern (add floor, keep dense text classes), avoids proliferation of button variants, visual delta on desktop is minimal (buttons gain consistent 40px height)"

patterns-established:
  - "Brand Face panel mobile grid pattern — 2-col on mobile / 4-col at lg+, explicitly coarser than Phase 06-02's 3/4 split because tiles carry overlaid captions that need more width"
  - "80px-floor + aspect-square combo for thumbnail grids — pixel floor protects against narrow-container edge cases without a media query"

requirements-completed: [MODES-06]

# Metrics
duration: 2 min
completed: 2026-04-19
---

# Phase 6 Plan 6: Brand Face Panel Mobile Reflow Summary

**Brand Face thumbnail grid now reflows from 2-col on mobile to 4-col at lg+ with min-h-20 tile floor and 40px tap targets on collapse toggle + View All, preserving collapsed-by-default / 8-tile cap / active-caption overlay and zero desktop visual regression.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-19T14:23:53Z
- **Completed:** 2026-04-19T14:25:22Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Brand Face panel usable on 360px phones: 2 face tiles per row, tap any tile to switch active face, "Tümünü Gör" opens full management view
- Active-face preview indicator ("Aktif") remains legible at 2-col mobile (~160px tile width is roomy for text-[9px] caption)
- Collapse/expand toggle and View All button both meet the 40×40px tap-target floor (via min-h-10)
- Zero business-logic change: useBrandModels hook, setActive/setActiveBrandFaceUrl/setActiveView wiring, useEffect sync all byte-preserved
- Desktop (`lg+`) rendering identical to pre-change at the 4-col grid level; min-h-10 on buttons is a subtle vertical gain but matches Phase 6 Wave 2 precedent (06-02/06-03/06-04/06-05)

## Task Commits

Each task was committed atomically:

1. **Task 1: Brand Face panel 2-col mobile / 4-col lg+ grid + 40px tap-target floors on collapse and View All** - `731641f5` (feat)

**Plan metadata:** pending (final docs commit)

## Files Created/Modified

- `src/components/BrandFacePanel.tsx` — Grid `grid-cols-4` → `grid-cols-2 lg:grid-cols-4`; tile className gains `min-h-20`; collapse toggle gains `min-h-10`; View All button gains `min-h-10`. All business logic, the `useState(true)` default-collapsed, the `models.slice(0, 8)` cap, the active-caption overlay, and the loading/empty states untouched.

## Decisions Made

See `key-decisions` in frontmatter. Three decisions ratified:

1. **2-col grid on mobile, 4-col at lg+** — CONTEXT explicitly locked this decision. Honored verbatim; no deviation.
2. **min-h-20 tile floor** — added to protect narrow-container (320px iPhone SE) edge cases. Plan specified this; implemented as written.
3. **min-h-10 on collapse toggle + View All** — matches Wave 2 precedent (Phase 06-01 tap-size retrofit). No new button variant introduced.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. `npm run build` exits 0 on first try. `npm run lint` has 3 pre-existing errors (`src/components/ui/button.tsx`, `src/hooks/useBrandModels.ts`, `src/hooks/useGenerations.ts`) that are documented in `.planning/phases/06-mode-panels-on-mobile/deferred-items.md` as explicitly out of scope for Phase 6. `BrandFacePanel.tsx` itself lints clean (verified via file-scoped `npx eslint`).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Phase 06 complete.** All 6 plans landed. All 6 MODES-01 through MODES-06 requirements satisfied. All five generation mode panels (On-Model, Catalog, Colorway, Design Copy, Video) plus Brand Face panel now fully operable at 360px with no feature cuts and no desktop regression.
- **Ready for Phase 07 (Auxiliary Views & Touch Ergonomics):** Phase 07 will enforce 40×40px tap target + 16px font-size + textarea auto-grow globally. Phase 06 plans already preempted compliance on panel surfaces (Phase 06-01 uploads, 06-02 catalog, 06-03 colorway chips, 06-04 design-copy textarea, 06-05 video, 06-06 brand face) so Phase 07's global rollout should find these surfaces already meeting the floor.
- **No blockers carry over.** `deferred-items.md` pre-existing lint errors remain tracked for a future lint-cleanup plan (post-Phase 7).

## Self-Check: PASSED

- `src/components/BrandFacePanel.tsx` — present on disk
- `.planning/phases/06-mode-panels-on-mobile/06-06-SUMMARY.md` — present on disk
- Commit `731641f5` — found in git log
- All 11 plan acceptance_criteria grep checks — passed
- `npm run build` — exits 0
- `npx eslint src/components/BrandFacePanel.tsx` — exits 0 (file-scoped lint clean; project-wide lint has 3 pre-existing errors documented in `deferred-items.md` as out of scope)

---
*Phase: 06-mode-panels-on-mobile*
*Completed: 2026-04-19*
