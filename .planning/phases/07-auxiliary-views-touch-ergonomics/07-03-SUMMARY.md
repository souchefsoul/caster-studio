---
phase: 07-auxiliary-views-touch-ergonomics
plan: 03
subsystem: ui
tags: [audit, upload, accept, file-input, ios, mobile, regression-lock, touch]

requires:
  - phase: 06-mode-panels-on-mobile
    provides: ImageUpload default accept='image/*' + OnModelPanel dedicated hidden input accept='image/*' (06-01)
  - phase: 07-auxiliary-views-touch-ergonomics
    provides: 07-01 tap-target lifts — baseline 40px hit-area contract used for the VideoPanel bridge buttons referenced in audit
provides:
  - Regression lock on TOUCH-03 — every file-input surface in src/ opens OS native picker via accept='image/*' (either directly or via ImageUpload prop default)
  - Grep-based acceptance criteria codified in 07-03-AUDIT.md — future PRs that add new file inputs or capture hints can be caught by re-running the same grep sweep
  - Confirmation that the VideoPanel querySelector bridge (06-05 pattern) does not introduce a new file input surface
affects: [07-04-brand-face-view, 07-05-auth-page, 08-real-device-verification]

tech-stack:
  added: []
  patterns:
    - "Audit-only verify plan: zero source modifications on the happy path; single commit lands a grep-capture audit document that regression-locks a prior-phase invariant"
    - "Grep-based acceptance criteria over unit tests for HTML-attribute invariants: cheap to run, immune to framework churn, directly expressive of the contract ('no capture attr anywhere', 'accept=image/* on every file input')"

key-files:
  created:
    - .planning/phases/07-auxiliary-views-touch-ergonomics/07-03-AUDIT.md
  modified: []

key-decisions:
  - "TOUCH-03 audit resolves as a no-op on master — Phase 06-01 already delivered every accept='image/*' touchpoint; no straggler hiding in unrelated code paths (BrandFaceView + AuthPage explicitly scope-excluded, owned by 07-04/07-05)"
  - "The VideoPanel source-picker bridge uses document.querySelector to reach ImageUpload's hidden input (06-05 pattern) — it does NOT define its own <input type='file'>. Audit confirmed exactly 2 actual <input> elements in src/ (ImageUpload, OnModelPanel), not 3"
  - "Case-insensitive 'capture' sweep added beyond plan's literal greps — belt-and-suspenders check for misspellings like Capture='user' or CAPTURE=''; returned 0 matches, confirming zero capture presence at any casing"
  - "Zero source modifications: happy-path audit plans MUST ship a single audit document as the atomic commit artifact, not a silent no-op — future regressions need a dated artifact to diff against"

patterns-established:
  - "Audit-only plan pattern: single task executes a grep sequence, commits a Markdown AUDIT.md capturing raw grep output + a pass/fail verdict; zero source-file modifications on the happy path, inline-fix + re-audit on the deviation path"
  - "Scope-exclusion in audit plans: BrandFaceView and AuthPage owned by sibling Wave 2 plans (07-04, 07-05) are explicitly NOT touched even if an audit straggler surfaces there — the discovery is logged, the owning plan fixes"
  - "Grep invariant-lock: prior-phase guarantees (06-01 accept widening + no-capture decision) encoded as re-runnable grep expectations (counts + patterns) so any future regression is a single grep-command away from detection"

requirements-completed: [TOUCH-03]

duration: 2min
completed: 2026-04-19
---

# Phase 07 Plan 03: TOUCH-03 File-Input Audit Summary

**Zero-modification audit confirming every `<input type="file">` in src/ opens the OS native picker via `accept="image/*"` and zero `capture` attributes exist anywhere — Phase 6 plan 06-01 widening + no-capture decision regression-locked via grep-based acceptance criteria.**

## Performance

- **Duration:** ~2 min (audit-only plan, single task, no source edits)
- **Started:** 2026-04-19T15:03:45Z
- **Completed:** 2026-04-19T15:05:13Z
- **Tasks:** 1
- **Files modified:** 0 (+ 1 audit document created)

## Accomplishments

