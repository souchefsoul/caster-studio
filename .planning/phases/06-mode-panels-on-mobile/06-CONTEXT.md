# Phase 6: Mode Panels on Mobile - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning
**Source:** Smart discuss — all 3 grey areas accepted verbatim (no deviations from recommended answers).

<domain>
## Phase Boundary

Make all five generation modes (On-Model, Catalog, Colorway, Design Copy, Video) plus the Brand Face panel fully operable on a phone with no feature cuts. Since Phase 5.1 flipped the mobile layout so the sidebar/generator is the primary full-width view (not a drawer, not `w-[85vw]` constrained), this phase targets the panels themselves — their upload grids, text inputs, controls, and mode-specific UI — at mobile viewports (360–414px wide). Desktop (`lg+`) rendering must not regress.

Covers REQUIREMENTS.md: MODES-01, MODES-02, MODES-03, MODES-04, MODES-05, MODES-06.

</domain>

<decisions>
## Implementation Decisions

### Upload & Image Grid Reflow
- **On-Model multi-image grid:** 3 columns on mobile (8 slots → 3×3 with 1 empty). Slot minimum 80×80px per MODES-01.
- **Catalog angle grid:** 3 columns below `md`, 4 columns `md+` per MODES-02. No aggressive `sm` step — keep it simple.
- **Product image upload preview:** full-width preview, tap-to-replace (single-element pattern — no separate "Change" button).
- **File inputs:** `accept="image/*"` only. No `capture` hint — let the OS offer both camera and library. Users who want camera-only can pick from the native sheet.

### Panel Controls & Text Input
- **Panel sections stay flat** — no collapsible accordions. Matches the Windows 95 flat aesthetic and user's "no frills" preference from earlier phases.
- **Textarea min-height:** 3 rows default, grows with content. Use Tailwind `min-h-[5rem]` + `field-sizing-content` (or equivalent auto-grow) so long prompts don't force horizontal overflow.
- **Generate button placement:** inline (current pattern). The mobile primary-view sidebar is scrollable — user scrolls down to reach Generate. No sticky-bottom button.
- **Colorway color chips:** wrap grid layout for thumb access. No horizontal scroll.

### Mode-Specific Edge Cases
- **Video source image picker:** two separate buttons side-by-side ("Upload" + "From Gallery"). Clearer intent than a combined modal.
- **Video inline player:** aspect-constrained to the generated video's ratio (16:9 or 9:16), fits panel width. `playsInline muted` from Phase 5 is preserved — no regression on CANVAS-05.
- **Design Copy layout:** reference image + modifications textarea stacked vertically. Matches current single-column mobile-primary layout.
- **Brand Face panel mobile:** 2-column wrap grid for face thumbnails. Parmak-dostu, matches the overall panel density pattern.

### Claude's Discretion
- Exact pixel values for tap targets beyond the 80px slot minimum — Phase 7 enforces 40×40px globally (TOUCH-01), but honor it here where natural.
- Whether to add subtle mobile-only labels (e.g., "Tap to upload") on empty upload slots — nice-to-have, planner decides based on current empty-state UX.
- How `field-sizing-content` is polyfilled for browsers lacking support — planner picks (explicit auto-resize on input, or skip polyfill and accept min-height only).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- All 6 panels already exist and work on desktop: `OnModelPanel`, `CatalogPanel`, `ColorwayPanel`, `DesignCopyPanel`, `VideoPanel`, `BrandFacePanel`
- `ImageUpload.tsx` — shared upload component used across panels
- `GenerationControls.tsx` — mode-agnostic generation trigger + aspect/quality/count controls
- `useWorkspaceStore` — panel state (images, prompts, colors, angles) already wired
- Phase 5.1 work: sidebar is full-width below `lg`, panels render in flow (no drawer constraint)

### Established Patterns
- Windows 95 flat — `rounded-none`, 1px borders, no shadows
- `lg:` is the desktop breakpoint — all mobile-only classes gate on `lg:`
- Turkish default, English secondary; translation keys in `src/lib/translations/{tr,en}.ts` under `workspace.{mode}.*`
- Safe-area insets (Phase 4) — panel edges already inherit from `Sidebar.tsx` container, no per-panel work needed

### Integration Points
- Panels render inside `Sidebar.tsx` scrollable area conditional on `currentMode`
- Plan 5.1-02 made the sidebar `w-full` below `lg` — panels now have full viewport width to reflow into
- Generation button lives in `GenerationControls.tsx` at the bottom of the scrollable area

</code_context>

<specifics>
## Specific Ideas

- User's running thread: "minimal, no frills, keep Windows 95 flat" — applies here: no new chrome, no animations, no collapsible sections
- 80×80px upload slot minimum comes directly from MODES-01 and is non-negotiable
- 3-col catalog angle grid on small screens comes directly from MODES-02
- iOS no-auto-zoom is handled by 16px font-size rule, which Phase 7 (TOUCH-02) enforces globally — don't duplicate here, but don't regress

</specifics>

<deferred>
## Deferred Ideas

- Drag-to-reorder for On-Model multi-image grid — not in MODES-01, skip for v1.1
- Color picker (visual swatch) for Colorway instead of text input — out of scope, text input works
- Video length/aspect presets as tappable chips (vs dropdown) — deferred; current controls work
- Swipe-to-delete on Brand Face tiles — deferred; long-press or explicit delete button is enough
- Empty-state illustrations for panels — deferred; text hints are enough

</deferred>

<effects_on_later_phases>
## Downstream Impact

- **Phase 7 (Auxiliary Views & Touch Ergonomics):** Will enforce 40×40px tap target + 16px font-size + textarea auto-grow globally. Phase 6 should not preempt these — just don't regress below those targets where panels already meet them.
- **Phase 8 (Real-Device Verification):** E2E runs of each mode on real iOS Safari + Android Chrome. Phase 6 sets the stage; Phase 8 confirms it works.

</effects_on_later_phases>
