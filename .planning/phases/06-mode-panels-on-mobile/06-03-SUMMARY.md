---
phase: 06-mode-panels-on-mobile
plan: 03
subsystem: ui
tags: [mobile, colorway, tailwind, ios-safari, tap-target, shadcn]

requires:
  - phase: 05.1-mobile-layout-flip
    provides: Full-width mobile sidebar so the Colorway panel has viewport width to wrap chips into
  - phase: 06-01-foundation
    provides: Phase 6 CONTEXT decisions (colorway = wrap grid, not horizontal scroll) and the tap-size retrofit pattern established for shadcn xs buttons
provides:
  - Colorway panel with wrap-grid chip layout, 40px tap targets, and 16px-font add-color input
  - iOS Safari no-auto-zoom compliance on the color text input (text-base = 16px)
  - MODES-03 satisfaction: add/remove colors + generation count remain tappable on a 360px phone viewport
affects: [07-touch-ergonomics, 08-real-device-verification]

tech-stack:
  added: []
  patterns:
    - "Wrap-grid chip reflow: swap `flex flex-col gap-1` to `flex flex-wrap gap-1` on a small bounded-count list (max 4) — provides compact row-based stacking on mobile with zero desktop regression, since the same max-4 items still fit in one row at lg+ viewports"
    - "Decoupled hit-area pattern for icon buttons: keep the visible icon (X size-3 = 12px) inside a 40x40 flex container (`h-10 w-10 items-center justify-center`) — enforces tap-target without inflating the chip's visual density"

key-files:
  created: []
  modified:
    - src/components/ColorwayPanel.tsx

key-decisions:
  - "Chip wrap via `flex flex-wrap gap-1` (not a responsive grid) — CONTEXT locked `wrap grid layout for thumb access, no horizontal scroll`; flex-wrap delivers 2-3 chips per row on mobile and preserves single-row on desktop without media queries"
  - "Decouple icon size from hit area on chip remove button — X icon stays size-3 (12px visual), but the button is h-10 w-10 (40px tap). Chip padding stays px-2 py-1 so visible density doesn't explode; the hit zone extends via flex-alignment over the icon"
  - "Use text-base (16px) on the add-color input — iOS Safari's auto-zoom trigger is <16px font-size. Desktop formerly rendered text-xs (12px), so this is a small desktop density loss for a large mobile usability gain. Phase 7 TOUCH-02 will confirm globally"
  - "Add button sized via min-h-10 alongside size='sm' — preserves shadcn xs-tier horizontal padding via `px-3` while guaranteeing the 40px vertical floor; consistent with Phase 6-01's tap-size retrofit pattern on xs buttons"

patterns-established:
  - "Wrap-grid chip reflow: flex-wrap for bounded-count lists (<=4 items) gives mobile vertical stacking and desktop horizontal packing from a single className — applicable to any tag/chip/badge list with a small hard cap"
  - "Decoupled hit-area: 40x40 flex container around a smaller visible icon — lets dense UI (chips, compact toolbars) meet touch-target floors without visual bloat"

requirements-completed: [MODES-03]

duration: 1 min
completed: 2026-04-19
---

# Phase 06 Plan 03: Colorway Panel Mobile Ergonomics Summary

**Flipped Colorway chip layout from vertical flex-col to flex-wrap grid, raised remove/add/input controls to 40px tap targets, and bumped the add-color input to 16px font-size so iOS Safari does not auto-zoom on focus.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-19T14:08:33Z
- **Completed:** 2026-04-19T14:09:45Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- MODES-03 satisfied: Colorway panel is fully operable on a 360px phone — up to 4 chips wrap across 2 rows with no horizontal scroll; add-color input is tappable (min-h-10) and immune to iOS zoom (text-base); Add button and per-chip remove (X) buttons meet the 40px tap-target floor.
- iOS Safari auto-zoom defense locked in: the add-color input rises from `text-xs` (12px, below iOS threshold) to `text-base` (16px, the exact no-zoom threshold). Phase 7 TOUCH-02 will verify globally — Phase 6 preemptively complies.
- Zero change to business logic: `MAX_COLORS = 4`, `addColor`, `removeColor`, `handleKeyDown`, and all workspace store subscriptions remain byte-identical. Only presentation classNames and a single `aria-label` changed.
- Decoupled hit-area pattern introduced on the remove (X) button — 12px visual X inside a 40px tap zone — preserves Windows 95 flat density while honoring the CONTEXT "40px tap where natural" floor.

