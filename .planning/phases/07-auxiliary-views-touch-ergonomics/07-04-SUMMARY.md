---
phase: 07-auxiliary-views-touch-ergonomics
plan: 04
subsystem: ui
tags: [mobile, responsive, touch-ergonomics, aux-01, brand-face, tailwind, shadcn]

# Dependency graph
requires:
  - phase: 07-auxiliary-views-touch-ergonomics
    provides: "07-01 min-h-10 append pattern + bare-button swap precedent; 07-02 text-base 16px iOS no-auto-zoom recipe for text inputs; 07-03 accept='image/*' + no-capture invariant locked (ImageUpload call-site in this view inherits)"
  - phase: 06-mode-panels-on-mobile
    provides: "BrandFacePanel (sidebar preview) min-h-10 retrofit precedent; ImageUpload accept='image/*' default"
provides:
  - "AUX-01 regression-locked: BrandFaceView renders 1-col (<sm) / sm:2-col (640px+) / lg:3-col (1024px+)"
  - "All 5 BrandFaceView interactive controls meet TOUCH-01 40x40px tap floor (Add, Save, Cancel, per-tile set-active, per-tile remove-X)"
  - "Name input meets TOUCH-02 16px iOS no-auto-zoom + TOUCH-01 40px tap floor"
  - "Windows 95 flat aesthetic preserved end-to-end (no rounded corners, 1px borders, no new shadows, no Framer Motion)"
