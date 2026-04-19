---
phase: 06-mode-panels-on-mobile
plan: 05
subsystem: ui
tags: [video, mobile, tailwind, field-sizing-content, ios, playsinline, aspect-ratio, i18n]

requires:
  - phase: 05.1-mobile-layout-flip
    provides: Full-width mobile sidebar so VideoPanel has room to render its source picker, gallery grid, prompt textarea, and inline player in flow (no drawer constraint)
  - phase: 05-mobile-canvas
    provides: CANVAS-05 iOS inline-video contract (playsInline + muted pair) preserved inside the in-panel player
  - phase: 06-01
    provides: Pre-staged i18n keys (workspace.video.uploadFromDevice, workspace.video.pickFromGallery) consumed by this plan; ImageUpload accept='image/*' inherited by the source dropzone

provides:
  - VideoPanel mobile reflow: explicit two-button source picker (Cihazdan Yükle / Galeriden Seç) replaces hidden underlined-link gallery toggle
  - Responsive gallery thumbnail grid (grid-cols-3 below md, md:grid-cols-4) with increased max-h-60 scroll floor
  - 40px tap-target floors on Duration / Aspect Ratio / Audio controls via min-h-10 retrofit on size='xs' shadcn Buttons
  - Auto-growing video prompt textarea using Tailwind v4 field-sizing-content + min-h-[5rem] + rows={3} triple-guard, text-base 16px floor prevents iOS Safari auto-zoom
  - Inline aspect-constrained video player rendering the newest completed video generation in-panel (playsInline + muted + controls + CSS aspect-ratio) — CANVAS-05 contract preserved

affects: [06-06-brand-face, 07-touch-ergonomics, 08-real-device-verification]

tech-stack:
  added: []
  patterns:
    - "data-* DOM selector handoff: 'Upload from Device' button triggers the ImageUpload component's encapsulated hidden <input type=file> via document.querySelector('[data-video-source-upload] input[type=file]') — no ref threading, no prop changes to ImageUpload"
    - "Inline player CSS aspect-ratio from stored generation params: style={{ aspectRatio: params.aspectRatio.replace(':', ' / ') }} converts '16:9' -> '16 / 9' at render time, preventing layout shift when video loads its intrinsic size"
    - "CANVAS-05 regression guard inside sidebar: every mobile <video> element carries both playsInline AND muted; contract now enforced across Canvas (Phase 5) and sidebar panels (Phase 6)"
    - "Key={generation.id} on <video> element forces remount on new generation so src updates play from the start instead of staying paused on the old frame"

key-files:
  created: []
  modified:
    - src/components/VideoPanel.tsx

key-decisions:
  - "data-video-source-upload attribute as the bridge between the new 'Upload from Device' Button and the ImageUpload's encapsulated hidden file input — avoids adding a second ref or changing the shared ImageUpload API that Plan 06-01 just finalized"
  - "Two-button side-by-side source picker (grid-cols-2) visible only when completedGenerations.length > 0 — if the user has no prior generations, they see just the ImageUpload dropzone (no second button pointing to an empty gallery)"
  - "Gallery grid responsive step at md (grid-cols-3 -> md:grid-cols-4) matches Plan 06-02's catalog angle grid pattern; max-h-40 -> max-h-60 lets a phone show ~3 rows without scrolling"
  - "No autoPlay on the inline sidebar player — user explicitly generated the video; tapping the controls play is the intentional interaction. CANVAS-05's autoPlay was for single-view playback, not sidebar. Default remains muted+playsInline for defensive iOS autoplay-policy compliance when controls trigger playback"
  - "Reuse workspace.canvas.videoReady instead of adding a new i18n key — the label 'Video hazır / Video ready' is semantically identical whether rendered on Canvas or in-panel, and Plan 06-01 did not pre-stage a video-specific panel label (correct — CONTEXT only enumerated 2 new video keys)"

patterns-established:
  - "Phase 6 mobile textarea triple-guard (field-sizing-content + min-h-[5rem] + rows={3}) now applied to both Design Copy (06-04) AND Video prompt — pattern stable for Phase 7 TOUCH-02 global rollout"
  - "16px font floor (text-base) on every panel text input AND textarea across Phase 6 — iOS auto-zoom prevention is now uniform; Phase 7 TOUCH-02 has precedent to codify globally"
  - "CANVAS-05 iOS contract propagated to sidebar panels — every <video> in the Video panel carries playsInline + muted; Phase 8 real-device verification has one consolidated contract to test"
  - "data-* attribute handoff for reaching into encapsulated child refs — useful whenever a sibling control must trigger a shared component's internal action without refactoring the shared component"

