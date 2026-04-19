---
phase: 07-auxiliary-views-touch-ergonomics
plan: 01
subsystem: ui
tags: [touch-ergonomics, tap-target, ios-auto-zoom, tailwind, shadcn, accessibility]

# Dependency graph
requires:
  - phase: 06-mode-panels-on-mobile
    provides: min-h-10 tap-target floor pattern; text-base 16px iOS anti-auto-zoom pattern; field-sizing-content textarea recipe
provides:
  - 40x40px tap-target floor across Sidebar, AppShell, LanguageSwitcher, ThemeToggle, Canvas toolbar, GenerationControls, ImageUpload remove-X
  - TOUCH-02 font-size audit codified inline in Sidebar.tsx
  - Regression lock on Phase 6 text-base invariants (Colorway input, DesignCopy textarea, Video textarea)
affects: [07-02-PromptPanel, 07-04-BrandFaceView, 07-05-AuthPage, 08-real-device-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "min-h-10 (+ min-w-10 on icon-only) appended to existing className — floor, not fixed height; desktop rendering byte-identical when container already exceeds 40px"
    - "Audit-only task can codify regression invariants via grep acceptance + inline JSX comment (zero runtime change)"

key-files:
  created: []
  modified:
    - src/components/Sidebar.tsx
    - src/components/AppShell.tsx
    - src/components/LanguageSwitcher.tsx
    - src/components/ThemeToggle.tsx
    - src/components/Canvas.tsx
    - src/components/GenerationControls.tsx
    - src/components/ImageUpload.tsx

key-decisions:
  - "Class-order reordering in Canvas.tsx from 'rounded-none min-h-10 min-w-10' to 'min-h-10 min-w-10 rounded-none' — plan action body and grep acceptance pattern disagreed on token order; acceptance pattern (+ Phase 5.1 gallery-close precedent) wins. Tailwind output identical."
  - "Grid-item hover-reveal overlay buttons (text-[11px]) explicitly NOT lifted — Phase 5 touch-overlay pattern treats the entire bottom bar as the hit area; TOUCH-01 exempts decorative icons paired with larger hit areas."
  - "Shared Shadcn Button and Input components remain unmodified — only call-site className lifts applied. Preserves xs/sm/icon-sm density on desktop."

patterns-established:
  - "min-h-10 retrofit pattern: append (don't replace) — keeps existing layout utilities (flex-1, w-full, rounded-none) intact while lifting mobile tap floor"
  - "Icon-only Button pattern: min-h-10 min-w-10 together — both dimensions, icon stays size-4, hit-area grows via container"
  - "Bare <button> h-7 -> min-h-10 swap: fixed-height classes on bare buttons get replaced (not appended) because h-7 and min-h-10 would conflict"
  - "Audit codification via inline JSX comment: {/* TOUCH-02 audit: ... */} above a preserved element documents why the class was intentionally left unchanged"

requirements-completed: [TOUCH-01, TOUCH-02]

# Metrics
duration: 4 min
completed: 2026-04-19
---

# Phase 7 Plan 1: Global Tap-Target & Font-Size Audit Summary

**40x40px tap-target floor swept onto every shadcn Button call-site and bare <button> in global chrome (Sidebar/AppShell/LanguageSwitcher/ThemeToggle), Canvas toolbar, GenerationControls, and ImageUpload remove; TOUCH-02 font-size audit codified inline with zero shared-component modification.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-19T14:51:34Z
- **Completed:** 2026-04-19T14:55:24Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- TOUCH-01 satisfied across every interactive control in this plan's scope: Sidebar VIEW_TABS + sign-out, AppShell sign-out, LanguageSwitcher EN/TR toggle, ThemeToggle Sun/Moon, Canvas view-mode toggles + toolbarBtn + clear-failed + gallery-close, GenerationControls aspect/quality/numImages/Generate, ImageUpload remove-X — all 40x40px.
- TOUCH-02 satisfied across in-scope user-typed inputs/textareas (Colorway, DesignCopy, Video already 16px from Phase 6; Sidebar mode select confirmed 16px with inline audit comment). Three remaining stragglers explicitly deferred to Plans 07-02, 07-04, 07-05 per scope boundary.
- Zero modification to shared Shadcn Button or Input components.
- Zero modification to Phase 6 owned files (ColorwayPanel, DesignCopyPanel, VideoPanel, OnModelPanel, CatalogPanel).
- Grid-item hover-reveal overlay untouched (Phase 5 touch-overlay pattern preserved).
- Production build exits 0 after each task.

## Task Commits

Each task was committed atomically:

1. **Task 1: Global chrome buttons (Sidebar/AppShell/LanguageSwitcher/ThemeToggle)** — `94ee3072` (feat)
2. **Task 2: Canvas toolbar + GenerationControls + ImageUpload remove** — `02e87315` (feat)
3. **Task 3: TOUCH-02 font-size audit codified** — `90b4d0ee` (docs)

**Plan metadata:** pending (final commit in this step)

## Files Created/Modified

- `src/components/Sidebar.tsx` — VIEW_TABS Button + icon-only sign-out Button min-h-10 lifts; TOUCH-02 inline audit comment above mode select
- `src/components/AppShell.tsx` — legacy sign-out Button min-h-10 lift
- `src/components/LanguageSwitcher.tsx` — EN/TR Button min-h-10 lift
- `src/components/ThemeToggle.tsx` — icon-only Sun/Moon Button min-h-10 min-w-10 lift
- `src/components/Canvas.tsx` — grid/single icon-sm view toggles min-h-10 min-w-10; toolbarBtn const h-7 -> min-h-10; clear-failed bare button h-7 -> min-h-10
- `src/components/GenerationControls.tsx` — 3 flex-1 Buttons (aspect/quality/numImages) + 1 w-full Generate Button each get min-h-10
- `src/components/ImageUpload.tsx` — value-state icon-only remove-X Button min-h-10 min-w-10

## Decisions Made

- **Class-order swap in Canvas.tsx (Task 2):** Plan action body wrote `rounded-none min-h-10 min-w-10` but the acceptance grep pattern expected `min-h-10 min-w-10 rounded-none` (matching Phase 5.1's existing gallery-close). Swapped to match the grep/precedent; Tailwind output identical.
- **Grid-item overlay exemption (Task 2):** Plan explicitly flagged the `text-[11px] text-white/80` overlay buttons as out-of-scope — Phase 5 touch-overlay pattern already makes the entire overlay bar tap-reachable; lifting min-h-10 on each sub-button would break overlay visual density. Grep-locked at 3 untouched occurrences.
- **Audit codification approach (Task 3):** Rather than a no-op commit, drop a single-line JSX comment above Sidebar's mode select so future reviewers see why the existing `text-base` was intentionally preserved. Zero runtime change; grep-lockable acceptance criterion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Canvas.tsx class-order swap on view-mode toggles**
- **Found during:** Task 2 verification grep
- **Issue:** Plan `<action>` specified `className="rounded-none min-h-10 min-w-10"` for the two `<Button size="icon-sm">` view-mode toggles, but the `<acceptance_criteria>` expected `grep "min-h-10 min-w-10 rounded-none"` to report >= 2 matches. As-written the count was 1 (only the Phase 5.1 gallery-close). The plan action and acceptance criterion disagreed on token order.
- **Fix:** Reordered token string to `"min-h-10 min-w-10 rounded-none"` on both view-mode toggles. This matches the grep pattern, the Phase 5.1 gallery-close precedent, and produces byte-identical Tailwind output.
- **Files modified:** src/components/Canvas.tsx (grid toggle + single toggle)
- **Verification:** grep `min-h-10 min-w-10 rounded-none` now reports 3 matches (grid + single + gallery-close), satisfying the `>= 2` acceptance criterion. Build exits 0.
- **Committed in:** 02e87315 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Zero scope creep. The fix reconciled an internal inconsistency in the plan itself (action body vs. acceptance grep) and aligned with existing Phase 5.1 pattern. No semantic change — Tailwind atomic classes are order-independent.

## Issues Encountered

None. All three tasks executed cleanly; the Task 2 class-order deviation was caught by the acceptance-grep self-check and fixed in the same task.

One minor observation (non-issue, not blocking): the plan's Task 2 acceptance for `grep "rounded-none min-h-10"` in GenerationControls specified "exactly 3 matches" but the pattern as a substring also matches the `w-full rounded-none min-h-10` Generate button, giving a total of 4 literal substring hits. Honored the clear intent (3 flex-1 sites + 1 generate site = 4 call-sites total) by producing 4 call-sites total. The more-specific acceptance `grep "flex-1 rounded-none min-h-10"` returns exactly 3, and `grep "w-full rounded-none min-h-10"` returns exactly 1 — both pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 1 of Phase 7 complete (only plan in Wave 1 per plan frontmatter `wave: 1`).
- Ready for Wave 2 parallel plans:
  - 07-02 PromptPanel textarea upgrade (TOUCH-04 + TOUCH-02 font lift)
  - 07-04 BrandFaceView mobile reflow + tap sweep + text-base on name input (AUX-01 + TOUCH-01 + TOUCH-02)
  - 07-05 AuthPage reflow + tap sweep + text-base on Input (AUX-02 + TOUCH-01 + TOUCH-02)
- Plans 07-02/04/05 will each handle their own file's TOUCH-01/02 compliance without merge risk — this plan's grep regression criteria are now codified and would catch any Phase 6 / Phase 7-01 regression from later work.

---
*Phase: 07-auxiliary-views-touch-ergonomics*
*Completed: 2026-04-19*

## Self-Check: PASSED

- SUMMARY.md exists on disk
- All 7 key-files.modified exist on disk
- All 3 task commits exist in git log (94ee3072, 02e87315, 90b4d0ee)