## Task Commits

1. **Task 1: Wrap color chips + ergonomic add-color controls** — `8d696ea3` (feat)

_Plan metadata commit pending after this summary is written._

## Files Created/Modified

- `src/components/ColorwayPanel.tsx` — 5 className edits in 3 JSX regions:
  - Chip container: `flex flex-col gap-1` → `flex flex-wrap gap-1` (wrap-grid reflow)
  - Chip root: `flex items-center justify-between border ... px-2 py-1` → `flex items-center gap-1 border ... px-2 py-1` (justify-between removed since button is now fixed-size and internal spacing comes from gap-1)
  - Chip remove button: `text-muted-foreground hover:text-foreground` → `flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed` + `aria-label="Remove color"` (40x40 hit area + disabled affordance + a11y label)
  - Add input: `text-xs` + no min-height → `text-base min-h-10` (16px font + 40px min-height); className order normalized to `flex-1 rounded-none border border-border bg-background px-2 py-1 text-base min-h-10`
  - Add button: `rounded-none text-xs px-2 py-1 h-auto` → `rounded-none text-xs px-3 min-h-10` (dropped h-auto/py-1, added min-h-10 for tap floor)

## Decisions Made

- **flex-wrap over CSS Grid for the chip row.** Max 4 chips + Windows 95 flat aesthetic means a grid's rigid columns would add empty cells on lg+. `flex flex-wrap` naturally packs chips left-to-right and wraps when viewport runs out, producing zero waste space at any width. CONTEXT said "wrap grid, not horizontal scroll" — flex-wrap IS a wrap grid in substance.
- **Kept `justify-between` → replaced with `gap-1` on the chip.** Because the remove button is now a fixed 40x40 flex container, `justify-between` would create a dead zone between the color text and the oversized button on a narrow chip. `gap-1` + natural left-alignment groups text + button tightly and lets the chip's auto-width track the color label length.
- **`disabled:opacity-50 disabled:cursor-not-allowed` on the remove button.** Plan specified these; they mirror the visual affordance shadcn's Button applies by default. The native `<button>` is used here (not shadcn Button) because the chip's remove is a visual X, not a semantic action button — shadcn styling would be over-specified.
- **No change to the product image upload or the hint paragraph.** Plan's "Do NOT change" list covered these; they already render correctly on mobile (ImageUpload inherits full-width behavior from Phase 6-01's foundation).

## Deviations from Plan

None — plan executed exactly as written. All 5 className mutations and the single aria-label addition applied verbatim; every acceptance-criteria grep pattern matched the expected count (1 match for the new patterns, 0 matches for the old patterns). Build (`tsc -b && vite build`) passes cleanly.

## Issues Encountered

- **Pre-existing lint errors (same 3 from Plan 06-01) still surface in `npm run lint`.** Errors in `src/components/ui/button.tsx:58:18` (`react-refresh/only-export-components`), `src/hooks/useBrandModels.ts:20:7` and `src/hooks/useGenerations.ts:20:5` (both `react-hooks/set-state-in-effect`). Already documented in `.planning/phases/06-mode-panels-on-mobile/deferred-items.md` during Plan 06-01. Verified zero ColorwayPanel-related lint issues — the Phase 6 scope-boundary rule holds: these 3 stay deferred to a future lint-cleanup plan or Phase 7.

## User Setup Required

None — no external service configuration required. All changes are frontend/code-only.

## Next Phase Readiness

- Ready for Plan 06-04 (Design Copy) and onward Wave 2 plans. ColorwayPanel change is fully self-contained in `src/components/ColorwayPanel.tsx`; no shared files touched (no tr.ts/en.ts contention with other Wave 2 plans).
- No blockers. The iOS no-auto-zoom behavior established here (text-base on the color input) sets a concrete precedent for Plan 06-04's DesignCopyPanel textarea — same 16px floor will apply.

## Self-Check

- [x] `src/components/ColorwayPanel.tsx` — FOUND (5 className edits applied)
- [x] Commit `8d696ea3` — FOUND (feat(06-03): ColorwayPanel wrap chips + 40px tap targets + 16px input)

## Self-Check: PASSED

---
*Phase: 06-mode-panels-on-mobile*
*Completed: 2026-04-19*
