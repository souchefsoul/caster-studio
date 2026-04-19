# Roadmap: Texora Studio

## Milestones

- [x] **v1.0 MVP** - Phases 1-3 (shipped 2026-04-18)
- [ ] **v1.1 Mobile-Usable Site** - Phases 4-8 (in progress)

## Overview

Texora Studio is a professional AI image and video generation workspace for textile companies. v1.0 delivered the desktop product: auth, unified sidebar+canvas workspace, and all five generation modes (On-Model, Catalog, Colorway, Design Copy, Video) with history and brand-face persistence. **v1.1** takes that same product onto phones — responsive shell, mobile-tuned canvas, touch-friendly mode panels, auxiliary views and input ergonomics, and real-device verification on iOS Safari + Android Chrome. The Windows 95 flat aesthetic stays; only the layout responds.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, ...): Planned milestone work
- Decimal phases (4.1, 4.2, ...): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Auth** - Supabase backend, authentication, database schema, FAL proxy, and i18n system *(v1.0)*
- [x] **Phase 2: Workspace & First Generation** - Unified sidebar+canvas workspace with prompt controls and On-Model generation *(v1.0)*
- [x] **Phase 3: Full Generation Suite & Organization** - Remaining generation modes (Catalog, Colorway, Design Copy, Video) plus Brand Face and history *(v1.0)*
- [x] **Phase 4: Responsive Shell** - Viewport meta, drawer sidebar, safe-area insets, zero horizontal scroll *(v1.1)*
- [x] **Phase 5: Mobile Canvas** - Grid + single-view reflow, touch-equivalent overlay controls, inline mobile video playback *(v1.1, 2026-04-19)*
- [x] **Phase 5.1: Mobile Layout Flip (INSERTED)** - On mobile, generator becomes primary; canvas hidden behind Gallery button *(v1.1, 2026-04-19)*
- [ ] **Phase 6: Mode Panels on Mobile** - All five generation modes + Brand Face panel fully operable on a phone *(v1.1)*
- [ ] **Phase 7: Auxiliary Views & Touch Ergonomics** - Brand Face management + auth views reflow; 40px tap targets, 16px inputs, sane file pickers *(v1.1)*
- [ ] **Phase 8: Real-Device Verification** - End-to-end runs on real iOS Safari + Android Chrome; visual QA across phone viewports *(v1.1)*

## Phase Details

<details>
<summary>v1.0 MVP (Phases 1-3) — SHIPPED 2026-04-18</summary>

### Phase 1: Foundation & Auth
**Goal**: Users can sign up, log in, and access a protected application shell with Turkish/English language support
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. User can create an account with email/password and land on a protected page
  2. User can close the browser, reopen it, and still be logged in
  3. FAL AI proxy endpoint accepts a test prompt and returns a generated image (no API keys exposed to client)
  4. User can switch between Turkish and English and all UI text updates accordingly
  5. Database tables exist for users, generations, collections, and brand models
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold, Supabase client, and database schema
- [x] 01-02-PLAN.md — Authentication flow with protected app shell
- [x] 01-03-PLAN.md — FAL AI proxy edge function and i18n system

### Phase 2: Workspace & First Generation
**Goal**: Users can work inside a professional canvas workspace, configure prompt parameters, and generate their first On-Model product image
**Depends on**: Phase 1
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, GEN-05, GEN-01
**Success Criteria** (what must be TRUE):
  1. User sees a left sidebar with navigation, prompt input area, generation controls, and account info
  2. User can type a prompt, adjust parameters (model, steps, guidance, seed, aspect ratio, quality), and trigger a generation
  3. Generated image appears on the canvas; user can toggle between full-screen single image and grid view
  4. User can upload a flat/mannequin product photo and generate an on-model shot with an AI model in a scene
  5. Layout adapts cleanly to desktop, tablet, and mobile viewports with dark/light theme toggle
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Workspace layout with sidebar, canvas, theme toggle, and responsive design
- [x] 02-02-PLAN.md — Prompt controls panel and generation API integration
- [x] 02-03-PLAN.md — On-Model generation mode with product image upload

### Phase 3: Full Generation Suite & Organization
**Goal**: Users have access to all generation modes and can organize, persist, and download their work
**Depends on**: Phase 2
**Requirements**: GEN-02, GEN-03, GEN-04, BRAND-01, BRAND-02, BRAND-03, BRAND-04
**Success Criteria** (what must be TRUE):
  1. User can generate consistent multi-angle product shots via Catalog Mode
  2. User can generate the same garment in multiple color variations via Colorway Generator
  3. User can copy the visual style of a product and make text/small modifications via Design Copy
  4. User can create a persistent AI model face (Brand Face) and reuse it across generations for brand consistency
  5. User can view a chronological history of all generations and download any image in full resolution
  6. (Stabilization 03-06) Users can generate Kling v3 Pro videos; On-Model uses multi-image grid + Front/Back; FAL client refactored; Collections removed
