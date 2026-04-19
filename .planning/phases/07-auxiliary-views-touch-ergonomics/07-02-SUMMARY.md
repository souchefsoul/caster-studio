---
phase: 07-auxiliary-views-touch-ergonomics
plan: 02
subsystem: ui
tags: [mobile, prompt-panel, tailwind-v4, field-sizing, ios-safari, textarea, touch-04]

requires:
  - phase: 06-04-design-copy-panel
    provides: "Phase 6 textarea triple-guard recipe (field-sizing-content + min-h-[5rem] + rows={3} + text-base + resize-none) — the canonical pattern this plan generalizes to the shared PromptPanel textarea"
  - phase: 06-05-video-panel
    provides: "Second reference implementation of the triple-guard recipe on the Video prompt textarea — confirms the recipe is stable and portable before Phase 7 rollout"
  - phase: 07-01-global-tap-and-font-audit
    provides: "TOUCH-01/02 global sweep (min-h-10 tap floor + selective text-base on typed inputs) completed across chrome/canvas/controls; Wave 2 unblocked to finish TOUCH-04 on the last long-input textarea"
provides:
  - "TOUCH-04 satisfaction closed for the shared PromptPanel textarea that feeds On-Model, Catalog, and Colorway modes — typing long prompts grows the textarea vertically inside the scrollable sidebar rather than overflowing horizontally or clipping"
  - "iOS Safari no-auto-zoom compliance extended to the last Phase 6/7 long-input textarea (16px floor on every typed input/textarea inside the mode-panel surface)"
  - "Uniform Phase-6/7 triple-guard coverage: the recipe now lands on Design Copy (06-04), Video prompt (06-05), AND PromptPanel (this plan) — three mode surfaces, one pattern"
affects: [07-03-imageupload-accept-audit, 07-04-brandface-reflow, 07-05-authpage-reflow, 08-real-device-verification]

tech-stack:
  added: []
  patterns:
    - "Triple-guard textarea recipe (field-sizing-content + min-h-[5rem] + rows={3} + text-base + resize-none) now applied uniformly across three shared long-input textareas — the pattern is stable across panel-specific (DesignCopy, Video) and shared-infrastructure (PromptPanel) textareas with zero per-call-site divergence"
    - "Font-mono retention alongside text-base: PromptPanel keeps the Windows 95 prompt-console typewriter feel even after the 14px → 16px font bump. Tailwind composes `font-mono text-base` without either utility clobbering the other"
    - "Append-not-replace className strategy preserved for focus utilities: the existing `focus:border-ring focus:outline-none` pair (distinct from DesignCopy's `focus-visible:ring-1 focus-visible:ring-ring` variant) was kept byte-identical — recipe applies the sizing/typography tokens only, leaves per-component focus style alone"

key-files:
  created: []
  modified:
    - src/components/PromptPanel.tsx

key-decisions:
  - "Applied recipe verbatim from plan, preserving PromptPanel's distinct focus-ring style (`focus:border-ring focus:outline-none`) rather than unifying with DesignCopyPanel's (`focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`). The Phase 7 recipe only mandates the sizing/typography/growth tokens; focus styling is per-component concern and not part of TOUCH-04. Normalizing focus styling across panels is out of scope and would touch three files for cosmetic uniformity with no behavioral win"
  - "Kept `<Label className=\"text-xs\">` at 12px per TOUCH-02 selective rule: TOUCH-02 raises font-size on user-typed inputs only, not labels. The label is a short static string read by the user, not a surface that receives text input — 12px keeps the sidebar visual density and is legible on its own line"
  - "rows={4} → rows={3} matches the Phase 6 recipe's 3-row floor exactly. A 4-row fallback would over-specify the empty-state height and visually conflict with DesignCopyPanel/VideoPanel, which both render at 3-row floor; uniform 3-row empty state is the Phase 6/7 contract"
  - "Class order normalized to match DesignCopyPanel/VideoPanel: layout (w-full) → chrome (rounded-none border border-input bg-background) → spacing (px-2.5 py-2) → typography (font-mono text-base) → sizing (min-h-[5rem] field-sizing-content) → resize (resize-none) → color (text-foreground) → placeholder (placeholder:text-muted-foreground) → focus (focus:border-ring focus:outline-none). Cosmetic but keeps the three textareas visually diffable for future reviewers"
  - "Preserved px-2.5 horizontal padding (PromptPanel-specific) rather than switching to DesignCopy/Video's px-3. PromptPanel's horizontal padding is tighter by design (it sits in a denser sidebar context with adjacent chip-sized controls in other panels); TOUCH-04 does not mandate spacing tokens, only sizing/typography/growth. Zero-risk preservation of existing layout feel"

