---
phase: 06-mode-panels-on-mobile
plan: 04
subsystem: ui
tags: [mobile, design-copy, tailwind-v4, field-sizing, ios-safari, textarea]

requires:
  - phase: 05.1-mobile-layout-flip
    provides: Full-width mobile sidebar so the Design Copy panel has viewport width to stack reference image above the growing textarea
  - phase: 06-01-foundation
    provides: Phase 6 CONTEXT lock ("Design Copy layout: reference image + modifications textarea stacked vertically") and the 16px iOS no-auto-zoom rule
provides:
  - Design Copy textarea that auto-grows vertically with content via Tailwind v4 `field-sizing-content`, starts at a 3-row (`min-h-[5rem]`) floor, and runs at 16px font-size so iOS Safari does not auto-zoom on focus
  - MODES-04 satisfaction: reference image upload + modifications textarea both usable on a 360px phone, no iOS zoom, no horizontal overflow, no layout break
  - Partial pre-completion of Phase 7 TOUCH-04 (textarea auto-grow) specifically on the Design Copy modifications input — pattern ready for generalization to the other long-input textareas in Phase 7
affects: [07-touch-ergonomics, 08-real-device-verification]

tech-stack:
  added: []
  patterns:
    - "Textarea auto-grow via Tailwind v4 `field-sizing-content` utility (maps to CSS `field-sizing: content`): lets a `<textarea>` track its content height natively with zero JS handlers, so long prompts push following siblings (Generate button) down inside a scrollable container instead of overflowing horizontally"
    - "`rows={3}` + `min-h-[5rem]` belt-and-suspenders: the HTML `rows` attribute gives an SSR/progressive-enhancement fallback before JS/CSS settle, while `min-h-[5rem]` (~80px = 3 lines at 16px line-height-1.5 + 8px padding) is a Tailwind floor that browsers honor even after field-sizing starts growing the textarea"
    - "iOS Safari no-auto-zoom pattern reapplied on a textarea: `text-base` (16px) is the documented threshold; same rule as Plan 06-03's color input, now extended to the only Phase-6 textarea that accepts long-form user input"

key-files:
  created: []
  modified:
    - src/components/DesignCopyPanel.tsx

key-decisions:
  - "Use Tailwind v4 `field-sizing-content` utility (no JS auto-resize handler). Plan CONTEXT explicitly locked this path; Tailwind v4 ships the utility as core and modern iOS Safari (17.4+) + Android Chrome (123+) support `field-sizing: content` natively. Phase 8 real-device verification is the final gate; any stragglers keep the `rows={3}` fallback height anyway"
  - "`text-sm` (14px) → `text-base` (16px) on the modifications textarea. Desktop sees a 2px font-size bump that improves long-prompt readability; mobile gains full iOS no-auto-zoom compliance. The textarea accepts long-form user input, so it is exactly the kind of surface that benefits most from a larger legible font"
  - "`min-h-[5rem]` chosen as the 3-row floor. 16px font × 1.5 line-height × 3 lines = 72px, plus py-2 (8px top + 8px bottom) = 88px — `5rem` (80px) is the nearest Tailwind spacing that matches the `rows={3}` intent without over-specifying a pixel value; browsers then grow the textarea from that floor as content expands"
  - "Class order normalized (layout → spacing → typography → sizing → resize → placeholder → focus) while adding the new utilities, so the edit reads as a coherent block rather than a bolted-on set of utility classes. This is cosmetic but keeps the diff reviewable"
  - "Kept `resize-none`. `field-sizing-content` handles vertical growth automatically; letting the user drag-resize on top would introduce a mode where the two mechanisms can fight each other (user drag → browser resets to content height on next input). Removing the manual resize handle keeps the behavior predictable"

patterns-established:
  - "Tailwind v4 `field-sizing-content` + `min-h-[Nrem]` + `rows={N}` triple-guard for mobile-friendly textareas: modern growth mechanism, Tailwind floor, and HTML fallback all stacked so long prompts never overflow horizontally and empty state stays a visible multi-line input"
  - "16px-font iOS no-auto-zoom rule now applies on BOTH `<input>` (Plan 06-03) and `<textarea>` (this plan) surfaces inside the Phase 6 panels — uniform precedent for Phase 7 TOUCH-02 global enforcement"

requirements-completed: [MODES-04]

duration: 2 min
completed: 2026-04-19
---

# Phase 06 Plan 04: Design Copy Panel Mobile Textarea Summary

**Upgraded the Design Copy modifications textarea to Tailwind v4 `field-sizing-content` auto-grow, raised its font-size to 16px so iOS Safari does not auto-zoom on focus, and added a `min-h-[5rem]` 3-row floor — while keeping the reference-image-above-textarea vertical stack byte-identical to CONTEXT's lock.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-19T14:13:28Z
- **Completed:** 2026-04-19T14:15:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- MODES-04 satisfied: the Design Copy panel is fully operable on a 360px phone — reference image upload and modifications textarea stack vertically (CONTEXT lock preserved), typing long prompts grows the textarea vertically inside the scrollable sidebar so the Generate button gets pushed down rather than the layout breaking horizontally, and iOS Safari no longer auto-zooms on textarea focus.
- Tailwind v4 `field-sizing-content` utility verified working: the production build succeeds with the new class in place, confirming Tailwind v4's class detector emitted the underlying CSS (`field-sizing: content`). Had Tailwind not shipped the utility in core, the build or `@source` scan would have flagged it.
- Zero change to business logic: all four workspace-store subscriptions (`designCopyReferenceImage`, `setDesignCopyReferenceImage`, `designCopyModifications`, `setDesignCopyModifications`) remain byte-identical. The `<ImageUpload>` block, the hint paragraph, and the outer `flex flex-col gap-3` wrapper are all untouched — only the textarea's className string changed.
- Phase 7 TOUCH-04 (textarea auto-grow) is partially pre-satisfied specifically for the Design Copy textarea. The pattern and utility name are now established for Phase 7 to generalize to PromptPanel and any future long-input textareas.