requirements-completed: [MODES-05]

duration: 2 min
completed: 2026-04-19
---

# Phase 06 Plan 05: Video Panel Mobile Reflow + Inline Player Summary

**Video panel now renders a two-button source picker, 3-col mobile-responsive gallery grid, auto-growing 16px prompt textarea, and an inline aspect-constrained video player (playsInline+muted+controls) so a mobile user sees their generated output in-panel without opening the Gallery overlay.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-19T14:18:05Z
- **Completed:** 2026-04-19T14:20:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- MODES-05 satisfied end-to-end: source picker (upload + gallery) is two explicit buttons with 40px tap targets; gallery grid reflows 3-col mobile / 4-col md+; duration / aspect-ratio / audio controls hit 40px floor; prompt textarea auto-grows at 16px font; generated video plays INLINE in the panel — closes the Phase 5.1 "Gallery behind a button on mobile" gap for the Video mode specifically.
- CANVAS-05 iOS contract preserved inside the sidebar: the new inline `<video>` element carries BOTH `playsInline` (no forced fullscreen) AND `muted` (satisfies iOS autoplay policy when controls trigger playback) — regression guard baked directly into the acceptance-criteria greps.
- Zero touch to `handleGenerate`, `generateVideo`, or any store binding — this plan is strictly UI reflow + inline player; generation logic unchanged, zero blast-radius on the FAL Kling pipeline.
- Single-file scope (`src/components/VideoPanel.tsx`) — safe for Wave 2 parallel execution, zero merge-conflict surface with Plans 06-02..06-04 or 06-06.

## Task Commits

Each task was committed atomically:

1. **Task 1: Side-by-side source picker + responsive gallery grid + 40px tap-target floors** — `bc5f8556` (feat)
2. **Task 2: Prompt textarea auto-grow + inline video player (playsInline+muted+aspect-constrained)** — `8ceabde7` (feat)

**Plan metadata commit:** (pending — final docs commit)

## Files Created/Modified

- `src/components/VideoPanel.tsx` — 2 edits (Task 1: 52 insertions / 33 deletions; Task 2: 21 insertions / 1 deletion).
  - Source picker: hidden underlined-link toggle replaced with two Button children inside `grid grid-cols-2 gap-1`; Upload button uses `document.querySelector('[data-video-source-upload] input[type="file"]')` to click the ImageUpload's internal input; gallery grid reflows 3-col -> md:4-col with max-h-60.
  - Textarea: className rewritten — `text-sm` -> `text-base`, added `min-h-[5rem]` + `field-sizing-content`, `rounded-none` moved to canonical position after `resize-none`.
  - Added `latestVideoGeneration` computed const (`generations.find(...)` returns newest-first completed video due to store ordering).
  - Inline player block appended after Generate button with `key={latestVideoGeneration.id}`, `controls`, `playsInline`, `muted`, CSS `aspectRatio` from `params.aspectRatio`.

## Decisions Made

- **data-video-source-upload attribute as the bridge between the new 'Upload from Device' Button and ImageUpload's encapsulated hidden file input.** Rationale: ImageUpload owns its own ref and hides the `<input type="file">` via `className="hidden"`. Adding a second ref or prop-threading would require modifying the shared component that Plans 06-01 and 06-02/03/04 all use. A data-* attribute on the wrapper + `document.querySelector` is a one-file change, zero downstream blast radius, and semantically honest ("this section contains the video source upload input").
- **Two-button picker shown conditionally (only when completedGenerations.length > 0).** If the user has no prior generations, rendering "Pick from Gallery" would point to an empty list. The ImageUpload dropzone alone is enough entry point in that state — matches the pre-Phase-6 behavior for first-time users.
- **No autoPlay on the inline sidebar player.** CANVAS-05's autoPlay was for Canvas single-view — a dedicated playback surface where autoplay is expected. Inside the sidebar panel, autoplay+muted would be a noisy mobile UX pattern (sidebar scrolls; video flashes into view and starts playing muted on every re-render). Tapping the controls play is the intentional interaction. The muted+playsInline defaults remain as defensive iOS compliance when the user does hit play.
- **Reuse workspace.canvas.videoReady i18n key.** Plan 06-01 did not pre-stage a video-panel-specific "Video ready" label — correctly, since CONTEXT only called out the two new source-picker keys. The canvas.videoReady key is semantically identical whether rendered on Canvas or in-panel ("Video hazır / Video ready"), and reusing it keeps the translations file from growing with duplicate strings.
- **Preserve `rows={3}` HTML attribute alongside `min-h-[5rem]` + `field-sizing-content`.** Same triple-guard pattern Plan 06-04 established for DesignCopy — SSR fallback for browsers without field-sizing-content support (pre-Safari 17.4 / pre-Chrome 123) still gets a 3-row floor via HTML.