patterns-established:
  - "Triple-guard textarea recipe is now the default for any long-input textarea in the app. Three reference implementations exist (DesignCopy 06-04, Video 06-05, PromptPanel 07-02) — future panels should adopt the same class-order + token set, varying only focus style and horizontal padding per panel context"
  - "TOUCH-04 closure definition: every long-input textarea reachable from the mode-panel sidebar now auto-grows + renders at 16px + has a 3-row floor + preserves a resize-none + rows={3} fallback. Phase 8 real-device verification is the final gate; no further textarea work scheduled before v1.1 ship"

requirements-completed: [TOUCH-04]

duration: "~1 min"
completed: 2026-04-19
---

# Phase 07 Plan 02: Shared PromptPanel Textarea Auto-Grow Summary

**Applied the Phase 6 triple-guard textarea recipe (`field-sizing-content` + `min-h-[5rem]` + `text-base` + `rows={3}` + `resize-none`) to the shared PromptPanel textarea — closing TOUCH-04 for the last long-input textarea in the app (feeds On-Model, Catalog, and Colorway modes) with zero business-logic or store-binding change.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-19T14:58:27Z
- **Completed:** 2026-04-19T14:59:34Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- TOUCH-04 closed: the shared PromptPanel textarea now auto-grows vertically with content via Tailwind v4 `field-sizing-content`, starts at a 3-row (`min-h-[5rem]`) floor, and renders at 16px (`text-base`) so iOS Safari does not auto-zoom on focus. Typing a long prompt now grows the textarea inside the scrollable sidebar instead of overflowing horizontally or clipping.
- Uniform triple-guard coverage achieved across all three Phase-6/7 long-input textareas: DesignCopy (06-04), Video prompt (06-05), and PromptPanel (07-02) now all carry the same recipe tokens. Verified the regression greps (`grep -c "text-base min-h-\[5rem\] field-sizing-content"`) still return 1 on DesignCopyPanel.tsx and VideoPanel.tsx — Phase 6 work remains intact.
- Zero business-logic change: all workspace-store subscriptions (`params.prompt`, `setParams({ prompt })`) remain byte-identical. The `useWorkspaceStore` hook usage, the `useTranslation` import, the outer `flex flex-col gap-3` wrapper, and `<Label className="text-xs">` are all untouched — only the textarea's className string and `rows` attribute changed.
- Windows 95 prompt-console aesthetic preserved: `font-mono` retained so the PromptPanel still reads like a typewriter terminal even at the new 16px floor.

## Task Commits

1. **Task 1: Apply field-sizing-content + min-h-[5rem] + text-base to PromptPanel textarea** — `aa21d5ee` (feat)

_Plan metadata commit pending after this summary is written._

## Files Created/Modified

