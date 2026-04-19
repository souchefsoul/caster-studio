---
phase: 06-mode-panels-on-mobile
plan: 01
subsystem: ui
tags: [i18n, tailwind, mobile, on-model, upload, accept, shadcn]

requires:
  - phase: 05.1-mobile-layout-flip
    provides: Full-width mobile sidebar so panels have room to reflow (no 85vw drawer constraint)
provides:
  - Phase 6 shared i18n foundation (8 new keys across onModel/catalog/video) in both tr.ts and en.ts
  - ImageUpload default accept widened to 'image/*' so iOS/Android native pickers expose camera+library+files
  - OnModelPanel upload grid with 80x80 minimum tile floor (MODES-01) + localized tap-sized Front/Back toggle
  - OnModelPanel hidden file input accepts 'image/*' (parity with ImageUpload default)
affects: [06-02-catalog, 06-03-colorway, 06-04-design-copy, 06-05-video, 06-06-brand-face, 07-touch-ergonomics]

tech-stack:
  added: []
  patterns:
    - "Phase 6 i18n pre-staging: one foundation plan lands every downstream key so Wave 2 panel plans never touch tr.ts/en.ts and can run in parallel without collisions"
    - "Floor-pattern Tailwind sizing: min-h-20 min-w-20 combined with aspect-square acts as an explicit mobile floor, a no-op on desktop where the aspect-square already exceeds 80px"
    - "accept='image/*' over mime-subset whitelist: rely on OS native sheet for camera/library/files choice; avoids HEIC rejection on iOS"

key-files:
  created:
    - .planning/phases/06-mode-panels-on-mobile/deferred-items.md
  modified:
    - src/lib/translations/tr.ts
    - src/lib/translations/en.ts
    - src/components/ImageUpload.tsx
    - src/components/OnModelPanel.tsx

key-decisions:
  - "Phase 6 foundation pre-stages all downstream i18n keys (catalog.anglesLabel/hintGenerated, video.uploadFromDevice/pickFromGallery) even though Plan 06-01 doesn't consume them — unblocks parallel Wave 2"
  - "min-h-20/min-w-20 + aspect-square is the floor-pattern for the 80x80 MODES-01 requirement — no media queries needed because it's a no-op above mobile widths"
  - "OnModelPanel hidden file input updated to accept='image/*' independently of ImageUpload (panel has its own input); CONTEXT locked accept widening globally"
  - "Front/Back buttons use min-h-10 alongside size='xs' — raises tap target to 40px without introducing a new shadcn button size variant"

patterns-established:
  - "Phase 6 i18n pre-staging: Foundation plan lands keys; panel plans consume them"
  - "Mobile slot floor: aspect-square + min-h-N + min-w-N enforces an explicit minimum without breaking desktop sizing"
  - "Tap-size retrofit: add min-h-10 to existing xs-sized shadcn Buttons when ≥40px mobile tap is needed without losing desktop compactness (Button at size='xs' + min-h-10 visually matches size='sm' on mobile only when the parent/grid is narrow)"

requirements-completed: [MODES-01]

duration: 3min
completed: 2026-04-19
---

# Phase 06 Plan 01: Shared Foundation (Accept + OnModel + i18n) Summary

**Widened all upload file inputs to accept='image/*', reflowed OnModelPanel into a tap-friendly mobile grid (80x80 min slots + 40px Front/Back buttons), and pre-staged 8 i18n keys so Plans 06-02..06-05 never race on tr.ts/en.ts.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-19T13:58:32Z
- **Completed:** 2026-04-19T14:01:36Z
- **Tasks:** 3
- **Files modified:** 4 (+ 1 created)

## Accomplishments

- MODES-01 satisfied: OnModelPanel multi-image grid is 3-col on every viewport with min 80x80px slots on mobile, Front/Back toggle is 40px-tall and fully localized, file input opens the native OS picker via `accept="image/*"`.
- ImageUpload default prop widened to `accept='image/*'` — every panel that later wires through ImageUpload inherits iOS HEIC support + camera/library/files native sheet for free.
- 8 new translation keys (onModel: hint, viewQuestion, viewFront, viewBack; catalog: anglesLabel, hintGenerated; video: uploadFromDevice, pickFromGallery) added in parallel to tr.ts and en.ts. `TranslationKeys` DeepStringify type enforcement confirms structural parity via `tsc -b` pass.
- Wave 2 parallelization unlocked: Plans 06-02..06-05 each touch exactly one panel component and zero translation files, so they can execute concurrently without merge conflicts.

## Task Commits