**Plans:** 6 plans

Plans:
- [x] 03-01-PLAN.md — Generation persistence, history timeline, and image download
- [x] 03-02-PLAN.md — Brand Face management (create, list, activate, delete)
- [x] 03-03-PLAN.md — Collections (create, organize generations, filter view) *(later removed in 03-06)*
- [x] 03-04-PLAN.md — Catalog Mode and Colorway Generator
- [x] 03-05-PLAN.md — Design Language Copier
- [x] 03-06-PLAN.md — Post-phase stabilization: FAL client rewrite, On-Model multi-ref, video, Collections removal

</details>

### v1.1 Mobile-Usable Site (In Progress)

**Milestone Goal:** Every v1.0 feature works on a phone browser (iOS Safari + Android Chrome) with full feature parity, keeping the existing Windows 95 flat aesthetic. No PWA, no native wrapper, no visual redesign.

### Phase 4: Responsive Shell
**Goal**: The application frame — viewport, sidebar, safe-area handling — behaves correctly on every phone size without any horizontal scroll
**Depends on**: Phase 3
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05
**Success Criteria** (what must be TRUE):
  1. User opens the app on a 360px-wide phone and the UI renders at the correct scale with no pinch-to-zoom needed and no horizontal scroll anywhere
  2. Below the `lg` breakpoint, the sidebar is hidden behind a hamburger; tapping the hamburger slides in a full-height drawer; tapping outside or selecting a mode closes it and returns focus to the canvas
  3. On `lg` and up, the sidebar is back to its fixed desktop column — no regressions for desktop users
  4. On iPhones with a notch or home indicator, no sidebar item, toolbar control, or account button is clipped by system UI (safe-area insets respected)
**Plans:** 3 plans

Plans:
- [x] 04-01-PLAN.md — Viewport meta (viewport-fit=cover) + global overflow-x hygiene
- [x] 04-02-PLAN.md — Responsive sidebar drawer (width, safe-area insets, focus-return, responsive default)
- [x] 04-03-PLAN.md — Auto-close drawer on navigation + canvas toolbar safe-area & flex-wrap hardening

### Phase 5: Mobile Canvas
**Goal**: The canvas — grid and single view — reflows cleanly on phones, and every canvas-level action is reachable by touch
**Depends on**: Phase 4
**Requirements**: CANVAS-01, CANVAS-02, CANVAS-03, CANVAS-04, CANVAS-05
**Success Criteria** (what must be TRUE):
  1. In grid view, the user sees 2 columns on a phone, 3 on a tablet, 4 on desktop, and thumbnails remain legible at each size
  2. In single view on a phone, the image or video fills the viewport width (minus a thin border) with no letterbox gap
  3. The canvas toolbar (view toggle, count, download, delete, create-video, hamburger) reflows on a 360px screen with no overlapping or cut-off controls
  4. On a touch device, the user can delete, download, or create a video from any grid item without needing a hover interaction
  5. Video generations play inline on mobile with standard controls — no forced fullscreen autoplay breaking iOS audio policy
**Plans:** 2 plans

Plans:
- [x] 05-01-PLAN.md — Grid touch overlay (mobile always-visible, desktop hover-gated) + CANVAS-01/03 regression lock
- [x] 05-02-PLAN.md — Single-view mobile fill (p-0 lg:p-4) + iOS inline video (playsInline + muted)

### Phase 5.1: Mobile Layout Flip — Generator Primary + Gallery Button *(INSERTED 2026-04-19)*
**Goal**: On phones, the generator (mode panels + prompt + controls + brand face) is the primary view by default. The canvas (grid + single view built in Phase 5) is hidden behind a Gallery button in the top bar and opens as a full-screen overlay. Desktop (`lg+`) is unchanged.
**Depends on**: Phase 5
**Requirements**: (new, see `.planning/phases/05.1-mobile-layout-flip/05.1-CONTEXT.md`)
**Success Criteria** (what must be TRUE):
  1. At <`lg`: the generator UI (current sidebar content — nav, mode panels, prompt, controls, brand face, account) renders inline as the primary full-width view; no drawer/backdrop needed on initial load
  2. A "Gallery" button sits in the top bar (replacing the hamburger role on mobile); tapping it opens the canvas (grid + single view from Phase 5) as a full-screen overlay
  3. The gallery overlay has an explicit close/back affordance that returns focus to the generator view
  4. At `lg+`: layout is unchanged (sidebar + canvas side-by-side); zero desktop regression
  5. Phase 5 grid + single-view + iOS video work is reused inside the gallery overlay (not rebuilt)
**Plans:** 2 plans

Plans:
- [x] 05.1-01-PLAN.md — Add galleryOpen store slice + flip Sidebar from mobile-drawer to in-flow primary column
- [x] 05.1-02-PLAN.md — Mobile top bar with Gallery trigger + full-screen gallery overlay + Canvas close button (human-verify)