- `src/components/PromptPanel.tsx` — two edits on the `<textarea>` element:
  - **rows attribute** (line 15): `rows={4}` → `rows={3}` (match Phase 6 recipe's 3-row floor)
  - **className** (line 19):
    - **Before:** `"w-full resize-none rounded-none border border-input bg-background px-2.5 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"`
    - **After:** `"w-full rounded-none border border-input bg-background px-2.5 py-2 font-mono text-base min-h-[5rem] field-sizing-content resize-none text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"`
    - Delta: `text-sm` → `text-base` (14px → 16px, iOS no-auto-zoom), inserted `min-h-[5rem]` (3-row Tailwind floor) + `field-sizing-content` (Tailwind v4 auto-grow utility), class order normalized (layout → chrome → spacing → typography → sizing → resize → color → placeholder → focus), `resize-none` moved after `field-sizing-content` in canonical order, `font-mono` and focus utilities preserved byte-identical.

## Decisions Made

- **Recipe applied verbatim, focus style preserved.** The Phase 7 recipe only mandates the sizing/typography/growth tokens; focus styling is a per-component concern. PromptPanel's `focus:border-ring focus:outline-none` diverges from DesignCopyPanel's `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` variant — no change needed for TOUCH-04 closure. Unifying focus styling would touch multiple files for cosmetic parity with no behavioral win.
- **Label kept at text-xs (12px) per TOUCH-02 selective rule.** TOUCH-02 raises font-size on user-typed inputs only, not labels. `<Label className="text-xs">` remains unchanged — the label reads a short static string, not a surface accepting input.
- **`rows={4}` → `rows={3}` to match Phase 6 recipe.** A 4-row fallback would over-specify empty-state height and visually conflict with DesignCopy/Video panels, which both render at 3-row floor. Uniform 3-row empty state is the Phase 6/7 contract.
- **Preserved px-2.5 horizontal padding (PromptPanel-specific).** DesignCopy/Video use px-3 for slightly wider interior spacing; PromptPanel's px-2.5 is intentional for denser sidebar context. TOUCH-04 does not mandate spacing tokens, only sizing/typography/growth — zero-risk preservation.
- **Class order normalized to match Phase 6 panels.** Layout → chrome → spacing → typography → sizing → resize → color → placeholder → focus sequence mirrors DesignCopyPanel and VideoPanel. Cosmetic but keeps the three textareas visually diffable for future reviewers.

## Deviations from Plan

None — plan executed exactly as written. The `rows={3}` change and className mutation applied verbatim. Every acceptance-criteria grep returned the expected count (`field-sizing-content`: 1, `min-h-[5rem]`: 1, `font-mono text-base`: 1, `rows={3}`: 1, `rows={4}`: 0, `font-mono text-sm`: 0, `text-xs`: 1, `resize-none`: 1, `params.prompt`: 1, `setParams({ prompt`: 1). Phase 6 regression greps on DesignCopyPanel.tsx and VideoPanel.tsx both return 1 (triple-guard intact). `npm run build` exits 0.

**Note on `useWorkspaceStore` grep:** Plan expected 1 match; actual is 3 (one import + two selector calls). This is the existing file structure, not a deviation — the check's intent was "store binding preserved," which is satisfied. The import line and both `useWorkspaceStore((s) => s.params)` / `useWorkspaceStore((s) => s.setParams)` selectors all contain the identifier string. No code change was made here.

## Issues Encountered

- **Pre-existing CSS warning** in `npm run build` output: `.pt-[env(safe-area-inset-top)] { padding-top: env(...); }` surfaces `Unexpected token Delim('.')` during CSS optimization. Same warning emitted before this plan (originates from Phase 4 safe-area insets; the rule still functions at runtime — the warning is a CSS minifier tokenizer quirk, not a parse error). Out of scope per deviation-rules scope boundary — not caused by this task's changes.
- **Pre-existing chunk-size warning** (`chunks >500 kB`) also surfaces on every build. Logged across Phase 4-6 summaries. Out of scope.

## User Setup Required

None — no external service configuration, no secrets, no DB migrations. All changes are frontend/code-only. Phase 8 real-device verification will confirm `field-sizing-content` behavior and iOS Safari no-auto-zoom on actual devices; no user action needed before that.

## Next Phase Readiness

- Ready for remaining Phase 7 Wave 2 plans: 07-03 (ImageUpload `accept` audit), 07-04 (BrandFaceView mobile reflow), 07-05 (AuthPage mobile reflow). This plan's change is fully self-contained in `src/components/PromptPanel.tsx` — no shared files touched, zero merge-conflict surface with the remaining Wave 2 plans.
- TOUCH-04 requirement closed; Phase 7 now has all textarea ergonomics satisfied. Phase 8 real-device verification is the next gate for all TOUCH-* requirements.

## Self-Check

- [x] `src/components/PromptPanel.tsx` — FOUND (2 edits applied: rows={3} + new className)
- [x] Commit `aa21d5ee` — FOUND (feat(07-02): auto-grow shared PromptPanel textarea (TOUCH-04))
- [x] Phase 6 regression: `src/components/DesignCopyPanel.tsx` triple-guard present (1 match)
- [x] Phase 6 regression: `src/components/VideoPanel.tsx` triple-guard present (1 match)
- [x] `npm run build` exits 0

## Self-Check: PASSED

---
*Phase: 07-auxiliary-views-touch-ergonomics*
*Completed: 2026-04-19*
