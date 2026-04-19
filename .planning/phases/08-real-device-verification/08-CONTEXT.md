# Phase 8: Real-Device Verification - Context

**Gathered:** 2026-04-19
**Status:** Ready for user execution (hardware required)
**Source:** Inherent requirement — phase exists because VERIFY-01 and VERIFY-02 cannot be satisfied without physical iOS Safari and Android Chrome devices.

<domain>
## Phase Boundary

No code changes. This phase is the formal real-device QA pass for the v1.1 Mobile-Usable Site milestone. The user runs every v1.0 generation mode end-to-end on a real iOS Safari device AND a real Android Chrome device, then documents a visual QA pass across 360×640, 390×844, 414×896 viewport sizes.

Covers REQUIREMENTS.md: VERIFY-01, VERIFY-02.

Also closes every `human_needed` item accumulated across earlier phase VERIFICATION.md files (Phases 5, 5.1, 6, 7).

</domain>

<decisions>
## Execution Decisions

### Who Executes
- The user. There is no code agent pathway for this phase.
- Claude's role here is to produce the test checklist, aggregate prior `human_needed` items, and format the QA-REPORT template.

### Output
- `.planning/phases/08-real-device-verification/08-QA-REPORT.md` — filled in by user with device models, pass/fail per item, screenshots if applicable.
- Phase is complete when VERIFY-01 and VERIFY-02 are both met AND every aggregated `human_needed` item is resolved.

### Scope Boundary
- No implementation. If the user hits a bug on device, it becomes a gap-closure phase (`08.1`) rather than being fixed inline.
- Accepted defect threshold: any CRITICAL bug (mode unusable, data loss, layout broken on a supported viewport) blocks milestone completion. Minor cosmetic issues (e.g., 1px spacing off) are logged but do not block.

</decisions>

<code_context>
## Prior Phase Verification Items

Aggregated from each phase's VERIFICATION.md `human_verification` section — consolidated into the Phase 8 checklist.

**Phase 5 (Mobile Canvas):**
- Grid item overlay reachable without hover on real iOS Safari (CANVAS-04)
- Video generations play inline on iOS Safari with no fullscreen takeover (CANVAS-05)
- Single view fills viewport width with no letterbox gap at 360×640 (CANVAS-02)

**Phase 5.1 (Mobile Layout Flip):**
- Mobile first-paint = generator primary (sidebar contents full-width)
- Gallery button opens full-screen canvas overlay
- Close X returns focus to Gallery button (Tab lands on it after close)
- Desktop ≥ 1024px: no top bar, no Gallery button, no X in toolbar
- Language toggle flips Galeri/Gallery in real time

**Phase 6 (Mode Panels):**
- On-Model upload slot ≥ 80px on device; native picker sheet on file input tap
- Catalog angle grid: 3-col <md, 4-col md+
- Colorway input: no iOS auto-zoom on focus
- Design Copy textarea: auto-grows vertically on iOS Safari
- Video two-button source picker: both buttons reachable, gallery present, inline video plays with correct aspect ratio, no fullscreen takeover
- Brand Face: View All navigates without layout break

**Phase 7 (Auxiliary Views + Touch Ergonomics):**
- AuthPage card fits fully on iPhone SE portrait (667px tall), no scroll
- iOS auto-zoom prevented on email/password input focus
- BrandFaceView controls (Add, set-active, remove-X) tap-responsive on 360px device
- PromptPanel textarea grows vertically on iOS Safari past 4 lines

**Phase 8 (this phase) adds:**
- Real E2E run of each of 5 generation modes on iOS Safari (history saved, survives refresh)
- Real E2E run of each of 5 generation modes on Android Chrome (history saved, survives refresh)
- Visual QA pass at 360×640, 390×844, 414×896 — no horizontal scroll, no clipped content, no broken taps

</code_context>

<specifics>
## Specific Ideas

- Reference viewports are the 3 listed in VERIFY-02. iPhone SE = 375×667 (close to 360×640), iPhone 12/13 = 390×844, iPhone 11 Pro Max / 12 Pro Max = 414×896.
- Keep a running Pass/Fail column per item. Any Fail creates a gap entry for phase 08.1.
- Screenshots for any Fail go into `.planning/phases/08-real-device-verification/screenshots/`.

</specifics>

<deferred>
## Deferred Ideas

- Automated visual regression tooling (Percy / Chromatic) — out of scope for v1.1.
- BrowserStack / Sauce Labs cloud testing — user-owned devices are fine for this milestone.

</deferred>