## Deviations from Plan

None — plan executed exactly as written. Both tasks applied verbatim against the plan's action specs; every grep acceptance criterion passed with the expected count on the first run.

## Issues Encountered

- **Pre-existing lint errors in unrelated files.** `npm run lint` reports the same 3 errors documented in Plan 06-01's `deferred-items.md`:
  - `src/components/ui/button.tsx:58:18` — react-refresh/only-export-components
  - `src/hooks/useBrandModels.ts:20:7` — react-hooks/set-state-in-effect
  - `src/hooks/useGenerations.ts:20:5` — react-hooks/set-state-in-effect

  None touch VideoPanel.tsx or anything modified in this plan. Verified by comparing lint output before and after Task 2 edits — error count stayed at exactly 3. Production build (`tsc -b && vite build`) passes cleanly in both task verification runs (618.79 kB -> 619.27 kB, the +0.48 kB accounts for the inline player block and latestVideoGeneration find). Remains logged in the phase-level deferred-items.md; recommended for Phase 7 or a dedicated lint-cleanup plan.

## User Setup Required

None — no external service configuration required. All changes are frontend/code-only.

## Next Phase Readiness

- Ready for Plan 06-06 (Brand Face panel mobile reflow — last Wave 2 plan, last plan in Phase 06). No shared-file contention: 06-05 touched only `src/components/VideoPanel.tsx`; 06-06 will touch only `src/components/BrandFacePanel.tsx` and `src/components/BrandSettingsPage.tsx` per typical pattern.
- Phase 6 i18n surface remains stable — all 8 keys from Plan 06-01 consumed: onModel (hint/viewQuestion/viewFront/viewBack) by Plan 06-01, catalog (anglesLabel/hintGenerated) by Plan 06-02, video (uploadFromDevice/pickFromGallery) by this plan. No additional i18n work needed for 06-06 beyond what 06-06's own plan stages.
- CANVAS-05 iOS contract (`playsInline muted` on every mobile `<video>`) is now enforced in both Canvas (Phase 5) and sidebar (this plan). Phase 8 real-device verification has a consolidated contract to test against.
- No blockers for Phase 7 TOUCH-02 global 16px rule: Phase 6 has established the precedent on every `<input>` (06-03 colorway) and `<textarea>` (06-04 design copy + 06-05 video). Phase 7 can now globalize without surprise regressions.

## Self-Check

- [x] `src/components/VideoPanel.tsx` — FOUND (both Task 1 source-picker edits and Task 2 textarea+player edits present)
- [x] Commit `bc5f8556` — FOUND (feat(06-05): two-button source picker + 3-col gallery + 40px taps on VideoPanel)
- [x] Commit `8ceabde7` — FOUND (feat(06-05): auto-grow prompt textarea + inline aspect-constrained video player)
- [x] npm run build — EXIT 0 (619.27 kB bundle, expected)
- [x] npm run lint — 3 pre-existing unrelated errors only; VideoPanel.tsx contributes zero new lint errors
- [x] All Task 1 acceptance criteria greps passed (9 checks: data-video-source-upload, uploadFromDevice, pickFromGallery, no underline, grid-cols-2, grid-cols-3 md:grid-cols-4 max-h-60, no legacy grid-cols-4 max-h-40, flex-1 rounded-none min-h-10, audio min-h-10, rounded-none min-h-10, generate w-full rounded-none)
- [x] All Task 2 acceptance criteria greps passed (12 checks: field-sizing-content x1, text-base min-h-[5rem] field-sizing-content x1, no legacy text-sm placeholder x0, latestVideoGeneration x5, filter predicate x1, `<video` x1, playsInline x1, muted x1 on video line 240, aspectRatio x6 incl. style line 242, `.replace(':',` x1, canvas.videoReady x1)

## Self-Check: PASSED

---
*Phase: 06-mode-panels-on-mobile*
*Completed: 2026-04-19*