1. **Task 1: Add Phase 6 i18n keys (OnModel + Catalog + Video)** — `2e8bd570` (feat)
2. **Task 2: Switch ImageUpload default accept to image/\*** — `0e16d096` (feat)
3. **Task 3: OnModelPanel mobile reflow + localized Front/Back + accept=image/\*** — `e1ea71f4` (feat)

## Files Created/Modified

- `src/lib/translations/tr.ts` — +8 keys (4 onModel, 2 catalog, 2 video) at locked nesting paths; every existing key byte-identical
- `src/lib/translations/en.ts` — +8 mirrored keys; `TranslationKeys` parity preserved
- `src/components/ImageUpload.tsx` — default `accept` prop: `'image/jpeg,image/png,image/webp'` → `'image/*'`; no other changes
- `src/components/OnModelPanel.tsx` — 5 edits: hint localized, image tile + empty upload tile got `min-h-20 min-w-20`, hidden input `accept="image/*"`, viewQuestion localized, Front/Back buttons localized + `min-h-10`
- `.planning/phases/06-mode-panels-on-mobile/deferred-items.md` — created; logs 3 pre-existing unrelated lint errors as out-of-scope for Phase 6 (see Issues Encountered)

## Decisions Made

- **Pre-stage downstream i18n keys in the foundation plan.** Plan 06-01 adds `catalog.anglesLabel`, `catalog.hintGenerated`, `video.uploadFromDevice`, and `video.pickFromGallery` even though this plan never consumes them — so Plans 06-02 and 06-05 touch only their component file, not tr.ts/en.ts, enabling parallel Wave 2 execution.
- **Keep `grid grid-cols-3 gap-2` on all viewports for On-Model.** CONTEXT locked On-Model at 3 columns; because the panel already rendered 3-col on desktop pre-Phase-6, no responsive step (e.g., `sm:grid-cols-4`) was introduced. Desktop is a provable no-op.
- **Use `min-h-10` (40px) rather than changing `size="xs"` to `size="sm"` on Front/Back buttons.** Preserves the Windows 95 xs density on desktop where the aspect-square grid is narrow, but enforces CONTEXT's "honor 40px tap where natural" floor — the button just gets slightly taller on narrow widths.
- **`accept="image/*"` applied to both ImageUpload default and OnModelPanel's dedicated hidden input independently.** OnModelPanel doesn't go through ImageUpload; CONTEXT locked the widening globally, so both inputs had to be updated in the same plan to avoid a silent drift.

## Deviations from Plan

None — plan executed exactly as written. All 3 tasks committed verbatim against the plan's action specs; every acceptance-criteria grep pattern matched the expected count.

## Issues Encountered

- **Pre-existing lint errors in unrelated files.** `npm run lint` reports 3 errors (`src/components/ui/button.tsx:58:18` react-refresh/only-export-components; `src/hooks/useBrandModels.ts:20:7` and `src/hooks/useGenerations.ts:20:5` react-hooks/set-state-in-effect). Verified via `git stash` that all 3 exist on master before any Phase 6 edits — they sit entirely outside this plan's scope (upload/on-model/translations). Logged to `.planning/phases/06-mode-panels-on-mobile/deferred-items.md` per GSD scope-boundary rule; recommended for a future lint-cleanup plan or Phase 7 if those files get reworked. Build (`tsc -b && vite build`) passes cleanly in all three task verification runs.

## User Setup Required

None — no external service configuration required. All changes are frontend/code-only.

## Next Phase Readiness

- Ready for Phase 6 Wave 2 (Plans 06-02..06-06): every key those plans consume is present in both tr.ts and en.ts; ImageUpload's wider accept propagates automatically to any panel using the shared component.
- No blockers. Upstream Phase 05.1 full-width sidebar confirmed in Task 3's grid sizing analysis (360px viewport → ~108px slots, exceeding the 80px floor even before the min-h-20 guard kicks in).

## Self-Check

- [x] `src/lib/translations/tr.ts` — FOUND (8 new keys present)
- [x] `src/lib/translations/en.ts` — FOUND (8 mirrored keys present)
- [x] `src/components/ImageUpload.tsx` — FOUND (accept default = `image/*`)
- [x] `src/components/OnModelPanel.tsx` — FOUND (all 5 edits applied)
- [x] `.planning/phases/06-mode-panels-on-mobile/deferred-items.md` — FOUND (created)
- [x] Commit `2e8bd570` — FOUND (feat(06-01): add Phase 6 i18n keys)
- [x] Commit `0e16d096` — FOUND (feat(06-01): widen ImageUpload accept default)
- [x] Commit `e1ea71f4` — FOUND (feat(06-01): OnModelPanel mobile reflow)

## Self-Check: PASSED

---
*Phase: 06-mode-panels-on-mobile*
*Completed: 2026-04-19*