- TOUCH-03 requirement regression-locked: 8 grep-based acceptance criteria captured in `07-03-AUDIT.md` with raw command output and expected-vs-actual counts.
- Verified 2 actual `<input type="file">` elements across all of `src/` (ImageUpload.tsx:116 prop-driven, OnModelPanel.tsx:92 hard-coded), both carrying `accept="image/*"`. The VideoPanel.tsx:114 match is a `document.querySelector` string (06-05 bridge pattern), not a third input definition.
- Zero `capture` attributes present in `src/` across three grep variants (double-quote, single-quote, regex value-match) plus a defensive case-insensitive full-word sweep. The Phase 6 user decision ("no capture hint — let the OS offer both camera and library") is preserved and grep-verifiable.
- All 6 `<ImageUpload>` call-sites (CatalogPanel×2, BrandFaceView, ColorwayPanel, DesignCopyPanel, VideoPanel) inherit the default `accept = 'image/*'` with zero per-call overrides — confirms the prop-default propagation model works end-to-end.
- `npm run build` passes with exit code 0; no TS or Vite errors introduced (pre-existing CSS `env(...)` warning unrelated to this plan).

## Task Commits

1. **Task 1: Audit every file-input touchpoint and confirm accept='image/\*' coverage + zero capture attributes** — `7a8e8dd4` (test)

**Plan metadata (this SUMMARY + STATE + ROADMAP):** pending in final commit.

## Files Created/Modified

- `.planning/phases/07-auxiliary-views-touch-ergonomics/07-03-AUDIT.md` — created. Captures the full grep sequence (8 steps) with raw output, expected counts, actual counts, and per-step PASS verdicts; serves as the regression-lock artifact.

**Zero source-file modifications** (happy-path audit-only outcome as specified).

## Decisions Made

- **No source files modified on the happy path.** The plan's action spec explicitly gated edits behind "if straggler detected"; no straggler surfaced, so the commit body is audit documentation only. This preserves the "zero code changes in audit plans" contract and gives Phase 8 device verification a dated baseline to diff future PRs against.
- **Case-insensitive `capture` sweep added beyond the plan's literal greps.** Plan listed three case-sensitive capture patterns; an additional `grep -i 'capture'` across all of `src/` was run as belt-and-suspenders to catch misspellings (Capture, CAPTURE) — returned 0 matches. Documented in the audit file for future re-runs.
- **VideoPanel's `data-video-source-upload` bridge confirmed NOT a new file input.** Line 114's `type="file"` substring is inside a `document.querySelector` string literal (`'[data-video-source-upload] input[type="file"]'`), not a JSX `<input>` definition. Plan's `<interfaces>` note predicted this; audit confirmed it with 2 expected hits (wrapper div + querySelector call).
- **BrandFaceView and AuthPage scope-excluded by plan contract.** Any audit-surfaced issue in these two files would be logged and deferred to the owning sibling plans (07-04, 07-05). Zero issues surfaced, so no hand-off needed.

## Deviations from Plan

None — plan executed exactly as written. Every grep returned the expected count; zero stragglers; zero source edits; single commit with the audit document. The only addition beyond the literal plan text was the defensive case-insensitive `capture` sweep, which is a strict superset of the plan's three capture greps and returned 0 matches (consistent with the plan's acceptance criteria).

## Issues Encountered

None. The `.planning/phases/05-mobile-canvas/05-VERIFICATION.md` + `.gitignore` entries showing in the initial `git status` before Task 1 did not interfere with this plan's single-file commit — staging `.planning/phases/07-auxiliary-views-touch-ergonomics/07-03-AUDIT.md` explicitly (never `git add -A`) isolated the audit commit.

## User Setup Required

None — audit-only plan with zero external service touchpoints.

## Next Phase Readiness

- Ready for Wave 2 continuation: Plans 07-04 (BrandFaceView reflow) and 07-05 (AuthPage reflow) are unblocked. Both own `<input>` surfaces scope-excluded from this audit; neither depends on 07-03's output beyond the implicit invariant (new file inputs they introduce must carry `accept="image/*"` and no `capture` attr to keep the grep contract intact).
- Phase 8 (Real-Device Verification) can re-run the same grep sweep from `07-03-AUDIT.md` as a pre-device-test gate — a single command confirms the file-input contract held across the full Phase 7 delta before iOS/Android testing starts.
- No blockers.

## Self-Check

- [x] `.planning/phases/07-auxiliary-views-touch-ergonomics/07-03-AUDIT.md` — FOUND (114 lines, grep output captured)
- [x] Commit `7a8e8dd4` — FOUND in `git log --oneline` (test(07-03): codify TOUCH-03 audit)
- [x] `npm run build` — exit 0 confirmed
- [x] Zero source files modified — `git diff HEAD~1 -- src/` returns empty
- [x] All 8 acceptance-criteria greps returned expected counts

## Self-Check: PASSED

---
*Phase: 07-auxiliary-views-touch-ergonomics*
*Completed: 2026-04-19*