## Task Commits

1. **Task 1: Textarea auto-grow + 16px font + 3-row minimum (vertical stack preserved)** — `7fefa668` (feat)

_Plan metadata commit pending after this summary is written._

## Files Created/Modified

- `src/components/DesignCopyPanel.tsx` — single className edit on the `<textarea>` element (line 29):
  - **Before:** `"rounded-none border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none w-full"`
  - **After:** `"w-full rounded-none border border-input bg-background px-3 py-2 font-mono text-base min-h-[5rem] field-sizing-content resize-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"`
  - Delta: `text-sm` → `text-base` (14px → 16px), added `min-h-[5rem]` + `field-sizing-content`, class order normalized (layout → spacing → typography → sizing → resize → placeholder → focus), `rows={3}` attribute kept on the element itself as progressive-enhancement fallback.

## Decisions Made

- **Tailwind v4 `field-sizing-content` over a JS auto-resize handler.** Plan CONTEXT explicitly locked the modern CSS path. JS handlers (`onInput` setting `element.style.height = element.scrollHeight + 'px'`) work but introduce listener plumbing, SSR mismatch risk, and a repaint loop per keystroke; `field-sizing: content` is declarative and the browser does it natively. The only tradeoff is older browser support, mitigated by the `rows={3}` HTML fallback.
- **`min-h-[5rem]` instead of a calc-based floor.** 5rem (80px) is a clean Tailwind spacing token; the plan explicitly pre-calculated that 16px × 1.5 line-height × 3 rows + 16px of vertical padding ≈ 88px, and 80px is close enough (the browser will actually render a hair taller because of `rows={3}`'s intrinsic sizing). This is the pragmatic choice over `min-h-[5.5rem]` or `min-h-[88px]` — it is on-grid and matches the existing Tailwind spacing scale used elsewhere in the panel (`gap-3`, `py-2`).
- **Kept `resize-none`.** `field-sizing-content` handles vertical growth automatically. If `resize-y` or default resize were kept alongside field-sizing, a user-dragged height would get overwritten the next time the user typed — confusing UX. Pick one mechanism; the browser's content-tracking is the right one for a prompt input.
- **`rows={3}` attribute retained on the element.** This is a belt-and-suspenders fallback: any browser that does not honor `field-sizing-content` (or a pre-hydration SSR render) still gets a visible 3-row textarea. Removing `rows` would have collapsed the fallback to `min-h-[5rem]` only, which is almost the same but loses the semantic HTML signal that this is a multi-line input.
- **Class order normalization.** Tailwind has no canonical order, but this panel's other classNames (notably the new ColorwayPanel input from Plan 06-03) follow the layout → spacing → typography → sizing → resize → placeholder → focus sequence. Mirroring that here keeps the phase's CSS style consistent for future reviewers.

## Deviations from Plan

None — plan executed exactly as written. The single className change in Task 1 applied verbatim; every acceptance-criteria grep pattern matched the expected count (1 match for each new pattern, 0 matches for the removed `text-sm`, 2 matches for `ImageUpload` import + usage). `npm run build` exits 0 and Tailwind v4 accepted the `field-sizing-content` utility without warning.

## Issues Encountered

- **Pre-existing lint errors (same 3 first logged in Plan 06-01) still surface in `npm run lint`.** Errors in `src/components/ui/button.tsx:58:18` (`react-refresh/only-export-components`), `src/hooks/useBrandModels.ts:20:7`, and `src/hooks/useGenerations.ts:20:5` (both `react-hooks/set-state-in-effect`). Already documented in `.planning/phases/06-mode-panels-on-mobile/deferred-items.md`. Verified zero DesignCopyPanel-related lint issues — the Phase 6 scope-boundary rule holds: these 3 stay deferred to a future lint-cleanup plan or Phase 7.

## User Setup Required

None — no external service configuration required. All changes are frontend/code-only. Phase 8 real-device verification will confirm `field-sizing-content` behavior on actual iOS Safari 17.4+ and Android Chrome 123+ devices; no user action needed before that.

## Next Phase Readiness

- Ready for Plans 06-05 (Video panel) and 06-06 (Brand Face panel). DesignCopyPanel change is fully self-contained in `src/components/DesignCopyPanel.tsx`; no shared files touched (zero tr.ts/en.ts contention with the remaining Wave 2 plans).
- No blockers. The `field-sizing-content` + `min-h-[5rem]` + `rows={3}` triple-guard pattern and the 16px font-size rule established here are ready for Phase 7 TOUCH-04 to generalize across the other long-input textareas (PromptPanel, VideoPanel prompt if any).

## Self-Check

- [x] `src/components/DesignCopyPanel.tsx` — FOUND (1 className mutation applied; all 10 acceptance-criteria grep checks pass)
- [x] Commit `7fefa668` — FOUND (feat(06-04): auto-grow design copy textarea on mobile (MODES-04))

## Self-Check: PASSED

---
*Phase: 06-mode-panels-on-mobile*
*Completed: 2026-04-19*