affects: [phase-08-real-device-verification, brand-face-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bare <button> icon-only hit-area pattern: swap p-0.5 for 'flex min-h-10 min-w-10 items-center justify-center' — icon retains size-3, hit-area grows via container"
    - "Bare <button> text-only pattern: prepend min-h-10 before existing border/padding/text-size classes — tap floor grows vertically, decorative 10px caption text unchanged"
    - "Mobile-first BrandFaceView grid progression 1 -> sm:2 -> lg:3 (distinct from BrandFacePanel sidebar preview's 2 -> lg:4)"
    - "Text input className order: layout (w-full) -> chrome (rounded-none border bg-background) -> spacing (px-2 py-1) -> typography (text-base) -> sizing (min-h-10) -> focus"

key-files:
  created: []
  modified:
    - "src/components/BrandFaceView.tsx"

key-decisions:
  - "BrandFaceView grid is 1-col / sm:2-col / lg:3-col — distinct from BrandFacePanel's 2-col / lg:4-col sidebar preview (CONTEXT-locked at single-column mobile per AUX-01 explicit wording)"
  - "Icon-only remove-X grows via flex centering + min-h-10 + min-w-10 (matches Phase 6 06-03 decoupled hit-area pattern); X icon stays size-3"
  - "Decorative 10px caption text on per-tile set-active button unchanged (TOUCH-01 exempts decorative text when paired with larger hit area — entire tile face image is the primary tap surface)"
  - "Name input gets w-full added alongside text-base + min-h-10 so the input fills the 320px form-wrapper on every viewport (mobile 320px viewport bound, desktop 320px cap preserved)"
  - "Lg+ density reduces slightly (4-col -> 3-col) — CONTEXT-locked tradeoff: larger face preview + name + 2 controls per tile justifies fewer columns"

patterns-established:
  - "Pattern 1: BrandFaceView grid progression — single column on phones is NON-NEGOTIABLE per AUX-01; density reappears at sm+"
  - "Pattern 2: min-h-10 append (not replace) preserves existing layout classes on shadcn Button call-sites; bare <button> text-only prepends min-h-10; bare <button> icon-only swaps padding for flex + min-h-10 min-w-10"
  - "Pattern 3: text-base + min-h-10 recipe for user-input <input> elements (matches Phase 6 06-03 Colorway input precedent)"

requirements-completed: [AUX-01]

# Metrics
duration: 2 min
completed: 2026-04-19
---

# Phase 7 Plan 4: BrandFaceView Mobile Reflow + Tap Ergonomics Summary

**BrandFaceView management view lifted to AUX-01 spec: 1-col / sm:2-col / lg:3-col responsive grid with 40px tap floors on all 5 controls (Add, Save, Cancel, per-tile set-active, per-tile remove-X) and a 16px + 40px name input for iOS no-auto-zoom.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-19T15:08:12Z
- **Completed:** 2026-04-19T15:09:59Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- AUX-01 closed: BrandFaceView grid renders 1 column on phones (<sm), 2 columns at sm (640px+), 3 columns at lg (1024px+)
- 5 interactive controls meet 40x40px TOUCH-01 tap floor: Add button, Save button, Cancel button, per-tile set-active button, per-tile remove-X icon button
- Name input upgraded from `text-sm` to `text-base` (14px -> 16px, iOS no-auto-zoom) with `min-h-10` tap floor
- Zero business logic changes — handlers, store subscriptions, component state byte-identical
- Windows 95 flat aesthetic preserved: `rounded-none` retained everywhere, 1px borders, no shadows added, no Framer Motion

## Task Commits

Each task was committed atomically:

1. **Task 1: Reflow BrandFaceView grid to 1-col / sm:2-col / lg:3-col** — `4fa79056` (feat)
2. **Task 2: Tap-size sweep on BrandFaceView — Add, Save/Cancel, per-tile set-active, per-tile remove-X** — `7cd5a22d` (feat)
3. **Task 3: Font + height upgrade on BrandFaceView name input** — `1b44a707` (feat)

**Plan metadata:** `69942594` (docs: complete plan)

## Files Created/Modified

- `src/components/BrandFaceView.tsx` — Grid class swap (line 108), Add button className append (+min-h-10, line 50), Save/Cancel className append (+min-h-10 each, lines 81, 89), per-tile set-active className prepend (+min-h-10, line 137), per-tile remove-X className rewrite (flex min-h-10 min-w-10 items-center justify-center, line 148), name input className rewrite (w-full + text-base + min-h-10, line 68)

## Decisions Made

- **BrandFaceView grid = 1 / sm:2 / lg:3**, distinct from BrandFacePanel sidebar preview's 2 / lg:4. CONTEXT-locked per AUX-01 explicit wording ("reflows to a single column grid on mobile"). The two files have different density priorities — BrandFaceView owns the full management UI where each tile carries face + name + 2 controls, so fewer columns is acceptable; BrandFacePanel is a compact preview where more tiles at narrow widths is preferred.
- **Icon-only remove-X uses flex centering**: swapped `p-0.5` padding for `flex items-center justify-center` so the 12px X glyph visually centers inside the 40x40 hit-area container. Matches Phase 6 06-03 decoupled hit-area pattern.
- **Decorative 10px caption text preserved** on per-tile set-active button. TOUCH-01 explicitly exempts decorative text size when paired with a larger hit area — `min-h-10` grows the tap target vertically without touching the 10px typography. The entire tile face image is the primary tap surface.
- **Name input gained `w-full` alongside the typography/sizing upgrade**. The wrapper `<div style={{ maxWidth: 320 }}>` provides the upper bound; `w-full` lets the input fill the wrapper on every viewport — mobile phones get a full 320px-wide input, desktop stays capped at 320px.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** Plan was precise and complete. Three edits, three commits, three build verifications all passed first-try. No auto-fix logic triggered. Verification greps all matched expected counts (Add=1, Save+Cancel=2, set-active=1, remove-X=1, legacy=0, handlers=6, name input=1, wrapper maxWidth:320=1, final min-h-10 count=6).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 07-04 delivers AUX-01. Plan 07-05 (AuthPage mobile reflow delivering AUX-02) is the last remaining Wave 2 plan in Phase 07.
- Phase 8 (Real-Device Verification) will validate the 1-col / sm:2-col / lg:3-col BrandFaceView grid and 40px tap floors on actual iOS/Android devices at 360x640, 390x844, 414x896 viewports.
- Zero regression risk on Phase 6 BrandFacePanel (sidebar preview) — that file was not touched by this plan.

## Self-Check: PASSED

- `src/components/BrandFaceView.tsx` modifications present (7 insertions, 7 deletions per `git diff --stat`)
- Commits `4fa79056`, `7cd5a22d`, `1b44a707` all present in `git log`
- `npm run build` exits 0 after each task
- All verification greps match expected counts
- AUX-01 regression-lock grep passes: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` = 1 match; `min-h-10` = 6 matches (>= 5 required)

---
*Phase: 07-auxiliary-views-touch-ergonomics*
*Completed: 2026-04-19*