### Phase 6: Mode Panels on Mobile
**Goal**: All five generation modes plus the Brand Face panel are fully operable on a phone with no feature cuts
**Depends on**: Phase 5
**Requirements**: MODES-01, MODES-02, MODES-03, MODES-04, MODES-05, MODES-06
**Success Criteria** (what must be TRUE):
  1. User runs an On-Model generation end-to-end on a phone: uploads multiple reference images via the multi-image grid, toggles Front/Back view, and receives results in history
  2. User runs a Catalog generation on a phone: uploads a product image, sees the angle grid reflow to 3 columns on small screens, and receives results
  3. User runs a Colorway generation on a phone: adds and removes colors, picks a generation count, and receives results
  4. User runs a Design Copy generation on a phone: uploads a reference image and edits the modifications textarea without any input zoom or layout break
  5. User runs a Video generation on a phone: picks a source image (upload or gallery), edits the prompt, sets duration/aspect/audio, and the generated video plays in-panel
  6. User opens the Brand Face panel on a phone, sees the active face preview, and can switch or clear it without layout break
**Plans:** 6 plans

Plans:
- [x] 06-01-PLAN.md — Phase 6 foundation: i18n keys (OnModel/Catalog/Video) + ImageUpload accept=image/* + On-Model panel (3-col 80px grid, tap-sized Front/Back)
- [x] 06-02-PLAN.md — Catalog panel: angle grid 3→4 at md + localized labels + 40px tap targets
- [x] 06-03-PLAN.md — Colorway panel: wrap-grid chips + 16px input font + 40px add/remove tap targets
- [x] 06-04-PLAN.md — Design Copy panel: textarea auto-grow (field-sizing-content) + 16px font + 3-row minimum
- [x] 06-05-PLAN.md — Video panel: two-button source picker + 3-col gallery + auto-grow prompt + inline aspect-constrained player (playsInline+muted)
- [x] 06-06-PLAN.md — Brand Face panel: 2-col wrap grid on mobile / 4-col lg+ + 40px tap targets on collapse/View All

### Phase 7: Auxiliary Views & Touch Ergonomics
**Goal**: Brand Face management and auth views work on phones, and input/tap ergonomics are correct across the whole app (no iOS zoom, 40px tap targets, native file pickers)
**Depends on**: Phase 6
**Requirements**: AUX-01, AUX-02, TOUCH-01, TOUCH-02, TOUCH-03, TOUCH-04
**Success Criteria** (what must be TRUE):
  1. User opens the Brand Face management view on a phone, sees a single-column grid of faces, and can add, delete, or set-active any face with tap-sized controls
  2. User signs in or signs up on a 667px-tall phone without iOS auto-zooming on any input and with the submit button reachable without scrolling
  3. Every primary interactive control across the app (buttons, toggles, inputs, thumbnails) meets a 40×40px minimum tap target
  4. Every file-upload input opens the native camera/library picker on iOS and Android (via `accept="image/*"` and appropriate `capture` hints)
  5. Typing a long prompt grows the textarea vertically; adjacent buttons wrap to a new row instead of overflowing or truncating
**Plans:** TBD

### Phase 8: Real-Device Verification
**Goal**: The milestone is declared shippable only after every mode runs successfully on real iOS Safari + Android Chrome and a visual QA pass is documented across the three reference phone viewports
**Depends on**: Phase 7
**Requirements**: VERIFY-01, VERIFY-02
**Success Criteria** (what must be TRUE):
  1. Every v1.0 generation mode (On-Model, Catalog, Colorway, Design Copy, Video) has been run end-to-end on a real iOS Safari device and a real Android Chrome device, with at least one successful image/video saved to history and surviving a page refresh on each
  2. A written visual QA pass exists showing no horizontal scroll, no clipped content, no unreadable text, and no broken tap targets at 360×640, 390×844, and 414×896
**Plans:** TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 5.1 → 6 → 7 → 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Auth | v1.0 | 3/3 | Complete | 2026-04-16 |
| 2. Workspace & First Generation | v1.0 | 3/3 | Complete | 2026-04-16 |
| 3. Full Generation Suite & Organization | v1.0 | 6/6 | Complete | 2026-04-18 |
| 4. Responsive Shell | v1.1 | 3/3 | Complete | 2026-04-19 |
| 5. Mobile Canvas | v1.1 | 2/2 | Complete | 2026-04-19 |
| 5.1. Mobile Layout Flip (INSERTED) | v1.1 | 2/2 | Complete | 2026-04-19 |
| 6. Mode Panels on Mobile | v1.1 | 6/6 | Complete | 2026-04-19 |
| 7. Auxiliary Views & Touch Ergonomics | v1.1 | 0/TBD | Not started | - |
| 8. Real-Device Verification | v1.1 | 0/TBD | Not started | - |
